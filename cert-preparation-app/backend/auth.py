"""
Microsoft Entra ID (Azure AD) OIDC authentication via MSAL.
Single-tenant: only users from the Cybersteps tenant can log in.
"""

import secrets
import logging

import msal
from fastapi import Request, HTTPException, status
from fastapi.responses import RedirectResponse
import jwt
from datetime import datetime, timedelta, timezone

from backend.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# MSAL confidential client
_msal_app = msal.ConfidentialClientApplication(
    client_id=settings.ENTRA_CLIENT_ID,
    client_credential=settings.ENTRA_CLIENT_SECRET,
    authority=settings.AUTHORITY,
)

# In-memory store for OAuth state tokens (use Redis in production)
_pending_states: dict[str, float] = {}
_STATE_TTL_SECONDS = 600  # 10 minutes


def get_login_url() -> tuple[str, str]:
    """Generate the Entra ID authorization URL with CSRF state parameter.
    Returns (url, state) tuple."""
    state = secrets.token_urlsafe(32)
    _pending_states[state] = datetime.now(timezone.utc).timestamp()
    # Clean up expired states
    now = datetime.now(timezone.utc).timestamp()
    expired = [s for s, t in _pending_states.items() if now - t > _STATE_TTL_SECONDS]
    for s in expired:
        del _pending_states[s]

    result = _msal_app.get_authorization_request_url(
        scopes=settings.SCOPES,
        redirect_uri=settings.REDIRECT_URI,
        state=state,
    )
    return result, state


def validate_oauth_state(state: str) -> bool:
    """Validate and consume an OAuth state parameter (CSRF protection)."""
    if state in _pending_states:
        created = _pending_states.pop(state)
        age = datetime.now(timezone.utc).timestamp() - created
        return age <= _STATE_TTL_SECONDS
    return False


async def handle_callback(code: str, state: str = ""):
    """Exchange authorization code for tokens, validate tenant, return user info."""
    # Validate OAuth state to prevent CSRF
    if state and not validate_oauth_state(state):
        logger.warning("OAuth state validation failed - possible CSRF attempt")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or expired authentication state. Please try logging in again.",
        )

    result = _msal_app.acquire_token_by_authorization_code(
        code=code,
        scopes=settings.SCOPES,
        redirect_uri=settings.REDIRECT_URI,
    )

    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Auth failed: {result.get('error_description', result['error'])}",
        )

    id_token_claims = result.get("id_token_claims", {})

    # Validate tenant ID — reject non-Cybersteps users
    tid = id_token_claims.get("tid", "")
    if tid != settings.ENTRA_TENANT_ID:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only Cybersteps tenant members can use this application.",
        )

    return {
        "oid": id_token_claims.get("oid"),
        "email": id_token_claims.get("preferred_username", id_token_claims.get("email", "")),
        "name": id_token_claims.get("name", ""),
        "tid": tid,
    }


def create_session_token(user_id: str, email: str) -> str:
    """Create a JWT session token stored in HttpOnly cookie."""
    payload = {
        "sub": str(user_id),
        "email": email,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=8),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm="HS256")


def verify_session_token(token: str) -> dict:
    """Verify and decode a JWT session token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    except jwt.InvalidTokenError as e:
        print(f"JWT Validation Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid session token.")


async def get_current_user(request: Request) -> dict:
    """FastAPI dependency — extract user from session cookie."""
    token = request.cookies.get("session_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    return verify_session_token(token)
