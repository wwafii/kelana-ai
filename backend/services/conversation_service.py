"""
KelanaAI - Conversation Service Layer (Amazon Bedrock Multi-Turn Chat & Context Memory)
Sesi 10: Teaching KelanaAI to Remember Conversations

Mengelola logika bisnis memori percakapan:
1. Pembuatan, pengambilan, pembaruan (rename), dan penghapusan sesi percakapan.
2. Penyimpanan riwayat pesan user & assistant (Persistence Layer).
3. Rekonstruksi konteks percakapan multi-turn (Prompt Builder / Context Window Trimming).
4. Pemanggilan Amazon Bedrock Converse API dengan histori lengkap percakapan.
"""

import os
import sys
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from botocore.exceptions import BotoCoreError, ClientError

# Memastikan direktori backend berada di sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.conversation import Conversation
from models.message import Message
from services.bedrock_service import get_bedrock_client

SYSTEM_PROMPT = """You are KelanaAI, an intelligent, inspiring, and helpful AI travel assistant.
You specialize in travel planning, destination advice, budgeting, cultural insights, local cuisine, and transit tips.
Always maintain context across the conversation thread. When a user asks follow-up questions (e.g., "What about Day 2?", "Can you make it cheaper?"), answer directly based on the destinations, budgets, and plans previously discussed in this conversation.
Provide clear, structured, and engaging recommendations using markdown formatting (bullet points, bold text)."""


def create_conversation(
    db: Session,
    user_id: int,
    title: Optional[str] = None,
) -> Conversation:
    """
    Membuat sesi percakapan baru untuk pengguna yang sedang terautentikasi.
    """
    clean_title = (title or "").strip() or "New Trip Chat"
    conversation = Conversation(
        user_id=user_id,
        title=clean_title,
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def list_conversations(
    db: Session,
    user_id: int,
) -> List[Conversation]:
    """
    Mengambil daftar percakapan milik pengguna yang sedang terautentikasi (Ownership Protected),
    diurutkan berdasarkan waktu pembaruan/pembuatan terbaru.
    """
    return (
        db.query(Conversation)
        .filter(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc(), Conversation.id.desc())
        .all()
    )


def get_conversation(
    db: Session,
    conversation_id: int,
    user_id: int,
) -> Conversation:
    """
    Mengambil satu entitas percakapan berdasarkan ID dengan validasi kepemilikan (Ownership Check).
    - Jika tidak ditemukan -> 404 Not Found.
    - Jika bukan milik user login -> 403 Forbidden.
    """
    conversation = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id)
        .first()
    )
    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation with id {conversation_id} not found",
        )

    if conversation.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to access this conversation",
        )

    return conversation


def update_conversation_title(
    db: Session,
    conversation_id: int,
    user_id: int,
    new_title: str,
) -> Conversation:
    """
    Memperbarui judul sesi percakapan (Bonus Challenge Sesi 10: Rename Conversations).
    """
    conversation = get_conversation(db, conversation_id, user_id)
    clean_title = new_title.strip()
    if not clean_title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conversation title cannot be empty",
        )

    conversation.title = clean_title
    db.commit()
    db.refresh(conversation)
    return conversation


def delete_conversation(
    db: Session,
    conversation_id: int,
    user_id: int,
) -> None:
    """
    Menghapus sesi percakapan beserta seluruh pesan terkait secara cascade.
    """
    conversation = get_conversation(db, conversation_id, user_id)
    db.delete(conversation)
    db.commit()


def get_conversation_messages(
    db: Session,
    conversation_id: int,
    user_id: int,
) -> List[Message]:
    """
    Mengambil seluruh riwayat pesan untuk percakapan tertentu (terurut kronologis).
    """
    conversation = get_conversation(db, conversation_id, user_id)
    return (
        db.query(Message)
        .filter(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.asc(), Message.id.asc())
        .all()
    )


