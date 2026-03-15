"""
AZ-500 Exam Simulator — FastAPI Application
Cybersteps GmbH · cybersteps.de
"""

from fastapi import FastAPI, Request, Depends
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.orm import Session
from typing import Optional
from urllib.parse import parse_qsl, urlencode, urlparse

from backend.config import get_settings
from backend.database import init_db, get_db
from backend.auth import get_login_url, handle_callback, create_session_token, get_current_user, validate_oauth_state
from backend.models import User, ExamSession
from backend.routers import exam, analytics, questions, flashcards

settings = get_settings()

app = FastAPI(
    title="AZ-500 Exam Simulator",
    description="Cybersteps Certification Preparation Platform",
    version="1.0.0",
    docs_url="/api/docs" if settings.ENVIRONMENT == "local" else None,
    redoc_url=None,
)


# ── Security Headers Middleware ───────────────────────────────────

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        if settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "img-src 'self' data:; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "connect-src 'self'"
        )
        return response


app.add_middleware(SecurityHeadersMiddleware)

# ── CORS ──────────────────────────────────────────────────────────

allowed_origins = ["http://localhost:8000"]
if settings.ENVIRONMENT == "production":
    allowed_origins = ["https://az500-exam-cybersteps.azurewebsites.net"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["X-CSRF-Token", "Content-Type"],
)

# ── Static Files & Templates ─────────────────────────────────────

# Serve question exhibit images (more specific mounts must come before general)
import os
_app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # az500-app/
_images_dir = os.path.join(os.path.dirname(_app_root), "images")         # ../images/

# New-style question images from scan_output/question_images/
_question_images_dir = os.path.join(_app_root, "scan_output", "question_images")
if os.path.isdir(_question_images_dir):
    app.mount("/static/images/question_images", StaticFiles(directory=_question_images_dir), name="question_images")

# Old-style images from ../images/
if os.path.isdir(_images_dir):
    app.mount("/static/images", StaticFiles(directory=_images_dir), name="images")

app.mount("/static", StaticFiles(directory="frontend/static"), name="static")

templates = Jinja2Templates(directory="frontend/templates")

# ── Routers ───────────────────────────────────────────────────────

