"""
Exam session API — start, resume, submit answers, get questions.
Server-side timer enforcement: deadline_at is immutable once set.
Supports: learning, learning_domain, mock_exam, review_pool, weak_spots, spaced_review.
"""

from datetime import datetime, date, timedelta, timezone
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
import random

from backend.database import get_db
from backend.auth import get_current_user
from backend.models import (
    Certification, ExamSession, UserAnswer, Question, QuestionTranslation,
    QuestionImage, QuestionSkill, Domain, Skill, ReviewPoolItem, User,
    CaseStudy, QuestionMastery, StudyStreak, LEITNER_INTERVALS
)

router = APIRouter()

# All modes that show immediate feedback after answering
LEARNING_MODES = ("learning", "learning_domain", "review_pool", "weak_spots", "spaced_review")


def _utcnow():
    """Return current UTC time as naive datetime (matches SQLite storage)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _json_dict(value):
    """Return a JSON-like value as dict when possible."""
    if isinstance(value, dict):
        return value
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
        except (json.JSONDecodeError, TypeError):
            return None
        return parsed if isinstance(parsed, dict) else None
    return None


def _get_placeholder_meta(question: Question) -> dict | None:
    """Return placeholder metadata for intentionally empty questions."""
    interactive_data = _json_dict(question.interactive_data)
    if interactive_data and interactive_data.get("placeholder"):
        return interactive_data

    correct_answer = _json_dict(question.correct_answer)
    if correct_answer and correct_answer.get("_placeholder"):
        return {"placeholder": True}

    return None


def _is_placeholder_question(question: Question) -> bool:
    """Check whether a question is an intentional EMPTY placeholder."""
    return _get_placeholder_meta(question) is not None


class StartExamRequest(BaseModel):
    mode: str  # learning | learning_domain | mock_exam | review_pool | weak_spots | spaced_review
    domain_id: Optional[int] = None
    num_questions: int = 60


class SubmitAnswerRequest(BaseModel):
    question_id: int
    user_response: dict
    time_spent_seconds: int = 0


class ConfidenceRequest(BaseModel):
    question_id: int
    confidence: int  # 1=guessed, 2=knew it, 3=easy


@router.post("/start")
async def start_exam(
    body: StartExamRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Start a new exam/learning session."""
    user = db.query(User).filter(User.id == current_user.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    now = _utcnow()
    question_ids = []

    if body.mode == "learning":
        # All active questions sorted by source number
        questions = (
            db.query(Question)
            .filter(Question.is_active == True)
            .order_by(Question.source_question_number)
            .all()
        )
        question_ids = [q.id for q in questions]

    elif body.mode == "learning_domain":
        if not body.domain_id:
            raise HTTPException(status_code=400, detail="domain_id required for learning_domain mode")
        questions = (
            db.query(Question)
            .join(QuestionSkill).join(Skill)
            .filter(Question.is_active == True, Skill.domain_id == body.domain_id)
            .order_by(Question.source_question_number)
            .all()
        )
        question_ids = [q.id for q in questions]

    elif body.mode == "review_pool":
        review_qids = (
            db.query(ReviewPoolItem.question_id)
            .filter(ReviewPoolItem.user_id == user.id, ReviewPoolItem.resolved == False)
            .all()
        )
        qids = [r[0] for r in review_qids]
        questions = (
            db.query(Question)
            .filter(Question.id.in_(qids), Question.is_active == True)
            .order_by(Question.source_question_number)
            .all()
        )
        question_ids = [q.id for q in questions]

    elif body.mode == "weak_spots":
        # Questions from domains where accuracy < 70%
        weak_qids = _get_weak_question_ids(user.id, db)
        questions = (
            db.query(Question)
            .filter(Question.id.in_(weak_qids), Question.is_active == True)
            .order_by(Question.source_question_number)
            .all()
        )
        question_ids = [q.id for q in questions]

    elif body.mode == "spaced_review":
        # Questions due for review based on Leitner schedule
        due = (
            db.query(QuestionMastery.question_id)
            .filter(
                QuestionMastery.user_id == user.id,
                QuestionMastery.box > 0,
                QuestionMastery.next_review_at <= now,
            )
            .all()
        )
        qids = [r[0] for r in due]
        questions = (
            db.query(Question)
            .filter(Question.id.in_(qids), Question.is_active == True)
            .order_by(Question.source_question_number)
            .all()
        )
        question_ids = [q.id for q in questions]

    elif body.mode == "mock_exam":
        question_ids = _build_mock_exam(body.num_questions, db)

    else:
        raise HTTPException(status_code=400, detail=f"Unknown mode: {body.mode}")

    if not question_ids:
        raise HTTPException(status_code=404, detail="No questions available for this mode")

    # Use real exam duration for mock, no deadline for learning modes
    cert = db.query(Certification).filter(Certification.code == "AZ-500").first()
    duration = cert.duration_minutes if cert else 150
    deadline = now + timedelta(minutes=duration) if body.mode == "mock_exam" else None

    session = ExamSession(
        user_id=user.id,
        certification_id=cert.id if cert else None,
        mode=body.mode,
        status="in_progress",
        question_ids=question_ids,
        started_at=now,
        deadline_at=deadline,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "session_id": session.id,
        "mode": session.mode,
        "total_questions": len(question_ids),
        "deadline_at": session.deadline_at.isoformat() if session.deadline_at else None,
    }


def _build_mock_exam(num_questions: int, db: Session) -> list[int]:
    """Build mock exam: 1 random case study section + mixed questions from Topic 5."""
    # Pick a random case study
    case_studies = db.query(CaseStudy).all()
    section1_ids = []
    if case_studies:
        cs = random.choice(case_studies)
        cs_questions = (
            db.query(Question)
            .filter(Question.case_study_id == cs.id, Question.is_active == True)
            .order_by(Question.source_question_number)
            .all()
        )
        cs_questions = [q for q in cs_questions if not _is_placeholder_question(q)]
        section1_ids = [q.id for q in cs_questions]

    # Fill remaining from non-case-study questions, weighted by domain
    remaining = num_questions - len(section1_ids)
    mixed_pool = (
        db.query(Question)
        .filter(
            Question.case_study_id == None,
            Question.is_active == True,
            ~Question.id.in_(section1_ids) if section1_ids else True,
        )
        .all()
    )
    mixed_pool = [q for q in mixed_pool if not _is_placeholder_question(q)]

    # Weight by domain
    domains = db.query(Domain).all()
    section2_ids = []
    for domain in domains:
        weight = (domain.weight_min + domain.weight_max) / 2 / 100
        count = max(1, round(remaining * weight))
        domain_qids = [
            q.id for q in mixed_pool
            if any(qs.skill.domain_id == domain.id for qs in q.question_skills)
        ]
        selected = random.sample(domain_qids, min(count, len(domain_qids)))
        section2_ids.extend(selected)

    random.shuffle(section2_ids)
    section2_ids = section2_ids[:remaining]

    # Section 1 (case study) first, then section 2 (mixed)
    return section1_ids + section2_ids


def _get_weak_question_ids(user_id: str, db: Session) -> list[int]:
    """Get question IDs from domains where user accuracy < 70%."""
    domains = db.query(Domain).all()
    weak_qids = []
    for domain in domains:
        answers = (
            db.query(UserAnswer)
            .join(ExamSession)
            .join(Question, UserAnswer.question_id == Question.id)
            .join(QuestionSkill, Question.id == QuestionSkill.question_id)
            .join(Skill, QuestionSkill.skill_id == Skill.id)
            .filter(ExamSession.user_id == user_id, Skill.domain_id == domain.id)
            .all()
        )
        if not answers:
            continue
        accuracy = sum(1 for a in answers if a.is_correct) / len(answers)
        if accuracy < 0.70:
            domain_questions = (
                db.query(Question.id)
                .join(QuestionSkill).join(Skill)
                .filter(Skill.domain_id == domain.id, Question.is_active == True)
                .all()
            )
            weak_qids.extend(r[0] for r in domain_questions)
    return weak_qids


@router.get("/{session_id}/question/{index}")
async def get_question(
    session_id: str,
    index: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a question by index within a session."""
    session = db.query(ExamSession).filter(ExamSession.id == session_id).first()
    if not session or session.user_id != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Access denied")

    if session.deadline_at and _utcnow() > session.deadline_at:
        session.status = "expired"
        db.commit()
        raise HTTPException(status_code=410, detail="Time expired")

    if session.status in ("completed", "expired"):
        raise HTTPException(status_code=400, detail=f"Session is {session.status}")

    qids = session.question_ids or []
    if index < 0 or index >= len(qids):
        raise HTTPException(status_code=404, detail="Question index out of range")

    question_id = qids[index]
    question = db.query(Question).options(
        joinedload(Question.translations),
        joinedload(Question.images),
        joinedload(Question.question_skills).joinedload(QuestionSkill.skill).joinedload(Skill.domain),
        joinedload(Question.case_study),
    ).filter(Question.id == question_id).first()

    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    user = db.query(User).filter(User.id == current_user["sub"]).first()
    lang = user.preferred_lang if user else "en"
    translation = next((t for t in question.translations if t.lang == lang), None)
    if not translation:
        translation = next((t for t in question.translations if t.lang == "en"), None)

    existing_answer = (
        db.query(UserAnswer)
        .filter(UserAnswer.session_id == session_id, UserAnswer.question_id == question_id)
        .first()
    )

    session.current_question_index = index
    db.commit()

    exhibit_images = [img for img in question.images if getattr(img, 'image_role', 'exhibit') == 'exhibit']
    placeholder_meta = _get_placeholder_meta(question)

    case_study_data = None
    if question.case_study_id and question.case_study:
        cs = question.case_study
        case_study_data = {
            "id": cs.id,
            "topic_number": cs.topic_number,
            "company_name": cs.company_name,
            "scenario_text": cs.scenario_text,
        }

    result = {
        "index": index,
        "total": len(qids),
        "session_mode": session.mode,
        "question_id": question.id,
        "source_question_number": question.source_question_number,
        "question_type": question.question_type,
        "question_text": translation.question_text if translation else "",
        "options": translation.options if translation else [],
        "interactive_data": question.interactive_data,
        "is_placeholder": bool(placeholder_meta),
        "case_study": case_study_data,
        "images": [
            {"path": img.image_path, "caption": img.caption, "order": img.display_order}
            for img in exhibit_images
        ],
        "domains": list(set(
            qs.skill.domain.name for qs in question.question_skills
            if qs.skill and qs.skill.domain
        )),
        "answered": existing_answer is not None,
        "user_response": existing_answer.user_response if existing_answer else None,
    }

    # In learning modes, include feedback after answering
    if session.mode in LEARNING_MODES and existing_answer:
        result["correct_answer"] = question.correct_answer
        result["explanation"] = translation.explanation if translation else ""
        result["is_correct"] = existing_answer.is_correct

    return result


@router.post("/{session_id}/answer")
async def submit_answer(
    session_id: str,
    body: SubmitAnswerRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit an answer. Server computes is_correct."""
    session = db.query(ExamSession).filter(ExamSession.id == session_id).first()
    if not session or session.user_id != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Access denied")

    if session.deadline_at and _utcnow() > session.deadline_at:
        session.status = "expired"
        db.commit()
        raise HTTPException(status_code=410, detail="Time expired")

    if session.status != "in_progress":
        raise HTTPException(status_code=400, detail=f"Session is {session.status}")

    question = db.query(Question).filter(Question.id == body.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    if _is_placeholder_question(question):
        raise HTTPException(status_code=400, detail="Placeholder question cannot be answered")

    is_correct = _check_answer(question.correct_answer, body.user_response)

    # Upsert answer
    existing = (
        db.query(UserAnswer)
        .filter(UserAnswer.session_id == session_id, UserAnswer.question_id == body.question_id)
        .first()
    )
    if existing:
        existing.user_response = body.user_response
        existing.is_correct = is_correct
        existing.time_spent_seconds = body.time_spent_seconds
    else:
        answer = UserAnswer(
            session_id=session_id,
            question_id=body.question_id,
            user_response=body.user_response,
            is_correct=is_correct,
            time_spent_seconds=body.time_spent_seconds,
        )
        db.add(answer)

    # Update mastery (Leitner box)
    _update_mastery(current_user["sub"], body.question_id, is_correct, db)

    # Update study streak
    _update_streak(current_user["sub"], db)

    # Auto-add to review pool if wrong answer (any mode)
    if not is_correct:
        existing_review = (
            db.query(ReviewPoolItem)
            .filter(
                ReviewPoolItem.user_id == current_user["sub"],
                ReviewPoolItem.question_id == body.question_id,
            )
            .first()
        )
        if existing_review:
            existing_review.times_failed += 1
            existing_review.resolved = False  # reactivate if previously resolved
        else:
            source = "mock_exam_error" if session.mode == "mock_exam" else "learning_error"
            db.add(ReviewPoolItem(
                user_id=current_user["sub"],
                question_id=body.question_id,
                source=source,
                source_session_id=session_id,
            ))

    db.commit()

    result = {"status": "saved", "is_correct": is_correct}

    # In learning modes, return feedback
    if session.mode in LEARNING_MODES:
        user = db.query(User).filter(User.id == current_user["sub"]).first()
        lang = user.preferred_lang if user else "en"
        translation = (
            db.query(QuestionTranslation)
            .filter(QuestionTranslation.question_id == body.question_id, QuestionTranslation.lang == lang)
            .first()
        )
        if not translation:
            translation = (
                db.query(QuestionTranslation)
                .filter(QuestionTranslation.question_id == body.question_id, QuestionTranslation.lang == "en")
                .first()
            )
        result["correct_answer"] = question.correct_answer
        result["explanation"] = translation.explanation if translation else ""

    return result


@router.post("/{session_id}/confidence")
async def set_confidence(
    session_id: str,
    body: ConfidenceRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Set confidence level after answering (1=guessed, 2=knew it, 3=easy).
    Adjusts Leitner box based on confidence."""
    if body.confidence not in (1, 2, 3):
        raise HTTPException(status_code=400, detail="Confidence must be 1, 2, or 3")

    mastery = (
        db.query(QuestionMastery)
        .filter(
            QuestionMastery.user_id == current_user["sub"],
            QuestionMastery.question_id == body.question_id,
        )
        .first()
    )
    if not mastery:
        return {"status": "no_mastery_record"}

    mastery.confidence = body.confidence

    # Confidence adjusts box: guessed = don't promote even if correct, easy = extra promotion
    if body.confidence == 1 and mastery.box > 1:
        # Guessed: demote one box (you don't really know it)
        mastery.box = max(1, mastery.box - 1)
    elif body.confidence == 3 and mastery.box < 5:
        # Easy: promote an extra box
        mastery.box = min(5, mastery.box + 1)

    # Recalculate next review based on adjusted box
    interval_days = LEITNER_INTERVALS.get(mastery.box, 0)
    mastery.next_review_at = _utcnow() + timedelta(days=interval_days)

    db.commit()
    return {"status": "updated", "box": mastery.box, "next_review_at": mastery.next_review_at.isoformat()}


def _update_mastery(user_id: str, question_id: int, is_correct: bool, db: Session):
    """Update Leitner box for a question after answering."""
    mastery = (
        db.query(QuestionMastery)
        .filter(QuestionMastery.user_id == user_id, QuestionMastery.question_id == question_id)
        .first()
    )
    if not mastery:
        mastery = QuestionMastery(
            user_id=user_id, question_id=question_id, box=0,
            times_correct=0, times_incorrect=0,
        )
        db.add(mastery)

    now = _utcnow()
    mastery.last_answered_at = now

    if is_correct:
        mastery.times_correct = (mastery.times_correct or 0) + 1
        mastery.box = min(5, mastery.box + 1)
    else:
        mastery.times_incorrect = (mastery.times_incorrect or 0) + 1
        mastery.box = 1

    # Set next review date based on new box
    interval_days = LEITNER_INTERVALS.get(mastery.box, 0)
    mastery.next_review_at = now + timedelta(days=interval_days)


def _update_streak(user_id: str, db: Session):
    """Update study streak for today."""
    today = date.today()
    streak = db.query(StudyStreak).filter(StudyStreak.user_id == user_id).first()

    if not streak:
        streak = StudyStreak(user_id=user_id, current_streak=1, longest_streak=1,
                            last_study_date=today, total_study_days=1)
        db.add(streak)
        return

    if streak.last_study_date == today:
        return  # Already counted today

    if streak.last_study_date == today - timedelta(days=1):
        # Consecutive day
        streak.current_streak += 1
    else:
        # Streak broken
        streak.current_streak = 1

    streak.longest_streak = max(streak.longest_streak, streak.current_streak)
    streak.last_study_date = today
    streak.total_study_days += 1


@router.post("/{session_id}/complete")
async def complete_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Finish an exam session and calculate the score. Idempotent — safe to call on already-completed sessions."""
    session = db.query(ExamSession).filter(ExamSession.id == session_id).first()
    if not session or session.user_id != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Access denied")

    answers = db.query(UserAnswer).filter(UserAnswer.session_id == session_id).all()
    total = len(session.question_ids) if session.question_ids else 1
    correct = sum(1 for a in answers if a.is_correct)
    score = round((correct / total) * 1000) if total > 0 else 0

    if session.status not in ("completed", "expired"):
        session.status = "completed"
        session.completed_at = _utcnow()
        session.score = score
        db.commit()

    # Per-domain breakdown
    domain_breakdown = _get_domain_breakdown(answers, db)

    return {
        "score": session.score or score,
        "passed": (session.score or score) >= 700,
        "total_questions": total,
        "correct": correct,
        "incorrect": total - correct,
        "domains": domain_breakdown,
    }


@router.get("/{session_id}/results")
async def get_results(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get results for a completed session (read-only)."""
    session = db.query(ExamSession).filter(ExamSession.id == session_id).first()
    if not session or session.user_id != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Access denied")

    answers = db.query(UserAnswer).filter(UserAnswer.session_id == session_id).all()
    total = len(session.question_ids) if session.question_ids else 1
    correct = sum(1 for a in answers if a.is_correct)
    score = session.score or round((correct / total) * 1000) if total > 0 else 0

    domain_breakdown = _get_domain_breakdown(answers, db)

    return {
        "score": score,
        "passed": score >= 700,
        "total_questions": total,
        "correct": correct,
        "incorrect": total - correct,
        "domains": domain_breakdown,
        "mode": session.mode,
        "started_at": session.started_at.isoformat(),
        "completed_at": session.completed_at.isoformat() if session.completed_at else None,
    }


def _get_domain_breakdown(answers: list, db: Session) -> dict:
    """Calculate per-domain accuracy for a set of answers."""
    domain_scores = {}
    for answer in answers:
        q = db.query(Question).options(
            joinedload(Question.question_skills).joinedload(QuestionSkill.skill).joinedload(Skill.domain)
        ).filter(Question.id == answer.question_id).first()
        if not q:
            continue
        for qs in q.question_skills:
            if qs.skill and qs.skill.domain:
                dname = qs.skill.domain.name
                if dname not in domain_scores:
                    domain_scores[dname] = {"total": 0, "correct": 0}
                domain_scores[dname]["total"] += 1
                if answer.is_correct:
                    domain_scores[dname]["correct"] += 1
    return {
        k: {
            "total": v["total"],
            "correct": v["correct"],
            "percentage": round(v["correct"] / v["total"] * 100) if v["total"] > 0 else 0,
        }
        for k, v in domain_scores.items()
    }


def _check_answer(correct: dict, user_response: dict) -> bool:
    """Compare user response against correct answer (server-side)."""
    if not correct or not user_response:
        return False

    if correct.get("answer") == "unknown" or correct.get("_needs_review"):
        return False

    # Single choice: {"answer": "B"}
    if "answer" in correct and isinstance(correct["answer"], str):
        user_ans = user_response.get("answer", "")
        if isinstance(user_ans, str):
            return user_ans.upper() == correct["answer"].upper()

    # Multi choice / yes_no_grid: {"answers": ["A", "C"]}
    if "answers" in correct:
        user_answers = user_response.get("answers", [])
        correct_answers = correct["answers"]
        # For yes_no_grid, order matters
        if all(a.lower() in ("yes", "no") for a in correct_answers):
            return [a.lower() for a in user_answers] == [a.lower() for a in correct_answers]
        # For multi-choice, order doesn't matter
        user_set = set(a.upper() for a in user_answers if isinstance(a, str))
        correct_set = set(a.upper() for a in correct_answers if isinstance(a, str))
        return user_set == correct_set

    # Dropdown: {"slots": [{"label": "Server1", "correct": "B"}, ...]}
    if "slots" in correct:
        user_slots = user_response.get("slots", {})
        for slot in correct["slots"]:
            user_val = user_slots.get(slot["label"], "")
            if user_val.lower() != slot["correct"].lower():
                return False
        return True

    # Drag-drop: {"correct_order": ["Item A", "Item B", ...]}
    if "correct_order" in correct:
        correct_order = correct["correct_order"]
        user_mapping = user_response.get("mapping")
        if user_mapping and isinstance(user_mapping, dict):
            sorted_slots = sorted(user_mapping.keys(),
                                  key=lambda s: int(s.split()[-1]) if s.split()[-1].isdigit() else 0)
            user_order = [user_mapping[s] for s in sorted_slots]
            return user_order == correct_order
        return user_response.get("order", []) == correct_order

    if "order" in correct:
        return user_response.get("order", []) == correct["order"]

    return False


# ── Session Resume ────────────────────────────────────────────────

@router.get("/resume")
async def resume_session(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Find the user's most recent in-progress session."""
    session = (
        db.query(ExamSession)
        .filter(
            ExamSession.user_id == current_user["sub"],
            ExamSession.status == "in_progress",
        )
        .order_by(ExamSession.started_at.desc())
        .first()
    )

    if not session:
        return {"has_active_session": False}

    if session.deadline_at and _utcnow() > session.deadline_at:
        session.status = "expired"
        answers = db.query(UserAnswer).filter(UserAnswer.session_id == session.id).all()
        total = len(session.question_ids) if session.question_ids else 1
        correct = sum(1 for a in answers if a.is_correct)
        session.score = round((correct / total) * 1000) if total > 0 else 0
        session.completed_at = _utcnow()
        db.commit()
        return {"has_active_session": False, "expired_session_id": session.id, "score": session.score}

    answered = db.query(UserAnswer).filter(UserAnswer.session_id == session.id).count()
    total_q = len(session.question_ids) if session.question_ids else 0

    return {
        "has_active_session": True,
        "session_id": session.id,
        "mode": session.mode,
        "current_index": session.current_question_index,
        "answered": answered,
        "total_questions": total_q,
        "started_at": session.started_at.isoformat(),
        "deadline_at": session.deadline_at.isoformat() if session.deadline_at else None,
    }


# ── Exam History ──────────────────────────────────────────────────

@router.get("/history")
async def exam_history(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Full exam history with readiness score."""
    completed_exams = (
        db.query(ExamSession)
        .filter(
            ExamSession.user_id == current_user["sub"],
            ExamSession.status.in_(["completed", "expired"]),
        )
        .order_by(ExamSession.completed_at.desc())
        .limit(20)
        .all()
    )

    history = []
    for exam in completed_exams:
        answers = db.query(UserAnswer).filter(UserAnswer.session_id == exam.id).all()
        total = len(exam.question_ids) if exam.question_ids else 0
        correct = sum(1 for a in answers if a.is_correct)

        history.append({
            "session_id": exam.id,
            "mode": exam.mode,
            "score": exam.score or 0,
            "passed": (exam.score or 0) >= 700,
            "total_questions": total,
            "correct": correct,
            "started_at": exam.started_at.isoformat(),
            "completed_at": exam.completed_at.isoformat() if exam.completed_at else None,
            "status": exam.status,
        })

    # Readiness from mock exams only
    mock_history = [h for h in history if h["mode"] == "mock_exam"]
    last_5 = mock_history[:5]
    readiness_score = 0
    readiness_status = "not_started"

    if last_5:
        weights = list(range(len(last_5), 0, -1))
        total_weight = sum(weights)
        weighted_sum = sum(e["score"] * w for e, w in zip(last_5, weights))
        readiness_score = round(weighted_sum / total_weight)

        passed_count = sum(1 for e in last_5 if e["passed"])
        if passed_count >= 3 and readiness_score >= 700:
            readiness_status = "ready"
        elif readiness_score >= 600:
            readiness_status = "almost_ready"
        else:
            readiness_status = "needs_practice"

    return {
        "history": history,
        "total_exams": len(mock_history),
        "readiness": {
            "score": readiness_score,
            "status": readiness_status,
            "exams_passed": sum(1 for e in mock_history if e["passed"]),
            "exams_total": len(mock_history),
        },
    }