def build_bedrock_messages(
    messages: List[Message],
    max_messages: int = 20,
) -> List[Dict[str, Any]]:
    """
    Prompt Builder & Context Window Trimming (Part 5 & Part 8 Sesi 10):
    1. Mengambil N pesan terakhir (recent turns) untuk menghemat biaya token dan menjaga batas context window.
    2. Memformat pesan sesuai spesifikasi Amazon Bedrock Converse API:
       [{"role": "user"|"assistant", "content": [{"text": "..."}]}]
    3. Memastikan aturan Bedrock:
       - Pesan pertama harus memiliki role 'user'.
       - Role harus bergantian (user -> assistant -> user).
       - Jika ada pesan berturut-turut dengan role yang sama, konten digabungkan.
    """
    if not messages:
        return []

    # Ambil maksimal N pesan terakhir
    recent_messages = messages[-max_messages:] if len(messages) > max_messages else messages

    bedrock_msgs: List[Dict[str, Any]] = []
    for msg in recent_messages:
        role = "user" if msg.role == "user" else "assistant"
        content_text = (msg.content or "").strip()
        if not content_text:
            continue

        # Bedrock mensyaratkan pesan awal adalah 'user'
        if not bedrock_msgs and role != "user":
            continue

        # Jika peran sama dengan pesan sebelumnya, gabungkan teks
        if bedrock_msgs and bedrock_msgs[-1]["role"] == role:
            bedrock_msgs[-1]["content"][0]["text"] += f"\n\n{content_text}"
        else:
            bedrock_msgs.append({
                "role": role,
                "content": [{"text": content_text}],
            })

    return bedrock_msgs


def send_message_and_get_reply(
    db: Session,
    conversation_id: int,
    user_id: int,
    user_content: str,
    model_id: Optional[str] = None,
) -> Message:
    """
    Orkestrasi Lengkap Send Message API (Part 4 Sesi 10):
    01. Receive User Message
    02. Save User Message to Database
    03. Load Previous Messages from Database
    04. Build Prompt / Context-Aware Messages History
    05. Call Amazon Bedrock Converse API
    06. Save AI Response to Database
    07. Auto-update Conversation Title (jika masih judul default)
    08. Return AI Response Message
    """
    # Validasi kepemilikan percakapan
    conversation = get_conversation(db, conversation_id, user_id)

    clean_content = user_content.strip()
    if not clean_content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be empty",
        )

    # 02. Simpan pesan pengguna ke database
    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=clean_content,
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    # 03. Muat seluruh riwayat pesan dari database
    all_messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.asc(), Message.id.asc())
        .all()
    )

    # 04. Rekonstruksi konteks percakapan untuk Bedrock
    bedrock_messages = build_bedrock_messages(all_messages, max_messages=20)

    # 05. Kirim konteks lengkap ke Amazon Bedrock Converse API
    if not model_id:
        model_id = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")

    ai_reply_text = ""
    try:
        client = get_bedrock_client()
        response = client.converse(
            modelId=model_id,
            system=[{"text": SYSTEM_PROMPT}],
            messages=bedrock_messages,
        )
        ai_reply_text = response["output"]["message"]["content"][0]["text"]
    except (BotoCoreError, ClientError) as e:
        error_msg = str(e)
        # Fallback jika model / kuota / jaringan terkendala saat demonstrasi offline
        ai_reply_text = (
            f"Mohon maaf, terjadi kendala saat menghubungi Amazon Bedrock ({error_msg}). "
            f"Namun pesan Anda telah tersimpan dalam konteks riwayat percakapan."
        )
    except Exception as e:
        ai_reply_text = f"Terjadi kesalahan pada sistem asisten: {str(e)}"

    # 06. Simpan balasan AI ke database
    ai_message = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=ai_reply_text,
    )
    db.add(ai_message)

    # 07. Auto-update conversation title jika masih judul bawaan
    if conversation.title in ["New Trip Chat", "New Conversation", "Chat Baru"] and len(all_messages) <= 2:
        # Buat judul ringkas dari pesan pertama (maksimal 45 karakter)
        snippet = clean_content[:45].strip()
        if len(clean_content) > 45:
            snippet += "..."
        conversation.title = snippet

    db.commit()
    db.refresh(ai_message)
    db.refresh(conversation)

    # 08. Kembalikan respons pesan AI
    return ai_message
