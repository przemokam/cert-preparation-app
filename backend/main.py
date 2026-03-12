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

from backend.config import get_settings
from backend.database import init_db, get_db
from backend.auth import get_login_url, handle_callback, create_session_token, get_current_user, validate_oauth_state
from backend.models import User, ExamSession
from backend.routers import exam, analytics, questions

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

from typing import Optional

async def get_optional_user(request: Request) -> Optional[dict]:
    token = request.cookies.get("session_token")
    if not token:
        return None
    try:
        from backend.auth import verify_session_token
        return verify_session_token(token)
    except Exception:
        return None

@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request, current_user: Optional[dict] = Depends(get_optional_user)):
    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "user": current_user,
    })


@app.get("/exam/{session_id}", response_class=HTMLResponse)
async def exam_page(request: Request, session_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(ExamSession).filter(ExamSession.id == session_id).first()
    deadline_at = ""
    if session and session.deadline_at:
        deadline_at = session.deadline_at.isoformat()
    return templates.TemplateResponse("exam.html", {
        "request": request,
        "user": current_user,
        "session_id": session_id,
        "deadline_at": deadline_at,
    })


@app.get("/learning/{session_id}", response_class=HTMLResponse)
async def learning_page(request: Request, session_id: str, current_user: dict = Depends(get_current_user)):
    return templates.TemplateResponse("learning_session.html", {
        "request": request,
        "user": current_user,
        "session_id": session_id,
    })


@app.get("/results/{session_id}", response_class=HTMLResponse)
async def results_page(request: Request, session_id: str, current_user: dict = Depends(get_current_user)):
    return templates.TemplateResponse("results.html", {
        "request": request,
        "user": current_user,
        "session_id": session_id,
    })


@app.get("/review", response_class=HTMLResponse)
async def review_page(request: Request, current_user: dict = Depends(get_current_user)):
    return templates.TemplateResponse("review.html", {
        "request": request,
        "user": current_user,
    })


@app.get("/learning", response_class=HTMLResponse)
async def learning_overview_page(request: Request, current_user: dict = Depends(get_current_user)):
    return templates.TemplateResponse("learning.html", {
        "request": request,
        "user": current_user,
    })


@app.get("/study-plan", response_class=HTMLResponse)
async def study_plan_page(request: Request, current_user: dict = Depends(get_current_user)):
    return templates.TemplateResponse("study_plan.html", {
        "request": request,
        "user": current_user,
    })


@app.get("/study-plan/day/{day_number}", response_class=HTMLResponse)
async def study_day_page(request: Request, day_number: int, current_user: dict = Depends(get_current_user)):
    import markdown as md_lib
    import re as _re

    if day_number < 1 or day_number > 7:
        from fastapi.responses import RedirectResponse
        return RedirectResponse("/study-plan")

    # Day titles for breadcrumb
    day_titles = {
        1: "Identity & Access (Part 1): RBAC, PIM, MFA",
        2: "Identity & Access (Part 2): App Registrations, Managed Identities",
        3: "Networking Security (Part 1): NSGs, ASGs, Firewall, UDRs",
        4: "Networking Security (Part 2): Private Endpoints, WAF, DDoS",
        5: "Compute, Database & Key Vault Security",
        6: "Defender for Cloud, Azure Policy, Monitoring & Sentinel",
        7: "Full Review, Weak Areas & Exam Simulation",
    }

    # Find the markdown file
    materials_dir = os.path.normpath(os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "..",
        "Claude_skany_materiały", "Materiały do nauki - notion"
    ))

    md_file = None
    if day_number == 7:
        # Day 7 uses the 7-day plan overview (review + simulation)
        md_path = os.path.join(materials_dir, "AZ-500_7-Day_Study_Plan_4.md")
    else:
        md_path = os.path.join(materials_dir, f"AZ-500_Day{day_number}_Study_Material_Solution.md")

    toc_html = ''
    if not os.path.exists(md_path):
        html_content = '<p style="color: var(--c-text-muted);">Study material for this day is not yet available.</p>'
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

    return templates.TemplateResponse("study_day.html", {
        "request": request,
        "user": current_user,
        "day_number": day_number,
        "day_title": day_titles.get(day_number, f"Day {day_number}"),
        "html_content": html_content,
        "toc_html": toc_html,
    })


@app.get("/study-plan/cheatsheet", response_class=HTMLResponse)
async def cheatsheet_page(request: Request, current_user: dict = Depends(get_current_user)):
    import markdown as md_lib
    import re as _re

    materials_dir = os.path.normpath(os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "..",
        "Claude_skany_materiały", "Materiały do nauki - notion"
    ))
    md_path = os.path.join(materials_dir, "AZ-500_7-Day_Study_Plan_4.md")

    html_content = ''
    toc_html = ''
    if os.path.exists(md_path):
        with open(md_path, 'r', encoding='utf-8') as f:
            full_text = f.read()

        # Extract reference sections: Lab Tracker, Module Tracker, Daily Schedule, Quick Reference
        sections_to_extract = [
            "## Lab Completion Tracker",
            "## MS Learn Module Completion Tracker",
            "## Daily Schedule Template",
            "## Quick Reference: All Official Links",
        ]
        # Also extract the exam traps table from Day 7
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
            # Find the end: next ## or end of file
            next_section = full_text.find("\n## ", start + len(section_heading))
            if next_section > 0:
                section_text = full_text[start:next_section].strip()
            else:
                section_text = full_text[start:].strip()
            # Remove trailing --- separator
            if section_text.endswith("---"):
                section_text = section_text[:-3].strip()
            extracted_parts.append(section_text)

        md_text = "\n\n---\n\n".join(extracted_parts)

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

    return templates.TemplateResponse("cheatsheet.html", {
        "request": request,
        "user": current_user,
        "html_content": html_content,
        "toc_html": toc_html,
    })


@app.get("/stats", response_class=HTMLResponse)
async def stats_page(request: Request, current_user: dict = Depends(get_current_user)):
    return templates.TemplateResponse("stats.html", {
        "request": request,
        "user": current_user,
    })