app.include_router(exam.router, prefix="/api/exam", tags=["Exam"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(questions.router, prefix="/api/questions", tags=["Questions"])
app.include_router(flashcards.router, prefix="/api/flashcards", tags=["Flashcards"])


# ── Startup ───────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    init_db()


# ── Exception Handlers ────────────────────────────────────────────

from fastapi import HTTPException
from fastapi.requests import Request
from fastapi.responses import RedirectResponse

@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    # If the user is unauthenticated (e.g. accessing a dashboard without session)
    if exc.status_code == 401:
        # Redirect API-auth errors differently if needed, else globally bounce to login
        if not request.url.path.startswith("/api/"):
            return RedirectResponse(url="/login", status_code=302)
    
    # Otherwise fallback to standard JSON error
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


# ── Auth Routes ───────────────────────────────────────────────────

@app.get("/login")
async def login():
    """Redirect to Entra ID, or show dev-login page in local mode."""
    if settings.ENVIRONMENT == "local":
        return RedirectResponse("/dev-login")
    url, state = get_login_url()
    response = RedirectResponse(url)
    # Store state in a short-lived cookie for callback validation
    response.set_cookie("oauth_state", state, httponly=True, max_age=600, samesite="lax")
    return response


@app.get("/dev-login")
async def dev_login(request: Request, db: Session = Depends(get_db)):
    """DEV ONLY — bypass SSO, create a test user and set session cookie.
    ⚠️ This route only works when ENVIRONMENT=local."""
    if settings.ENVIRONMENT != "local":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Dev login disabled in production")

    # Create or get dev user
    dev_oid = "dev-user-00000000-0000-0000-0000-000000000001"
    dev_email = "admin@cybersteps.de"
    dev_display_name = "Admin"
    user = db.query(User).filter(User.entra_oid == dev_oid).first()
    if not user:
        user = User(
            entra_oid=dev_oid,
            email=dev_email,
            display_name=dev_display_name,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.email = dev_email
        user.display_name = dev_display_name
        db.commit()

    token = create_session_token(user.id, user.email)
    response = RedirectResponse("/", status_code=302)
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=8 * 3600,
    )
    return response


@app.get("/auth/callback")
async def auth_callback(request: Request, code: str = "", state: str = "", db: Session = Depends(get_db)):
    """Handle Entra ID callback — validate state, create/update user, set session cookie."""
    if not code:
        return RedirectResponse("/login")

    user_info = await handle_callback(code, state=state)

    # Upsert user
    user = db.query(User).filter(User.entra_oid == user_info["oid"]).first()
    if not user:
        user = User(
            entra_oid=user_info["oid"],
            email=user_info["email"],
            display_name=user_info["name"],
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.email = user_info["email"]
        user.display_name = user_info["name"]
        db.commit()

    # Create session
    token = create_session_token(user.id, user.email)
    response = RedirectResponse("/", status_code=302)
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
        max_age=8 * 3600,
    )
    return response


@app.get("/logout")
async def logout():
    response = RedirectResponse("/login")
    response.delete_cookie("session_token")
    return response


# ── Page Routes ───────────────────────────────────────────────────

async def get_optional_user(request: Request) -> Optional[dict]:
    token = request.cookies.get("session_token")
    if not token:
        return None
    try:
        from backend.auth import verify_session_token
        return verify_session_token(token)
    except Exception:
        return None


ACTIVE_CERT_COOKIE = "active_certification_slug"
ACTIVE_CERT_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

CERTIFICATION_CATALOG = [
    {
        "certification_slug": "az-500",
        "exam_code": "AZ-500",
        "vendor_slug": "microsoft",
        "vendor_name": "Microsoft",
        "title": "Azure Security Engineer Associate",
        "level": "Associate",
        "is_published": True,
        "description": "Live question bank, study plan, materials, mock exams, review, and stats.",
    },
    {
        "certification_slug": "az-900",
        "exam_code": "AZ-900",
        "vendor_slug": "microsoft",
        "vendor_name": "Microsoft",
        "title": "Azure Fundamentals",
        "level": "Fundamentals",
        "is_published": False,
        "description": "Navigation slot reserved for the next Microsoft fundamentals track.",
    },
    {
        "certification_slug": "sc-900",
        "exam_code": "SC-900",
        "vendor_slug": "microsoft",
        "vendor_name": "Microsoft",
        "title": "Security, Compliance, and Identity Fundamentals",
        "level": "Fundamentals",
        "is_published": False,
        "description": "Placeholder card to validate the multi-cert shell structure.",
    },
    {
        "certification_slug": "ceh",
        "exam_code": "CEH",
        "vendor_slug": "ec-council",
        "vendor_name": "EC-Council",
        "title": "Certified Ethical Hacker",
        "level": "Professional",
        "is_published": True,
        "description": "573 verified questions across 9 CEH domains, mock exams (125 questions, 4 hours), study plan, and materials.",
    },
    {
        "certification_slug": "security-plus",
        "exam_code": "Security+",
        "vendor_slug": "comptia",
        "vendor_name": "CompTIA",
        "title": "Security+",
        "level": "Core",
        "is_published": False,
        "description": "Reserved for a future non-Microsoft certification path.",
    },
]
CERTIFICATIONS_BY_SLUG = {cert["certification_slug"]: cert for cert in CERTIFICATION_CATALOG}
MATERIAL_DAY_TITLES = {
    "az-500": {
        1: "Identity & Access (Part 1): RBAC, PIM, MFA",
        2: "Identity & Access (Part 2): App Registrations, Managed Identities",
        3: "Networking Security (Part 1): NSGs, ASGs, Firewall, UDRs",
        4: "Networking Security (Part 2): Private Endpoints, WAF, DDoS",
        5: "Compute, Database & Key Vault Security",
        6: "Defender for Cloud, Azure Policy, Monitoring & Sentinel",
        7: "Full Review, Weak Areas & Exam Simulation",
    },
    "ceh": {
        1: "Info Security Overview & Reconnaissance Techniques",
        2: "System Hacking, Vulnerability Analysis & Malware",
        3: "Sniffing, Social Engineering & Denial-of-Service",
        4: "Session Hijacking & IDS/Firewall/Honeypot Evasion",
        5: "Web Application Hacking & SQL Injection",
        6: "Wireless, Mobile, IoT & OT Hacking",
        7: "Cloud Computing, Cryptography & Final Review",
    },
}


def _get_materials_root_dir() -> str:
    return os.path.normpath(os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "..",
        "learning_materials"
    ))


def _get_material_day_path(certification_slug: Optional[str], day_number: int) -> Optional[str]:
    materials_dir = _get_materials_root_dir()
    if certification_slug == "az-500":
        if day_number == 7:
            return os.path.join(materials_dir, "AZ-500", "AZ-500_7-Day_Study_Plan_4.md")
        return os.path.join(materials_dir, "AZ-500", f"AZ-500_Day{day_number}_Study_Material_Solution.md")
    elif certification_slug == "ceh":
        return os.path.join(materials_dir, "CEH", f"CEH_Day{day_number}_Study_Material.md")
    return None


def _get_cheatsheet_source_path(certification_slug: Optional[str]) -> Optional[str]:
    materials_dir = _get_materials_root_dir()
    if certification_slug == "az-500":
        return os.path.join(materials_dir, "AZ-500", "AZ-500_7-Day_Study_Plan_4.md")
    elif certification_slug == "ceh":
        return os.path.join(materials_dir, "CEH", "CEH_Cheatsheet.md")
    return None


def _build_url(path: str, **params) -> str:
    clean_params = {key: value for key, value in params.items() if value not in (None, "")}
    if not clean_params:
        return path
    return f"{path}?{urlencode(clean_params)}"


def _current_relative_url(request: Request, strip_params: Optional[set[str]] = None) -> str:
    strip_params = strip_params or set()
    query_items = [(key, value) for key, value in request.query_params.multi_items() if key not in strip_params]
    query = urlencode(query_items)
    return f"{request.url.path}?{query}" if query else request.url.path


def _get_catalog_cert(slug: Optional[str], *, published_only: bool = True):
    if not slug:
        return None
    cert = CERTIFICATIONS_BY_SLUG.get(str(slug).strip().lower())
    if not cert:
        return None
    if published_only and not cert["is_published"]:
        return None
    return cert


def _get_catalog_cert_by_code(code: Optional[str]):
    if not code:
        return None
    normalized = str(code).strip().upper()
    for cert in CERTIFICATION_CATALOG:
        if cert["exam_code"].upper() == normalized:
            return cert
    return None


def _get_persisted_active_cert(request: Request):
    return _get_catalog_cert(request.cookies.get(ACTIVE_CERT_COOKIE))


def _set_active_cert_cookie(response, certification_slug: str):
    response.set_cookie(
        key=ACTIVE_CERT_COOKIE,
        value=certification_slug,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
        max_age=ACTIVE_CERT_COOKIE_MAX_AGE,
        path="/",
    )


def _sanitize_next_path(next_value: Optional[str]) -> Optional[str]:
    if not next_value:
        return None
    parsed = urlparse(next_value)
    if parsed.scheme or parsed.netloc or not parsed.path.startswith("/"):
        return None

    path = parsed.path or "/"
    params = dict(parse_qsl(parsed.query, keep_blank_values=False))

    allowed_exact_paths = {
        "/",
        "/dashboard",
        "/learn",
        "/learning",
        "/mock-exams",
        "/study-plan",
        "/materials",
        "/materials/cheatsheet",
        "/study-plan/cheatsheet",
        "/review",
        "/stats",
        "/certifications",
    }
    is_allowed_day_path = path.startswith("/materials/day/") or path.startswith("/study-plan/day/")
    if path not in allowed_exact_paths and not is_allowed_day_path:
        return None

    if path in {"/review", "/stats"}:
        scope = params.get("scope")
        if scope == "all":
            return _build_url(path, scope="all")
        if scope == "active":
            return _build_url(path, scope="active")
        return path

    if path == "/":
        return "/dashboard"

    return path


def _rewrite_next_for_cert(next_value: Optional[str], certification_slug: str) -> str:
    sanitized = _sanitize_next_path(next_value) or "/dashboard"
    parsed = urlparse(sanitized)
    path = parsed.path or "/dashboard"
    params = dict(parse_qsl(parsed.query, keep_blank_values=False))

    if path in {"/", "/certifications"}:
        return _build_url("/dashboard", cert=certification_slug)
    if path == "/learning":
        return _build_url("/learn", cert=certification_slug)
    if path in {"/dashboard", "/learn", "/mock-exams", "/flashcards", "/study-plan", "/materials"}:
        return _build_url(path, cert=certification_slug)
    if path.startswith("/study-plan/day/"):
        path = path.replace("/study-plan/day/", "/materials/day/", 1)
    if path == "/study-plan/cheatsheet":
        path = "/materials/cheatsheet"
    if path.startswith("/materials/day/") or path == "/materials/cheatsheet":
        return _build_url(path, cert=certification_slug)
    if path in {"/review", "/stats"}:
        if params.get("scope") == "all":
            return _build_url(path, scope="all")
        return _build_url(path, scope="active", cert=certification_slug)
    return _build_url("/dashboard", cert=certification_slug)


def _hub_redirect(request: Request, *, next_path: Optional[str] = None, reason: str = "missing_cert"):
    return RedirectResponse(
        _build_url(
            "/certifications",
            next=_sanitize_next_path(next_path or _current_relative_url(request, {"cert", "reason"})),
            reason=reason,
        ),
        status_code=302,
    )


def _cert_scoped_nav_href(path: str, active_cert) -> str:
    if active_cert:
        return _build_url(path, cert=active_cert["certification_slug"])
    return _build_url("/certifications", next=path)


def _shared_scope_nav_href(path: str, active_cert, *, scope: str | None = None) -> str:
    target_scope = scope
    if target_scope not in {"active", "all"}:
        target_scope = "active" if active_cert else "all"

    if target_scope == "active":
        if active_cert:
            return _build_url(path, scope="active", cert=active_cert["certification_slug"])
        return _build_url("/certifications", next=_build_url(path, scope="active"))

    return _build_url(path, scope="all")


def _resolve_shared_scope_route(request: Request, canonical_path: str):
    requested_scope = request.query_params.get("scope")
    query_cert = request.query_params.get("cert")
    persisted_active_cert = _get_persisted_active_cert(request)

    if requested_scope not in {None, "", "active", "all"}:
        return None, None, None, RedirectResponse(
            _shared_scope_nav_href(canonical_path, persisted_active_cert),
            status_code=302,
        )

    if requested_scope in {None, ""}:
        return None, None, None, RedirectResponse(
            _shared_scope_nav_href(canonical_path, persisted_active_cert),
            status_code=302,
        )

    if requested_scope == "all":
        if query_cert:
            return None, None, None, RedirectResponse(
                _build_url(canonical_path, scope="all"),
                status_code=302,
            )
        return "all", None, None, None

    if query_cert:
        cert = _get_catalog_cert(query_cert)
        if cert:
            return "active", cert, "query", None
        return None, None, None, _hub_redirect(
            request,
            next_path=_build_url(canonical_path, scope="active"),
            reason="invalid_cert",
        )

    if persisted_active_cert:
        return None, None, None, RedirectResponse(
            _build_url(canonical_path, scope="active", cert=persisted_active_cert["certification_slug"]),
            status_code=302,
        )

    return None, None, None, _hub_redirect(
        request,
        next_path=_build_url(canonical_path, scope="active"),
        reason="missing_cert",
    )


def _build_shell(request: Request, current_page: str, *, resolved_cert=None, persisted_active_cert=None,
                 context_mode: str = "cert", context_note: Optional[str] = None,
                 breadcrumbs: Optional[list[dict]] = None):
    nav_cert = persisted_active_cert or resolved_cert
    switch_target = _sanitize_next_path(_current_relative_url(request, {"cert", "reason"})) or "/dashboard"
    return {
        "current_page": current_page,
        "nav": {
            "hub": "/certifications",
            "dashboard": _cert_scoped_nav_href("/dashboard", nav_cert),
            "learn": _cert_scoped_nav_href("/learn", nav_cert),
            "mock_exams": _cert_scoped_nav_href("/mock-exams", nav_cert),
            "flashcards": _cert_scoped_nav_href("/flashcards", nav_cert),
            "study_plan": _cert_scoped_nav_href("/study-plan", nav_cert),
            "materials": _cert_scoped_nav_href("/materials", nav_cert),
            "review": _shared_scope_nav_href("/review", nav_cert),
            "stats": _shared_scope_nav_href("/stats", nav_cert),
        },
        "switch_href": _build_url("/certifications", next=switch_target),
        "active_cert": nav_cert,
        "resolved_cert": resolved_cert,
        "persisted_active_cert": persisted_active_cert,
        "context_mode": context_mode,
        "context_note": context_note,
        "breadcrumbs": breadcrumbs or [],
    }


def _render_page(template_name: str, request: Request, current_user, *, current_page: str,
                 resolved_cert=None, persisted_active_cert=None, context_mode: str = "cert",
                 context_note: Optional[str] = None, breadcrumbs: Optional[list[dict]] = None,
                 persist_cert_slug: Optional[str] = None, **context):
    response = templates.TemplateResponse(template_name, {
        "request": request,
        "user": current_user,
        "shell": _build_shell(
            request,
            current_page,
            resolved_cert=resolved_cert,
            persisted_active_cert=persisted_active_cert,
            context_mode=context_mode,
            context_note=context_note,
            breadcrumbs=breadcrumbs,
        ),
        **context,
    })
    if persist_cert_slug:
        _set_active_cert_cookie(response, persist_cert_slug)
    return response


def _resolve_cert_scoped_route(request: Request, canonical_path: str):
    query_cert = request.query_params.get("cert")
    if query_cert:
        cert = _get_catalog_cert(query_cert)
        if cert:
            return cert, "query", None
        return None, None, _hub_redirect(request, next_path=canonical_path, reason="invalid_cert")

    persisted_active_cert = _get_persisted_active_cert(request)
    if persisted_active_cert:
        return persisted_active_cert, "persisted", RedirectResponse(
            _build_url(canonical_path, cert=persisted_active_cert["certification_slug"]),
            status_code=302,
        )

    return None, None, _hub_redirect(request, next_path=canonical_path, reason="missing_cert")


def _resolve_session_cert(session: Optional[ExamSession], request: Request):
    if session and getattr(session, "certification", None):
        session_cert = _get_catalog_cert_by_code(session.certification.code)
        if session_cert:
            return session_cert
    return _get_persisted_active_cert(request) or _get_catalog_cert("az-500")

@app.get("/", response_class=HTMLResponse)
async def root_resolver(request: Request):
    active_cert = _get_persisted_active_cert(request)
    if active_cert:
        return RedirectResponse(_build_url("/dashboard", cert=active_cert["certification_slug"]), status_code=302)
    return RedirectResponse("/certifications", status_code=302)


@app.get("/certifications", response_class=HTMLResponse)
async def certifications_page(request: Request, current_user: Optional[dict] = Depends(get_optional_user)):
    persisted_active_cert = _get_persisted_active_cert(request)
    next_path = _sanitize_next_path(request.query_params.get("next")) or "/dashboard"
    cards = []
    for cert in CERTIFICATION_CATALOG:
        cards.append({
            **cert,
            "is_active": bool(persisted_active_cert and cert["certification_slug"] == persisted_active_cert["certification_slug"]),
            "select_href": _build_url(f"/certifications/select/{cert['certification_slug']}", next=next_path),
        })
    return _render_page(
        "certifications.html",
        request,
        current_user,
        current_page="hub",
        persisted_active_cert=persisted_active_cert,
        context_mode="hub",
        breadcrumbs=[{"label": "Certification Hub"}],
        certifications=cards,
        next_path=next_path,
        hub_reason=request.query_params.get("reason", ""),
    )


@app.get("/certifications/select/{certification_slug}")
async def select_certification(certification_slug: str, request: Request):
    cert = _get_catalog_cert(certification_slug)
    if not cert:
        return RedirectResponse(_build_url("/certifications", reason="invalid_cert"), status_code=302)
    response = RedirectResponse(
        _rewrite_next_for_cert(request.query_params.get("next"), cert["certification_slug"]),
        status_code=302,
    )
    _set_active_cert_cookie(response, cert["certification_slug"])
    return response


@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard_page(request: Request, current_user: Optional[dict] = Depends(get_optional_user)):
    resolved_cert, source, redirect = _resolve_cert_scoped_route(request, "/dashboard")
    if redirect:
        return redirect
    return _render_page(
        "dashboard.html",
        request,
        current_user,
        current_page="dashboard",
        resolved_cert=resolved_cert,
        persisted_active_cert=_get_persisted_active_cert(request),
        breadcrumbs=[{"label": "Certification Hub", "href": "/certifications"}, {"label": "Dashboard"}],
        persist_cert_slug=resolved_cert["certification_slug"] if source == "query" else None,
    )


@app.get("/exam/{session_id}")
async def exam_page_legacy(request: Request, session_id: str):
    target = f"/mock-exams/session/{session_id}"
    if request.query_params:
        target = _build_url(target, **dict(request.query_params))
    return RedirectResponse(target, status_code=302)


@app.get("/mock-exams/session/{session_id}", response_class=HTMLResponse)
async def exam_page(request: Request, session_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(ExamSession).filter(ExamSession.id == session_id).first()
    resolved_cert = _resolve_session_cert(session, request)
    deadline_at = session.deadline_at.isoformat() if session and session.deadline_at else ""
    nav_cert = _get_persisted_active_cert(request) or resolved_cert
    return _render_page(
        "exam.html",
        request,
        current_user,
        current_page="mock_exams",
        resolved_cert=resolved_cert,
        persisted_active_cert=_get_persisted_active_cert(request),
        context_mode="session",
        context_note="Session locked",
        breadcrumbs=[
            {"label": "Certification Hub", "href": "/certifications"},
            {"label": "Mock exams", "href": _cert_scoped_nav_href("/mock-exams", nav_cert)},
            {"label": "Session"},
        ],
        session_id=session_id,
        deadline_at=deadline_at,
    )


@app.get("/learning/{session_id}")
async def learning_page_legacy(request: Request, session_id: str):
    target = f"/learn/session/{session_id}"
    if request.query_params:
        target = _build_url(target, **dict(request.query_params))
    return RedirectResponse(target, status_code=302)


@app.get("/learn/session/{session_id}", response_class=HTMLResponse)
async def learning_page(request: Request, session_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(ExamSession).filter(ExamSession.id == session_id).first()
    resolved_cert = _resolve_session_cert(session, request)
    nav_cert = _get_persisted_active_cert(request) or resolved_cert
    return _render_page(
        "learning_session.html",
        request,
        current_user,
        current_page="learning",
        resolved_cert=resolved_cert,
        persisted_active_cert=_get_persisted_active_cert(request),
        context_mode="session",
        context_note="Session locked",
        breadcrumbs=[
            {"label": "Certification Hub", "href": "/certifications"},
            {"label": "Learn", "href": _cert_scoped_nav_href("/learn", nav_cert)},
            {"label": "Session"},
        ],
        session_id=session_id,
    )


@app.get("/results/{session_id}")
async def results_page_legacy(request: Request, session_id: str):
    target = f"/mock-exams/results/{session_id}"
    if request.query_params:
        target = _build_url(target, **dict(request.query_params))
    return RedirectResponse(target, status_code=302)


@app.get("/mock-exams/results/{session_id}", response_class=HTMLResponse)
async def results_page(request: Request, session_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(ExamSession).filter(ExamSession.id == session_id).first()
    resolved_cert = _resolve_session_cert(session, request)
    nav_cert = _get_persisted_active_cert(request) or resolved_cert
    return _render_page(
        "results.html",
        request,
        current_user,
        current_page="mock_exams",
        resolved_cert=resolved_cert,
        persisted_active_cert=_get_persisted_active_cert(request),
        context_mode="session",
        context_note="Session locked",
        breadcrumbs=[
            {"label": "Certification Hub", "href": "/certifications"},
            {"label": "Mock exams", "href": _cert_scoped_nav_href("/mock-exams", nav_cert)},
            {"label": "Results"},
        ],
        session_id=session_id,
    )


@app.get("/review", response_class=HTMLResponse)
async def review_page(request: Request, current_user: dict = Depends(get_current_user)):
    page_scope, resolved_cert, source, redirect = _resolve_shared_scope_route(request, "/review")
    if redirect:
        return redirect
    persisted_active_cert = _get_persisted_active_cert(request)
    nav_cert = resolved_cert or persisted_active_cert
    return _render_page(
        "review.html",
        request,
        current_user,
        current_page="review",
        resolved_cert=resolved_cert,
        persisted_active_cert=persisted_active_cert,
        context_mode="cert" if page_scope == "active" else "global",
        context_note="Active certification scope" if page_scope == "active" else "All certifications scope",
        breadcrumbs=[{"label": "Certification Hub", "href": "/certifications"}, {"label": "Review"}],
        persist_cert_slug=resolved_cert["certification_slug"] if source == "query" and resolved_cert else None,
        page_scope=page_scope,
        scope_active_href=_shared_scope_nav_href("/review", nav_cert, scope="active"),
        scope_all_href=_shared_scope_nav_href("/review", nav_cert, scope="all"),
        review_session_enabled=page_scope == "active" and bool(resolved_cert),
    )


@app.get("/learning")
async def learning_overview_legacy(request: Request):
    target = "/learn"
    if request.query_params:
        target = _build_url(target, **dict(request.query_params))
    return RedirectResponse(target, status_code=302)


@app.get("/learn", response_class=HTMLResponse)
async def learning_overview_page(request: Request, current_user: dict = Depends(get_current_user)):
    resolved_cert, source, redirect = _resolve_cert_scoped_route(request, "/learn")
    if redirect:
        return redirect
    return _render_page(
        "learning.html",
        request,
        current_user,
        current_page="learning",
        resolved_cert=resolved_cert,
        persisted_active_cert=_get_persisted_active_cert(request),
        breadcrumbs=[{"label": "Certification Hub", "href": "/certifications"}, {"label": "Learn"}],
        persist_cert_slug=resolved_cert["certification_slug"] if source == "query" else None,
    )


@app.get("/study-plan", response_class=HTMLResponse)
async def study_plan_page(request: Request, current_user: dict = Depends(get_current_user)):
    resolved_cert, source, redirect = _resolve_cert_scoped_route(request, "/study-plan")
    if redirect:
        return redirect
    cert_slug = resolved_cert["certification_slug"]
    materials_available = bool(_get_cheatsheet_source_path(cert_slug))
    return _render_page(
        "study_plan.html",
        request,
        current_user,
        current_page="study_plan",
        resolved_cert=resolved_cert,
        persisted_active_cert=_get_persisted_active_cert(request),
        breadcrumbs=[{"label": "Certification Hub", "href": "/certifications"}, {"label": "Study plan"}],
        persist_cert_slug=cert_slug if source == "query" else None,
        study_plan_available=materials_available,
        materials_href=_build_url("/materials", cert=cert_slug),
        materials_cheatsheet_href=_build_url("/materials/cheatsheet", cert=cert_slug),
    )


@app.get("/mock-exams", response_class=HTMLResponse)
async def mock_exams_page(request: Request, current_user: dict = Depends(get_current_user)):
    resolved_cert, source, redirect = _resolve_cert_scoped_route(request, "/mock-exams")
    if redirect:
        return redirect
    return _render_page(
        "mock_exams.html",
        request,
        current_user,
        current_page="mock_exams",
        resolved_cert=resolved_cert,
        persisted_active_cert=_get_persisted_active_cert(request),
        breadcrumbs=[{"label": "Certification Hub", "href": "/certifications"}, {"label": "Mock exams"}],
        persist_cert_slug=resolved_cert["certification_slug"] if source == "query" else None,
    )


@app.get("/flashcards", response_class=HTMLResponse)
async def flashcards_page(request: Request, current_user: dict = Depends(get_current_user)):
    resolved_cert, source, redirect = _resolve_cert_scoped_route(request, "/flashcards")
    if redirect:
        return redirect
    return _render_page(
        "flashcards.html",
        request,
        current_user,
        current_page="flashcards",
        resolved_cert=resolved_cert,
        persisted_active_cert=_get_persisted_active_cert(request),
        breadcrumbs=[{"label": "Certification Hub", "href": "/certifications"}, {"label": "Flashcards"}],
        persist_cert_slug=resolved_cert["certification_slug"] if source == "query" else None,
    )


@app.get("/materials", response_class=HTMLResponse)
async def materials_page(request: Request, current_user: dict = Depends(get_current_user)):
    resolved_cert, source, redirect = _resolve_cert_scoped_route(request, "/materials")
    if redirect:
        return redirect
    cert_slug = resolved_cert["certification_slug"]
    materials_available = bool(_get_cheatsheet_source_path(cert_slug))
    material_days = [
        {
            "day_number": day_number,
            "title": title,
            "href": _build_url(f"/materials/day/{day_number}", cert=cert_slug),
        }
        for day_number, title in MATERIAL_DAY_TITLES.get(cert_slug, {}).items()
    ] if materials_available else []
    return _render_page(
        "materials.html",
        request,
        current_user,
        current_page="materials",
        resolved_cert=resolved_cert,
        persisted_active_cert=_get_persisted_active_cert(request),
        breadcrumbs=[{"label": "Certification Hub", "href": "/certifications"}, {"label": "Materials"}],
        persist_cert_slug=cert_slug if source == "query" else None,
        materials_available=materials_available,
        material_days=material_days,
        cheatsheet_href=_build_url("/materials/cheatsheet", cert=cert_slug),
        study_plan_href=_build_url("/study-plan", cert=cert_slug),
    )


@app.get("/study-plan/day/{day_number}")
async def legacy_study_day_redirect(day_number: int, request: Request):
    return RedirectResponse(_build_url(f"/materials/day/{day_number}", cert=request.query_params.get("cert")), status_code=302)


@app.get("/materials/day/{day_number}", response_class=HTMLResponse)
async def study_day_page(request: Request, day_number: int, current_user: dict = Depends(get_current_user)):
    import markdown as md_lib
    import re as _re

    resolved_cert, source, redirect = _resolve_cert_scoped_route(request, f"/materials/day/{day_number}")
    if redirect:
        return redirect

    if day_number < 1 or day_number > 7:
        return RedirectResponse(_build_url("/materials", cert=resolved_cert["certification_slug"]), status_code=302)

    cert_slug = resolved_cert["certification_slug"]
    md_path = _get_material_day_path(cert_slug, day_number)

    toc_html = ''
    if not md_path or not os.path.exists(md_path):
        html_content = (
            f'<p style="color: var(--c-text-muted);">Study material for '
            f'{resolved_cert["exam_code"]} day {day_number} is not bundled yet.</p>'
        )
    else:
        with open(md_path, 'r', encoding='utf-8') as f:
            md_text = f.read()

        # For Day 7, extract Morning Checklist + Evening Review (skip Afternoon Exam Simulation)
        if day_number == 7:
            day7_start = md_text.find("## Day 7")
            if day7_start != -1:
                # Find the sections
                after_day7 = md_text[day7_start:]
                # Find where reference sections start (Lab Completion Tracker etc.)
                ref_start = after_day7.find("\n## Lab Completion Tracker")
                if ref_start == -1:
                    ref_start = after_day7.find("\n## MS Learn Module")
                if ref_start > 0:
                    after_day7 = after_day7[:ref_start]

                # Remove the "Afternoon: Exam Simulation" section
                afternoon_start = after_day7.find("### \u2753 Afternoon")
                if afternoon_start == -1:
                    afternoon_start = after_day7.find("### Afternoon")
                if afternoon_start > 0:
                    # Find the next ### section after afternoon
                    evening_start = after_day7.find("### ", afternoon_start + 5)
                    if evening_start > 0:
                        after_day7 = after_day7[:afternoon_start] + after_day7[evening_start:]
                    else:
                        after_day7 = after_day7[:afternoon_start]

                md_text = after_day7

        # Convert markdown to HTML with TOC
        md_converter = md_lib.Markdown(
            extensions=['tables', 'fenced_code', 'sane_lists', 'toc'],
            extension_configs={'toc': {'toc_depth': '2-3'}},
            output_format='html'
        )
        html_content = md_converter.convert(md_text)
        toc_html = md_converter.toc

        # Post-process: style exam trap / warning blockquotes
        trap_keywords = r'Exam trap|exam trap|EXAM TRAP|Important|WARNING|Warning|Cost Warning|\U0001f6a8'
        def _style_blockquote(m):
            inner = m.group(1)
            if _re.search(trap_keywords, inner):
                return f'<blockquote class="exam-trap">{inner}</blockquote>'
            return m.group(0)

        html_content = _re.sub(
            r'<blockquote>(.*?)</blockquote>',
            _style_blockquote,
            html_content, flags=_re.DOTALL
        )

        # Convert [ ] and [x] checkboxes in list items
        html_content = html_content.replace(
            '<li>[ ] ', '<li><input type="checkbox" disabled> '
        ).replace(
            '<li>[x] ', '<li><input type="checkbox" checked disabled> '
        )
    return _render_page(
        "study_day.html",
        request,
        current_user,
        current_page="materials",
        resolved_cert=resolved_cert,
        persisted_active_cert=_get_persisted_active_cert(request),
        context_note="Certification-specific materials",
        breadcrumbs=[
            {"label": "Certification Hub", "href": "/certifications"},
            {"label": "Materials", "href": _build_url("/materials", cert=cert_slug)},
            {"label": f"Day {day_number}"},
        ],
        persist_cert_slug=resolved_cert["certification_slug"] if source == "query" else None,
        day_number=day_number,
        day_title=MATERIAL_DAY_TITLES.get(cert_slug, {}).get(day_number, f"Day {day_number}"),
        html_content=html_content,
        toc_html=toc_html,
        back_href=_build_url("/materials", cert=cert_slug),
        prev_href=_build_url(f"/materials/day/{day_number - 1}", cert=cert_slug) if day_number > 1 else None,
        next_href=_build_url(f"/materials/day/{day_number + 1}", cert=cert_slug) if day_number < 7 else None,
    )


@app.get("/study-plan/cheatsheet")
async def legacy_cheatsheet_redirect(request: Request):
    return RedirectResponse(_build_url("/materials/cheatsheet", cert=request.query_params.get("cert")), status_code=302)


@app.get("/materials/cheatsheet", response_class=HTMLResponse)
async def cheatsheet_page(request: Request, current_user: dict = Depends(get_current_user)):
    import markdown as md_lib

    resolved_cert, source, redirect = _resolve_cert_scoped_route(request, "/materials/cheatsheet")
    if redirect:
        return redirect

    cert_slug = resolved_cert["certification_slug"]
    md_path = _get_cheatsheet_source_path(cert_slug)

    html_content = ''
    toc_html = ''
    if md_path and os.path.exists(md_path):
        with open(md_path, 'r', encoding='utf-8') as f:
            full_text = f.read()

        if cert_slug == "az-500":
            # AZ-500: Extract specific reference sections from the study plan file
            sections_to_extract = [
                "## Lab Completion Tracker",
                "## MS Learn Module Completion Tracker",
                "## Daily Schedule Template",
                "## Quick Reference: All Official Links",
            ]
            exam_traps_text = ""
            traps_start = full_text.find("**High-Frequency Exam Traps:**")
            if traps_start > 0:
                traps_end = full_text.find("\n---", traps_start)
                if traps_end > 0:
                    exam_traps_text = "## High-Frequency Exam Traps\n\n" + full_text[traps_start + len("**High-Frequency Exam Traps:**"):traps_end].strip()

            extracted_parts = []
            if exam_traps_text:
                extracted_parts.append(exam_traps_text)

            for section_heading in sections_to_extract:
                start = full_text.find(section_heading)
                if start == -1:
                    continue
                next_section = full_text.find("\n## ", start + len(section_heading))
                if next_section > 0:
                    section_text = full_text[start:next_section].strip()
                else:
                    section_text = full_text[start:].strip()
                if section_text.endswith("---"):
                    section_text = section_text[:-3].strip()
                extracted_parts.append(section_text)

            md_text = "\n\n---\n\n".join(extracted_parts)
        else:
            # Other certs (CEH, etc.): use the entire cheatsheet file as-is
            md_text = full_text

        md_converter = md_lib.Markdown(
            extensions=['tables', 'fenced_code', 'sane_lists', 'toc'],
            extension_configs={'toc': {'toc_depth': '2-3'}},
            output_format='html'
        )
        html_content = md_converter.convert(md_text)
        toc_html = md_converter.toc

        # Convert checkboxes
        html_content = html_content.replace(
            '<li>[ ] ', '<li><input type="checkbox" disabled> '
        ).replace(
            '<li>[x] ', '<li><input type="checkbox" checked disabled> '
        )
        # Convert checkbox cells in tables
        html_content = html_content.replace(
            '<td>\u2b1c</td>', '<td><input type="checkbox" disabled></td>'
        )

    else:
        html_content = (
            f'<p style="color: var(--c-text-muted);">The quick-reference cheatsheet '
            f'for {resolved_cert["exam_code"]} is not bundled yet.</p>'
        )

    return _render_page(
        "cheatsheet.html",
        request,
        current_user,
        current_page="materials",
        resolved_cert=resolved_cert,
        persisted_active_cert=_get_persisted_active_cert(request),
        context_note="Certification-specific materials",
        breadcrumbs=[
            {"label": "Certification Hub", "href": "/certifications"},
            {"label": "Materials", "href": _build_url("/materials", cert=cert_slug)},
            {"label": "Cheatsheet"},
        ],
        persist_cert_slug=resolved_cert["certification_slug"] if source == "query" else None,
        html_content=html_content,
        toc_html=toc_html,
        back_href=_build_url("/materials", cert=cert_slug),
    )


@app.get("/stats", response_class=HTMLResponse)
async def stats_page(request: Request, current_user: dict = Depends(get_current_user)):
    page_scope, resolved_cert, source, redirect = _resolve_shared_scope_route(request, "/stats")
    if redirect:
        return redirect
    persisted_active_cert = _get_persisted_active_cert(request)
    nav_cert = resolved_cert or persisted_active_cert
    return _render_page(
        "stats.html",
        request,
        current_user,
        current_page="stats",
        resolved_cert=resolved_cert,
        persisted_active_cert=persisted_active_cert,
        context_mode="cert" if page_scope == "active" else "global",
        context_note="Certification performance view" if page_scope == "active" else "All certifications scope",
        breadcrumbs=[{"label": "Certification Hub", "href": "/certifications"}, {"label": "Stats"}],
        persist_cert_slug=resolved_cert["certification_slug"] if source == "query" and resolved_cert else None,
        page_scope=page_scope,
        scope_active_href=_shared_scope_nav_href("/stats", nav_cert, scope="active"),
        scope_all_href=_shared_scope_nav_href("/stats", nav_cert, scope="all"),
    )
