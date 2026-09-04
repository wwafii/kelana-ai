"""
KelanaAI - Models Layer (SQLAlchemy ORM Model)
Definisi tabel database users untuk autentikasi dan manajemen akun pengguna.
"""

import os
import sys

# Memastikan direktori backend berada di sys.path agar impor modul database berjalan lancar
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    """
    Model ORM SQLAlchemy untuk entitas pengguna (users).
    """
    __tablename__ = "users"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    # Relasi one-to-many: satu user dapat memiliki banyak data trips
    trips = relationship("Trip", back_populates="user", cascade="all, delete-orphan")

    # Relasi one-to-many: satu user dapat memiliki banyak sesi percakapan
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
