"""
KelanaAI - Models Layer (SQLAlchemy ORM Model)
Definisi tabel database trips untuk menyimpan data riwayat perjalanan.
"""

import os
import sys

# Memastikan direktori backend berada di sys.path agar impor modul database berjalan lancar
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import Column, Float, Integer, String
from database import Base


class Trip(Base):
    """
    Model ORM SQLAlchemy untuk entitas perjalanan (trips).
    """
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    destination = Column(String, nullable=False)
    days = Column(Integer, nullable=False)
    budget = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    daily_budget = Column(Float, nullable=False)
