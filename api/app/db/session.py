from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

if settings.DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        future=True,
    )
else:
    engine = create_engine(settings.DATABASE_URL, future=True)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True)


def get_db() -> Generator[Session, None, None]:
    """Dependencia FastAPI para inyectar sesión DB y cerrarla al final."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
