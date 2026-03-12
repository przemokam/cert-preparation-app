"""
SQLAlchemy database engine and session management.
"""

import shutil

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from backend.config import (
    get_settings,
    BUNDLED_DATABASE_PATH,
    LOCAL_DATABASE_PATH,
    LOCAL_DATABASE_URL,
)

settings = get_settings()


def ensure_local_database_copy():
    """Create the ignored local working DB from the bundled seed DB on first run."""
    if settings.ENVIRONMENT != "local":
        return
    if settings.DATABASE_URL != LOCAL_DATABASE_URL:
        return
    if LOCAL_DATABASE_PATH.exists() or not BUNDLED_DATABASE_PATH.exists():
        return

    LOCAL_DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(BUNDLED_DATABASE_PATH, LOCAL_DATABASE_PATH)


ensure_local_database_copy()

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency — yields a DB session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables. Called on startup."""
    Base.metadata.create_all(bind=engine)
