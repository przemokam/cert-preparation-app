"""
Questions API — list questions, domains, skills for Learning Mode and Admin.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel
from typing import Optional

from backend.database import get_db
from backend.auth import get_current_user
from backend.models import Certification, Question, QuestionTranslation, QuestionImage, QuestionSkill, Domain, Skill

router = APIRouter()


@router.get("/domains")
async def list_domains(
    certification_code: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """List all exam domains with question counts."""
    cert = None
    if certification_code:
        cert = db.query(Certification).filter(Certification.code == certification_code.strip().upper()).first()
        if not cert:
            return []

    domains_query = db.query(Domain)
    if cert:
        domains_query = domains_query.filter(Domain.certification_id == cert.id)
    domains = domains_query.all()
    return [
        {
            "id": d.id,
            "name": d.name,
            "weight_min": d.weight_min,
            "weight_max": d.weight_max,
            "skill_count": len(d.skills),
            "question_count": db.query(Question).join(QuestionSkill).join(Skill).filter(
                Skill.domain_id == d.id,
                Question.is_active == True,
                Question.certification_id == cert.id if cert else True,
            ).count(),
        }
        for d in domains
    ]


@router.get("/count")
async def question_count(
    certification_code: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Total number of active questions."""
    cert = None
    if certification_code:
        cert = db.query(Certification).filter(Certification.code == certification_code.strip().upper()).first()
        if not cert:
            return {"total_active": 0}

    total_query = db.query(Question).filter(Question.is_active == True)
    if cert:
        total_query = total_query.filter(Question.certification_id == cert.id)
    total = total_query.count()
    return {"total_active": total}


@router.get("/list")
async def list_questions(
    domain_id: Optional[int] = None,
    q_type: Optional[str] = None,
    search: Optional[str] = None,
    certification_code: Optional[str] = None,
    limit: int = 30,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """List basic question metadata for the Learning Mode grid.
    Supports filtering by domain, question type, and free-text search.
    """
    cert = None
    if certification_code:
        cert = db.query(Certification).filter(Certification.code == certification_code.strip().upper()).first()
        if not cert:
            return {"total": 0, "total_all": 0, "domain_counts": {}, "items": []}

    # Base query against translations for text access
    query = db.query(Question).filter(Question.is_active == True)
    if cert:
        query = query.filter(Question.certification_id == cert.id)

    if domain_id:
        query = query.join(QuestionSkill, isouter=False).join(Skill).filter(
            Skill.domain_id == domain_id
        )

    if q_type:
        query = query.filter(Question.question_type == q_type)

    if search:
        query = query.join(QuestionTranslation, isouter=True).filter(
            QuestionTranslation.question_text.ilike(f"%{search}%")
        )

    total = query.distinct().count()

    # Total unfiltered count for the "All" pill
    total_all_query = db.query(Question).filter(Question.is_active == True)
    if cert:
        total_all_query = total_all_query.filter(Question.certification_id == cert.id)
    total_all = total_all_query.count()

    # Per-domain counts (for pills)
    domains_query = db.query(Domain)
    if cert:
        domains_query = domains_query.filter(Domain.certification_id == cert.id)
    domains = domains_query.all()
    domain_counts = {}
    for d in domains:
        base = db.query(Question).filter(Question.is_active == True)
        if cert:
            base = base.filter(Question.certification_id == cert.id)
        if q_type:
            base = base.filter(Question.question_type == q_type)
        if search:
            base = base.join(QuestionTranslation, isouter=True).filter(
                QuestionTranslation.question_text.ilike(f"%{search}%")
            )
        domain_counts[d.id] = base.join(QuestionSkill, isouter=False).join(Skill).filter(
            Skill.domain_id == d.id
        ).distinct().count()

    questions = query.distinct().order_by(Question.id).offset(offset).limit(limit).all()

    def get_domains(q):
        try:
            return list(set(qs.skill.domain.name for qs in q.question_skills if qs.skill and qs.skill.domain))
        except Exception:
            return []

    def get_text(q):
        try:
            t = next((t for t in q.translations if t.lang == 'en'), None)
            if not t and q.translations:
                t = q.translations[0]
            return t.question_text if t else ''
        except Exception:
            return ''

    return {
        "total": total,
        "total_all": total_all,
        "domain_counts": domain_counts,
        "items": [
            {
                "id": q.id,
                "type": q.question_type,
                "text": get_text(q),
                "domains": get_domains(q),
            }
            for q in questions
        ]
    }
