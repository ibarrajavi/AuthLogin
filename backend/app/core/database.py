from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from core.config import settings
from pathlib import Path

# Get DB URL from environment (default to local SQLite)
DATABASE_URL = settings.DATABASE_URL

# Create data directory if using SQLite
if "sqlite" in DATABASE_URL:
    # Extract file path from sqlite:///./data/app.db format
    db_path = DATABASE_URL.replace("sqlite:///", "").replace("sqlite://", "")
    db_file = Path(db_path)
    db_file.parent.mkdir(parents=True, exist_ok=True)

# Create engine with SQLite flag
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Session factory and Base for models
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Initialize DB
def init_db():
    from models import user
    Base.metadata.create_all(bind=engine)

# FastAPI dependency to provide a DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
