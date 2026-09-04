"""
KelanaAI - Models Layer (SQLAlchemy ORM Model)
Sesi 10: Teaching KelanaAI to Remember Conversations
Definisi tabel database messages untuk menyimpan pesan percakapan (chat turns).
"""

import os
import sys

# Memastikan direktori backend berada di sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Message(Base):
    """
    Model ORM SQLAlchemy untuk entitas pesan (messages).
    Mencatat peran pengirim ('user' atau 'assistant'), teks pesan, dan timestamp.
    """
    __tablename__ = "messages"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False, index=True)
    role = Column(String(16), nullable=False)  # 'user' | 'assistant'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relasi many-to-one ke Conversation
    conversation = relationship("Conversation", back_populates="messages")
