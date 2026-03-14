"""Flashcard API router — study cards with spaced repetition."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional

from backend.database import get_db
from backend.auth import get_current_user
from backend.models import (
    Flashcard, FlashcardMastery, Certification, LEITNER_INTERVALS,
)

router = APIRouter()


def _utcnow():
    """Return naive UTC datetime compatible with SQLite storage."""
    return datetime.utcnow()


class FlashcardConfidenceRequest(BaseModel):
    flashcard_id: int
    confidence: int  # 1=hard, 2=good, 3=easy


@router.get("/cards")
async def get_flashcards(
    certification_code: str,
    category: Optional[str] = None,
    due_only: bool = False,
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get flashcards for a certification, optionally filtered."""
    cert = db.query(Certification).filter_by(code=certification_code).first()
    if not cert:
        raise HTTPException(404, "Certification not found")

    base_query = db.query(Flashcard).filter(
        Flashcard.certification_id == cert.id,
        Flashcard.is_active == True,
    )
    if category:
        base_query = base_query.filter(Flashcard.category == category)

    if due_only:
        now = _utcnow()
        # IDs of cards user has seen
        seen_ids_sub = db.query(FlashcardMastery.flashcard_id).filter(
            FlashcardMastery.user_id == current_user["sub"],
        ).subquery()
        # Due cards (seen but review time passed)
        due_ids_sub = db.query(FlashcardMastery.flashcard_id).filter(
            FlashcardMastery.user_id == current_user["sub"],
            FlashcardMastery.next_review_at <= now,
        ).subquery()
        # Unseen cards
        unseen = base_query.filter(~Flashcard.id.in_(seen_ids_sub))
        # Due cards
        due = base_query.filter(Flashcard.id.in_(due_ids_sub))
        # Union
        cards = unseen.union(due).limit(limit).offset(offset).all()
        total = unseen.count() + due.count()
    else:
        total = base_query.count()
        cards = base_query.order_by(Flashcard.id).limit(limit).offset(offset).all()

    # Get mastery for these cards
    card_ids = [c.id for c in cards]
    masteries = {}
    if card_ids:
        for m in db.query(FlashcardMastery).filter(
            FlashcardMastery.user_id == current_user["sub"],
            FlashcardMastery.flashcard_id.in_(card_ids),
        ).all():
            masteries[m.flashcard_id] = m

    return {
        "total": total,
        "cards": [
            {
                "id": c.id,
                "front": c.front,
                "back": c.back,
                "category": c.category,
                "domain": c.domain,
                "box": masteries[c.id].box if c.id in masteries else 0,
                "times_seen": masteries[c.id].times_seen if c.id in masteries else 0,
            }
            for c in cards
        ],
    }


@router.get("/stats")
async def flashcard_stats(
    certification_code: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get flashcard mastery stats."""
    cert = db.query(Certification).filter_by(code=certification_code).first()
    if not cert:
        raise HTTPException(404, "Certification not found")

    total = db.query(Flashcard).filter(
        Flashcard.certification_id == cert.id,
        Flashcard.is_active == True,
    ).count()

    masteries = db.query(FlashcardMastery).filter(
        FlashcardMastery.user_id == current_user["sub"],
        FlashcardMastery.flashcard_id.in_(
            db.query(Flashcard.id).filter(Flashcard.certification_id == cert.id)
        ),
    ).all()

    box_counts = {i: 0 for i in range(6)}
    for m in masteries:
        box_counts[m.box] = box_counts.get(m.box, 0) + 1

    unseen = total - len(masteries)
    box_counts[0] = unseen

    now = _utcnow()
    due_count = 0
    for m in masteries:
        if m.next_review_at and m.next_review_at <= now:
            due_count += 1
    due_count += unseen  # Unseen cards are always "due"

    cat_counts = {}
    for fc in db.query(Flashcard).filter(Flashcard.certification_id == cert.id).all():
        cat_counts[fc.category] = cat_counts.get(fc.category, 0) + 1

    return {
        "total": total,
        "due": due_count,
        "seen": len(masteries),
        "unseen": unseen,
        "mastered": box_counts.get(5, 0),
        "box_distribution": box_counts,
        "categories": cat_counts,
    }


@router.post("/rate")
async def rate_flashcard(
    body: FlashcardConfidenceRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Rate a flashcard (1=hard, 2=good, 3=easy) — updates Leitner box."""
    fc = db.query(Flashcard).get(body.flashcard_id)
    if not fc:
        raise HTTPException(404, "Flashcard not found")

    now = _utcnow()
    mastery = db.query(FlashcardMastery).filter_by(
        user_id=current_user["sub"],
        flashcard_id=body.flashcard_id,
    ).first()

    if not mastery:
        mastery = FlashcardMastery(
            user_id=current_user["sub"],
            flashcard_id=body.flashcard_id,
            box=0,
            times_seen=0,
        )
        db.add(mastery)

    mastery.times_seen += 1
    mastery.last_seen_at = now
    mastery.confidence = body.confidence

    # Update box based on confidence
    if body.confidence == 1:  # Hard
        mastery.box = max(1, mastery.box - 1) if mastery.box > 1 else 1
    elif body.confidence == 2:  # Good
        mastery.box = min(5, mastery.box + 1) if mastery.box > 0 else 1
    elif body.confidence == 3:  # Easy
        mastery.box = min(5, mastery.box + 2) if mastery.box > 0 else 2

    interval = LEITNER_INTERVALS.get(mastery.box, 0)
    mastery.next_review_at = now + timedelta(days=interval)

    db.commit()

    return {
        "box": mastery.box,
        "next_review_at": mastery.next_review_at.isoformat() if mastery.next_review_at else None,
        "times_seen": mastery.times_seen,
    }
