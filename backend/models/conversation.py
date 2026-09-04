"""
KelanaAI - Models Layer (SQLAlchemy ORM Model)
Sesi 10: Teaching KelanaAI to Remember Conversations
Definisi tabel database conversations untuk menyimpan sesi percakapan chat.
"""

import os
import sys

# Memastikan direktori backend berada di sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Conversation(Base):
    """
    Model ORM SQLAlchemy untuk entitas percakapan (conversations).
    Menghubungkan satu user dengan banyak riwayat pesan (messages).
    """
    __tablename__ = "conversations"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(256), nullable=False, default="New Conversation")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relasi many-to-one ke User
    user = relationship("User", back_populates="conversations")

    # Relasi one-to-many ke Message (terurut berdasarkan created_at ascending)
    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.created_at.asc()",
    )
