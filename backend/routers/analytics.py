"""
Analytics API — mastery stats, streaks, domain breakdown, review pool, dashboard.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, Integer

from backend.database import get_db
from backend.auth import get_current_user
from backend.models import (
    Certification,
    UserAnswer, ExamSession, Question, QuestionSkill, Skill, Domain,
    ReviewPoolItem, User, QuestionMastery, StudyStreak, StudyProgress
)

router = APIRouter()


def _utcnow():
    """Return current UTC time as naive datetime (matches SQLite storage)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _resolve_requested_certification(db: Session, certification_code: str | None):
    if not certification_code:
        return None
    return db.query(Certification).filter(Certification.code == certification_code.strip().upper()).first()


def _progress_section_storage_key(section: str, certification_code: str | None) -> str:
    return f"{certification_code}::{section}" if certification_code else section


def _progress_section_match(stored_section: str, certification_code: str | None) -> str | None:
    if certification_code:
        prefix = f"{certification_code}::"
        if stored_section.startswith(prefix):
            return stored_section[len(prefix):]
        if certification_code == "AZ-500" and "::" not in stored_section:
            return stored_section
        return None
    if "::" in stored_section:
        return None
    return stored_section


@router.get("/dashboard")
async def get_dashboard(
    certification_code: str | None = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Combined dashboard data: mastery, streak, recent sessions, due reviews."""
    user_id = current_user["sub"]
    cert = _resolve_requested_certification(db, certification_code)
    invalid_cert = bool(certification_code and not cert)

    # Mastery per domain
    domains_query = db.query(Domain)
    if cert:
        domains_query = domains_query.filter(Domain.certification_id == cert.id)
    domains = [] if invalid_cert else domains_query.all()
    domain_mastery = []
    total_mastered = 0
    total_questions = 0

    for domain in domains:
        # Count questions in this domain
        q_count = (
            db.query(Question.id)
            .join(QuestionSkill).join(Skill)
            .filter(
                Skill.domain_id == domain.id,
                Question.is_active == True,
                Question.certification_id == cert.id if cert else True,
            )
            .count()
        )
        # Count mastery levels
        mastery_rows = (
            db.query(QuestionMastery.box, func.count(QuestionMastery.id))
            .join(Question, QuestionMastery.question_id == Question.id)
            .join(QuestionSkill, Question.id == QuestionSkill.question_id)
            .join(Skill, QuestionSkill.skill_id == Skill.id)
            .filter(
                QuestionMastery.user_id == user_id,
                Skill.domain_id == domain.id,
                Question.certification_id == cert.id if cert else True,
            )
            .group_by(QuestionMastery.box)
            .all()
        )
        box_counts = dict(mastery_rows)
        mastered = box_counts.get(4, 0) + box_counts.get(5, 0)
        learning = box_counts.get(2, 0) + box_counts.get(3, 0)
        new_wrong = box_counts.get(1, 0)
        unseen = q_count - sum(box_counts.values())

        # Mastery percentage: box 4-5 = 100%, box 3 = 75%, box 2 = 50%, box 1 = 25%
        weighted = (
            box_counts.get(5, 0) * 100 +
            box_counts.get(4, 0) * 85 +
            box_counts.get(3, 0) * 60 +
            box_counts.get(2, 0) * 35 +
            box_counts.get(1, 0) * 10
        )
        mastery_pct = round(weighted / q_count) if q_count > 0 else 0

        total_mastered += mastered
        total_questions += q_count

        domain_mastery.append({
            "domain_id": domain.id,
            "domain_name": domain.name,
            "weight_min": domain.weight_min,
            "weight_max": domain.weight_max,
            "total_questions": q_count,
            "mastery_pct": mastery_pct,
            "box_counts": {
                "unseen": unseen,
                "new_wrong": new_wrong,
                "learning": learning,
                "mastered": mastered,
            },
        })

    # Overall readiness gauge (0-100)
    overall_mastery = round(
        sum(d["mastery_pct"] * d["total_questions"] for d in domain_mastery) /
        max(total_questions, 1)
    )

    # Streak
    streak = db.query(StudyStreak).filter(StudyStreak.user_id == user_id).first()
    streak_data = {
        "current": streak.current_streak if streak else 0,
        "longest": streak.longest_streak if streak else 0,
        "total_days": streak.total_study_days if streak else 0,
    }

    if invalid_cert:
        return {
            "readiness": 0,
            "total_questions": 0,
            "streak": streak_data,
            "today_answered": 0,
            "due_reviews": 0,
            "review_pool_count": 0,
            "domains": [],
            "recent_sessions": [],
        }

    # Today's progress
    from datetime import date
    today_start = datetime.combine(date.today(), datetime.min.time())
    today_answers = (
        db.query(UserAnswer)
        .join(ExamSession)
        .filter(
            ExamSession.user_id == user_id,
            UserAnswer.session_id == ExamSession.id,
            ExamSession.certification_id == cert.id if cert else True,
        )
        .count()
    )

    # Due for review
    now = _utcnow()
    due_count = (
        db.query(QuestionMastery)
        .join(Question, QuestionMastery.question_id == Question.id)
        .filter(
            QuestionMastery.user_id == user_id,
            QuestionMastery.box > 0,
            QuestionMastery.next_review_at <= now,
            Question.certification_id == cert.id if cert else True,
        )
        .count()
    )

    # Recent sessions (last 5)
    recent = (
        db.query(ExamSession)
        .filter(
            ExamSession.user_id == user_id,
            ExamSession.status.in_(["completed", "expired"]),
            ExamSession.certification_id == cert.id if cert else True,
        )
        .order_by(ExamSession.completed_at.desc())
        .limit(5)
        .all()
    )
    recent_sessions = []
    for s in recent:
        answers = db.query(UserAnswer).filter(UserAnswer.session_id == s.id).all()
        total = len(s.question_ids) if s.question_ids else 0
        correct = sum(1 for a in answers if a.is_correct)
        recent_sessions.append({
            "session_id": s.id,
            "mode": s.mode,
            "score": s.score or 0,
            "total": total,
            "correct": correct,
            "completed_at": s.completed_at.isoformat() if s.completed_at else None,
        })

    # Review pool count
    review_count = (
        db.query(ReviewPoolItem)
        .join(Question, ReviewPoolItem.question_id == Question.id)
        .filter(
            ReviewPoolItem.user_id == user_id,
            ReviewPoolItem.resolved == False,
            Question.certification_id == cert.id if cert else True,
        )
        .count()
    )

    return {
        "readiness": overall_mastery,
        "domains": domain_mastery,
        "streak": streak_data,
        "today_answered": today_answers,
        "due_reviews": due_count,
        "review_pool_count": review_count,
        "recent_sessions": recent_sessions,
        "total_questions": total_questions,
    }


@router.get("/mastery")
async def get_mastery(
    certification_code: str | None = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Detailed mastery data per domain based on Leitner boxes."""
    user_id = current_user["sub"]
    cert = _resolve_requested_certification(db, certification_code)
    invalid_cert = bool(certification_code and not cert)
    domains_query = db.query(Domain)
    if cert:
        domains_query = domains_query.filter(Domain.certification_id == cert.id)
    domains = [] if invalid_cert else domains_query.all()
    result = []

    for domain in domains:
        mastery_rows = (
            db.query(QuestionMastery)
            .join(Question, QuestionMastery.question_id == Question.id)
            .join(QuestionSkill, Question.id == QuestionSkill.question_id)
            .join(Skill, QuestionSkill.skill_id == Skill.id)
            .filter(
                QuestionMastery.user_id == user_id,
                Skill.domain_id == domain.id,
                Question.certification_id == cert.id if cert else True,
            )
            .all()
        )
        boxes = [0, 0, 0, 0, 0, 0]  # box 0-5
        for m in mastery_rows:
            boxes[m.box] += 1

        q_count = (
            db.query(Question.id)
            .join(QuestionSkill).join(Skill)
            .filter(
                Skill.domain_id == domain.id,
                Question.is_active == True,
                Question.certification_id == cert.id if cert else True,
            )
            .count()
        )
        boxes[0] = q_count - sum(boxes[1:])  # unseen = total - tracked

        result.append({
            "domain_id": domain.id,
            "domain_name": domain.name,
            "certification_code": domain.certification.code if domain.certification else None,
            "total": q_count,
            "boxes": boxes,  # [unseen, new/wrong, shaky, learning, known, mastered]
        })

    return {"domains": result}


@router.get("/streak")
async def get_streak(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Current study streak info."""
    streak = db.query(StudyStreak).filter(StudyStreak.user_id == current_user["sub"]).first()
    if not streak:
        return {"current": 0, "longest": 0, "total_days": 0, "last_date": None}
    return {
        "current": streak.current_streak,
        "longest": streak.longest_streak,
        "total_days": streak.total_study_days,
        "last_date": streak.last_study_date.isoformat() if streak.last_study_date else None,
    }


@router.get("/due-reviews")
async def get_due_reviews(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Count of questions due for spaced review."""
    now = _utcnow()
    count = (
        db.query(QuestionMastery)
        .filter(
            QuestionMastery.user_id == current_user["sub"],
            QuestionMastery.box > 0,
            QuestionMastery.next_review_at <= now,
        )
        .count()
    )
    return {"due_count": count}


@router.get("/stats")
async def get_stats(
    certification_code: str | None = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Overall user statistics."""
    user_id = current_user["sub"]
    cert = _resolve_requested_certification(db, certification_code)
    invalid_cert = bool(certification_code and not cert)

    if invalid_cert:
        return {
            "total_answered": 0,
            "total_correct": 0,
            "accuracy": 0,
            "domains": [],
        }

    total_answered = db.query(UserAnswer).join(ExamSession).filter(
        ExamSession.user_id == user_id,
        ExamSession.certification_id == cert.id if cert else True,
    ).count()

    total_correct = db.query(UserAnswer).join(ExamSession).filter(
        ExamSession.user_id == user_id,
        UserAnswer.is_correct == True,
        ExamSession.certification_id == cert.id if cert else True,
    ).count()

    domains_query = db.query(Domain)
    if cert:
        domains_query = domains_query.filter(Domain.certification_id == cert.id)
    domains = domains_query.all()
    domain_stats = []
    for domain in domains:
        domain_answers = (
            db.query(UserAnswer)
            .join(ExamSession)
            .join(Question, UserAnswer.question_id == Question.id)
            .join(QuestionSkill, Question.id == QuestionSkill.question_id)
            .join(Skill, QuestionSkill.skill_id == Skill.id)
            .filter(
                ExamSession.user_id == user_id,
                Skill.domain_id == domain.id,
                Question.certification_id == cert.id if cert else True,
            )
            .all()
        )
        domain_total = len(domain_answers)
        domain_correct = sum(1 for a in domain_answers if a.is_correct)
        domain_stats.append({
            "domain_id": domain.id,
            "domain_name": domain.name,
            "certification_code": domain.certification.code if domain.certification else None,
            "total": domain_total,
            "correct": domain_correct,
            "percentage": round((domain_correct / domain_total * 100)) if domain_total > 0 else 0,
            "weight_min": domain.weight_min,
            "weight_max": domain.weight_max,
        })

    return {
        "total_answered": total_answered,
        "total_correct": total_correct,
        "accuracy": round((total_correct / total_answered * 100)) if total_answered > 0 else 0,
        "domains": domain_stats,
    }


@router.get("/weak-spots")
async def get_weak_spots(
    certification_code: str | None = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Identify the weakest skills for targeted review."""
    user_id = current_user["sub"]
    cert = _resolve_requested_certification(db, certification_code)
    invalid_cert = bool(certification_code and not cert)

    if invalid_cert:
        return {"weak_spots": []}

    skill_errors = (
        db.query(
            Skill.id,
            Skill.code,
            Skill.name,
            Domain.id.label("domain_id"),
            Domain.name.label("domain_name"),
            Certification.code.label("certification_code"),
            func.count(UserAnswer.id).label("total"),
            func.sum(func.cast(UserAnswer.is_correct == False, Integer)).label("errors"),
        )
        .join(QuestionSkill, Skill.id == QuestionSkill.skill_id)
        .join(Question, QuestionSkill.question_id == Question.id)
        .join(UserAnswer, Question.id == UserAnswer.question_id)
        .join(ExamSession, UserAnswer.session_id == ExamSession.id)
        .join(Domain, Skill.domain_id == Domain.id)
        .join(Certification, Domain.certification_id == Certification.id)
        .filter(
            ExamSession.user_id == user_id,
            Question.certification_id == cert.id if cert else True,
        )
        .group_by(Skill.id)
        .all()
    )

    weak_spots = []
    for row in skill_errors:
        error_rate = (row.errors / row.total * 100) if row.total > 0 else 0
        if error_rate > 30:
            weak_spots.append({
                "skill_id": row.id,
                "skill_code": row.code,
                "skill_name": row.name,
                "domain_id": row.domain_id,
                "domain": row.domain_name,
                "certification_code": row.certification_code,
                "total_attempts": row.total,
                "errors": row.errors,
                "error_rate": round(error_rate),
            })

    weak_spots.sort(key=lambda x: x["error_rate"], reverse=True)
    return {"weak_spots": weak_spots}


@router.get("/review-pool")
async def get_review_pool(
    certification_code: str | None = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's review pool items."""
    cert = _resolve_requested_certification(db, certification_code)
    invalid_cert = bool(certification_code and not cert)

    if invalid_cert:
        return {"items": [], "total": 0}

    items = (
        db.query(ReviewPoolItem)
        .join(Question, ReviewPoolItem.question_id == Question.id)
        .filter(
            ReviewPoolItem.user_id == current_user["sub"],
            ReviewPoolItem.resolved == False,
            Question.certification_id == cert.id if cert else True,
        )
        .order_by(ReviewPoolItem.times_failed.desc())
        .all()
    )
    return {
        "items": [
            {
                "id": item.id,
                "question_id": item.question_id,
                "source": item.source,
                "times_failed": item.times_failed,
                "note": item.note,
                "added_at": item.added_at.isoformat(),
                "certification_code": item.question.certification.code if item.question and item.question.certification else None,
                "certification_name": item.question.certification.name if item.question and item.question.certification else None,
            }
            for item in items
        ],
        "total": len(items),
    }


@router.post("/review-pool/bookmark/{question_id}")
async def bookmark_question(
    question_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Manually bookmark a question for review."""
    existing = (
        db.query(ReviewPoolItem)
        .filter(ReviewPoolItem.user_id == current_user["sub"], ReviewPoolItem.question_id == question_id)
        .first()
    )
    if existing:
        existing.resolved = False
        db.commit()
        return {"status": "reactivated"}

    item = ReviewPoolItem(
        user_id=current_user["sub"],
        question_id=question_id,
        source="manual_bookmark",
    )
    db.add(item)
    db.commit()
    return {"status": "bookmarked"}


@router.post("/review-pool/unbookmark/{question_id}")
async def unbookmark_question(
    question_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove a manual bookmark from the review pool."""
    existing = (
        db.query(ReviewPoolItem)
        .filter(
            ReviewPoolItem.user_id == current_user["sub"],
            ReviewPoolItem.question_id == question_id,
            ReviewPoolItem.source == "manual_bookmark",
        )
        .first()
    )
    if existing:
        existing.resolved = True
        db.commit()
        return {"status": "unbookmarked"}
    return {"status": "not_found"}


@router.post("/review-pool/resolve/{item_id}")
async def resolve_review_item(
    item_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark a review item as resolved."""
    item = db.query(ReviewPoolItem).filter(
        ReviewPoolItem.id == item_id, ReviewPoolItem.user_id == current_user["sub"]
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.resolved = True
    db.commit()
    return {"status": "resolved"}


# ── Study Plan Progress ──────────────────────────────────

@router.get("/study-plan/progress")
async def get_study_progress(
    certification_code: str | None = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all study plan progress for the current user."""
    items = (
        db.query(StudyProgress)
        .filter(StudyProgress.user_id == current_user["sub"])
        .all()
    )
    progress = {}
    for item in items:
        normalized_section = _progress_section_match(
            item.section,
            certification_code.strip().upper() if certification_code else None,
        )
        if not normalized_section:
            continue
        key = f"{item.day}_{normalized_section}"
        progress[key] = {
            "completed": item.completed,
            "completed_at": item.completed_at.isoformat() if item.completed_at else None,
        }
    return {"progress": progress}


@router.post("/study-plan/toggle")
async def toggle_study_section(
    body: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Toggle completion of a study plan section."""
    day = body.get("day")
    section = body.get("section")
    certification_code = body.get("certification_code")
    if certification_code:
        certification_code = str(certification_code).strip().upper()
    if not day or not section:
        raise HTTPException(status_code=400, detail="day and section required")

    storage_section = _progress_section_storage_key(section, certification_code)
    lookup_sections = [storage_section]
    if certification_code == "AZ-500":
        lookup_sections.append(section)

    existing = (
        db.query(StudyProgress)
        .filter(
            StudyProgress.user_id == current_user["sub"],
            StudyProgress.day == day,
            StudyProgress.section.in_(lookup_sections),
        )
        .first()
    )

    if existing:
        existing.completed = not existing.completed
        existing.completed_at = _utcnow() if existing.completed else None
    else:
        existing = StudyProgress(
            user_id=current_user["sub"],
            day=day,
            section=storage_section,
            completed=True,
            completed_at=_utcnow(),
        )
        db.add(existing)

    db.commit()
    return {"completed": existing.completed}
