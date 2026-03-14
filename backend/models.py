"""
SQLAlchemy ORM models for the Certification Exam Simulator.
Normalized, extensible schema supporting i18n, multi-exam, flexible tagging, and soft-delete.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column, String, Integer, Text, Boolean, DateTime, Date, Float,
    ForeignKey, Enum, JSON, UniqueConstraint
)
from sqlalchemy.orm import relationship
from backend.database import Base


def generate_uuid():
    return str(uuid.uuid4())


def utcnow():
    return datetime.now(timezone.utc)


# ── Certification / Exam ──────────────────────────────────────────

class Certification(Base):
    """Exam certification (AZ-500, AZ-104, Security+, etc.)."""
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True)
    code = Column(String(20), unique=True, nullable=False)        # "AZ-500"
    name = Column(String(200), nullable=False)                     # "Azure Security Engineer Associate"
    provider = Column(String(50), nullable=False, default="Microsoft")
    duration_minutes = Column(Integer, nullable=False, default=100)
    passing_score = Column(Integer, nullable=False, default=700)   # out of 1000
    is_active = Column(Boolean, nullable=False, default=True)

    domains = relationship("Domain", back_populates="certification", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="certification")
    sessions = relationship("ExamSession", back_populates="certification")


# ── Reference Tables ──────────────────────────────────────────────

class Domain(Base):
    """Exam domains (4 for AZ-500, 5 for AZ-104, etc.)."""
    __tablename__ = "domains"

    id = Column(Integer, primary_key=True)
    certification_id = Column(Integer, ForeignKey("certifications.id"), nullable=False)
    name = Column(String(120), nullable=False)
    weight_min = Column(Integer, nullable=False)
    weight_max = Column(Integer, nullable=False)

    certification = relationship("Certification", back_populates="domains")
    skills = relationship("Skill", back_populates="domain", cascade="all, delete-orphan")


class Skill(Base):
    """Subcategories within each domain."""
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True)
    domain_id = Column(Integer, ForeignKey("domains.id"), nullable=False)
    name = Column(String(200), nullable=False)
    code = Column(String(10), nullable=False, unique=True)

    domain = relationship("Domain", back_populates="skills")
    question_skills = relationship("QuestionSkill", back_populates="skill")


# ── Case Study / Scenario ─────────────────────────────────────────

class CaseStudy(Base):
    """Extended scenario shared by multiple questions (e.g. Topic 1, Litware Inc)."""
    __tablename__ = "case_studies"

    id = Column(Integer, primary_key=True)
    certification_id = Column(Integer, ForeignKey("certifications.id"), nullable=False)
    topic_number = Column(Integer, nullable=False)
    company_name = Column(String(120), nullable=False)
    scenario_text = Column(Text, nullable=False)         # Full scenario in markdown (EN)
    scenario_text_de = Column(Text, nullable=True)        # German translation
    scenario_text_pl = Column(Text, nullable=True)        # Polish translation

    certification = relationship("Certification")
    questions = relationship("Question", back_populates="case_study")


# ── Question Tables ───────────────────────────────────────────────

class Question(Base):
    """Language-agnostic question core. All text lives in QuestionTranslation."""
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True)
    certification_id = Column(Integer, ForeignKey("certifications.id"), nullable=False)
    case_study_id = Column(Integer, ForeignKey("case_studies.id"), nullable=True)
    question_type = Column(
        Enum("single_choice", "multi_choice", "yes_no_grid",
             "dropdown", "drag_drop", "simulation",
             name="question_type_enum"),
        nullable=False, default="single_choice"
    )
    correct_answer = Column(JSON, nullable=False)
    # For interactive types, structured data to build the UI:
    # yes_no_grid:  {"statements": ["Can VM1 connect...", ...], "correct": ["Yes","No","Yes"]}
    # dropdown:     {"slots": [{"label":"Server1","options":["A","B"],"correct":"B"}, ...]}
    # drag_drop:    {"items": ["Step A","Step B","Step C"], "target_slots": ["OU2", "User1"], "correct_mapping": {"OU2": "Azure AD Connect", ...}, "correct_order": [...]}
    # simulation:   {"lab_task": true}
    interactive_data = Column(JSON, nullable=True)
    source = Column(String(50), nullable=False, default="pdf_import")
    source_question_number = Column(Integer, nullable=True)  # Original Q number in PDF
    is_active = Column(Boolean, nullable=False, default=True)
    quality_score = Column(Integer, nullable=True)  # 0-100, auto-computed by import
    created_at = Column(DateTime, nullable=False, default=utcnow)

    certification = relationship("Certification", back_populates="questions")
    case_study = relationship("CaseStudy", back_populates="questions")
    translations = relationship("QuestionTranslation", back_populates="question", cascade="all, delete-orphan")
    images = relationship("QuestionImage", back_populates="question", cascade="all, delete-orphan")
    question_skills = relationship("QuestionSkill", back_populates="question", cascade="all, delete-orphan")
    user_answers = relationship("UserAnswer", back_populates="question")
    review_items = relationship("ReviewPoolItem", back_populates="question")


class QuestionTranslation(Base):
    """i18n layer — one row per (question, language)."""
    __tablename__ = "question_translations"
    __table_args__ = (
        UniqueConstraint("question_id", "lang", name="uq_question_lang"),
    )

    id = Column(Integer, primary_key=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    lang = Column(String(5), nullable=False, default="en")
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=True)        # ["A. Azure Firewall", "B. NSG", ...]
    explanation = Column(Text, nullable=True)

    question = relationship("Question", back_populates="translations")


class QuestionImage(Base):
    """Exhibits / screenshots attached to a question."""
    __tablename__ = "question_images"

    id = Column(Integer, primary_key=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    image_path = Column(String(300), nullable=False)
    image_role = Column(String(20), nullable=False, default="exhibit")  # exhibit | answer_area
    caption = Column(String(200), nullable=True)
    display_order = Column(Integer, nullable=False, default=0)

    question = relationship("Question", back_populates="images")


class QuestionSkill(Base):
    """Many-to-many: question ↔ skill tagging."""
    __tablename__ = "question_skills"

    question_id = Column(Integer, ForeignKey("questions.id"), primary_key=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), primary_key=True)

    question = relationship("Question", back_populates="question_skills")
    skill = relationship("Skill", back_populates="question_skills")


# ── User Tables ───────────────────────────────────────────────────

class User(Base):
    """User authenticated via Entra ID SSO."""
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    entra_oid = Column(String(36), unique=True, nullable=False)
    email = Column(String(254), unique=True, nullable=False)
    display_name = Column(String(120), nullable=False)
    preferred_lang = Column(String(5), nullable=False, default="en")
    preferred_theme = Column(String(20), nullable=False, default="mslearn")
    created_at = Column(DateTime, nullable=False, default=utcnow)

    sessions = relationship("ExamSession", back_populates="user", cascade="all, delete-orphan")
    review_items = relationship("ReviewPoolItem", back_populates="user", cascade="all, delete-orphan")


# ── Session & Answer Tables ───────────────────────────────────────

class ExamSession(Base):
    """Tracks a learning or mock exam session."""
    __tablename__ = "exam_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    certification_id = Column(Integer, ForeignKey("certifications.id"), nullable=True)
    mode = Column(
        Enum("learning", "learning_domain", "mock_exam", "review_pool",
             "weak_spots", "spaced_review", name="session_mode_enum"),
        nullable=False
    )
    status = Column(
        Enum("in_progress", "completed", "expired", name="session_status_enum"),
        nullable=False, default="in_progress"
    )
    current_question_index = Column(Integer, nullable=False, default=0)
    question_ids = Column(JSON, nullable=True)
    started_at = Column(DateTime, nullable=False, default=utcnow)
    deadline_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    score = Column(Integer, nullable=True)

    user = relationship("User", back_populates="sessions")
    certification = relationship("Certification", back_populates="sessions")
    answers = relationship("UserAnswer", back_populates="session", cascade="all, delete-orphan")


class UserAnswer(Base):
    """Individual answer to a question within a session."""
    __tablename__ = "user_answers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("exam_sessions.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    user_response = Column(JSON, nullable=True)
    is_correct = Column(Boolean, nullable=True)
    time_spent_seconds = Column(Integer, nullable=True)

    session = relationship("ExamSession", back_populates="answers")
    question = relationship("Question", back_populates="user_answers")


# ── Review Pool ───────────────────────────────────────────────────

class ReviewPoolItem(Base):
    """Unified review queue — bookmarks + mock exam errors."""
    __tablename__ = "review_pool"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    source = Column(
        Enum("manual_bookmark", "mock_exam_error", "learning_error", name="review_source_enum"),
        nullable=False
    )
    source_session_id = Column(String(36), ForeignKey("exam_sessions.id"), nullable=True)
    times_failed = Column(Integer, nullable=False, default=1)
    note = Column(Text, nullable=True)
    added_at = Column(DateTime, nullable=False, default=utcnow)
    resolved = Column(Boolean, nullable=False, default=False)

    user = relationship("User", back_populates="review_items")
    question = relationship("Question", back_populates="review_items")


# ── Spaced Repetition ────────────────────────────────────────────

class QuestionMastery(Base):
    """Leitner box tracking per user per question for spaced repetition."""
    __tablename__ = "question_mastery"
    __table_args__ = (
        UniqueConstraint("user_id", "question_id", name="uq_user_question_mastery"),
    )

    id = Column(Integer, primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    # Leitner box: 0=unseen, 1=new/wrong, 2=shaky, 3=learning, 4=known, 5=mastered
    box = Column(Integer, nullable=False, default=0)
    next_review_at = Column(DateTime, nullable=True)
    times_correct = Column(Integer, nullable=False, default=0)
    times_incorrect = Column(Integer, nullable=False, default=0)
    last_answered_at = Column(DateTime, nullable=True)
    # Confidence: 1=guessed, 2=knew it, 3=easy
    confidence = Column(Integer, nullable=True)

    user = relationship("User")
    question = relationship("Question")


# Review intervals by box (in days):
# Box 1: 0 (same session)   Box 2: 1 day   Box 3: 3 days   Box 4: 7 days   Box 5: 21 days
LEITNER_INTERVALS = {1: 0, 2: 1, 3: 3, 4: 7, 5: 21}


class Flashcard(Base):
    """Flashcard for spaced-repetition study — front/back card with category."""
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True)
    certification_id = Column(Integer, ForeignKey("certifications.id"), nullable=False)
    front = Column(Text, nullable=False)
    back = Column(Text, nullable=False)
    category = Column(String(30), nullable=False, default="key_fact")  # exam_trap, key_fact, tool
    domain = Column(Integer, nullable=True)
    source_question_number = Column(Integer, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)

    certification = relationship("Certification")


class FlashcardMastery(Base):
    """User progress on flashcards — reuses Leitner box model."""
    __tablename__ = "flashcard_mastery"
    __table_args__ = (
        UniqueConstraint("user_id", "flashcard_id", name="uq_user_flashcard_mastery"),
    )

    id = Column(Integer, primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    flashcard_id = Column(Integer, ForeignKey("flashcards.id"), nullable=False)
    box = Column(Integer, nullable=False, default=0)  # 0=unseen, 1-5 Leitner boxes
    next_review_at = Column(DateTime, nullable=True)
    times_seen = Column(Integer, nullable=False, default=0)
    last_seen_at = Column(DateTime, nullable=True)
    confidence = Column(Integer, nullable=True)  # 1=hard, 2=good, 3=easy

    user = relationship("User")
    flashcard = relationship("Flashcard")


class StudyStreak(Base):
    """Daily study streak tracking per user."""
    __tablename__ = "study_streaks"

    id = Column(Integer, primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    current_streak = Column(Integer, nullable=False, default=0)
    longest_streak = Column(Integer, nullable=False, default=0)
    last_study_date = Column(Date, nullable=True)
    total_study_days = Column(Integer, nullable=False, default=0)

    user = relationship("User")


# ── Study Plan Progress ──────────────────────────────────────────

class StudyProgress(Base):
    """Tracks completion of study plan sections (7-day plan)."""
    __tablename__ = "study_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "day", "section", name="uq_user_day_section"),
    )

    id = Column(Integer, primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    day = Column(Integer, nullable=False)       # 1-7
    section = Column(String(30), nullable=False) # ms_learn, video, lab, concepts, practice
    completed = Column(Boolean, nullable=False, default=False)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User")
