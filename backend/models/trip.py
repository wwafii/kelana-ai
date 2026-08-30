"""
KelanaAI - Models Layer (SQLAlchemy ORM Model)
Definisi tabel database trips untuk menyimpan data riwayat perjalanan.
"""

import os
import sys

# Memastikan direktori backend berada di sys.path agar impor modul database berjalan lancar
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import Column, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from database import Base


class Trip(Base):
    """
    Model ORM SQLAlchemy untuk entitas perjalanan (trips).
    """
    __tablename__ = "trips"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    destination = Column(String, nullable=False)
    days = Column(Integer, nullable=False)
    budget = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    daily_budget = Column(Float, nullable=False)
    travel_style = Column(String, nullable=True, default="Standard")
    ai_recommendation = Column(Text, nullable=True)

    # Foreign key ke tabel users untuk hak kepemilikan data perjalanan
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Relasi many-to-one ke User
    user = relationship("User", back_populates="trips")
