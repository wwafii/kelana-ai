"""
KelanaAI - Database Layer (SQLAlchemy ORM Configuration)
Mengelola koneksi database PostgreSQL, engine, session factory, dan Base model.
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# load .env so os.getenv() can read it
load_dotenv()

# connection string from .env — never hardcode secrets
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://root:root@localhost:5432/kelana_ai",
)

# engine = the connection pool
engine = create_engine(DATABASE_URL)

# SessionLocal = a factory for DB sessions
SessionLocal = sessionmaker(bind=engine, autoflush=False)

# Base = all ORM models inherit from this
Base = declarative_base()


# create all tables
def init_db() -> None:
    """Create all SQLAlchemy tables for the configured database."""
    Base.metadata.create_all(bind=engine)
