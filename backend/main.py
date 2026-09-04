"""
KelanaAI - Web Layer (FastAPI REST API with Authentication & Ownership Protection)
Menyediakan REST API endpoints untuk asisten perjalanan KelanaAI
dengan mengintegrasikan Business Logic Layer (services.trip_service),
AI Service Layer (services.bedrock_service dengan Amazon Bedrock),
Authentication & Authorization Layer (services.auth_service),
dan Persistence Layer (database PostgreSQL via SQLAlchemy ORM).
"""

import os
import sys
from typing import Any, Dict, List, Optional
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy.orm import Session

# Memastikan direktori backend berada di sys.path agar impor modul services dan database berjalan lancar
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import get_db, init_db
from models.conversation import Conversation
from models.message import Message
from models.trip import Trip
from models.user import User
from services.auth_service import (
    authenticate_user,
    create_access_token,
    get_current_user,
    register_user,
)
from services.bedrock_service import generate_travel_recommendation
from services.conversation_service import (
    create_conversation,
    delete_conversation,
    get_conversation,
    get_conversation_messages,
    list_conversations,
    send_message_and_get_reply,
    update_conversation_title,
)
from services.kb_service import (
    ask_base_model,
    ask_knowledge_base,
    compare_rag_vs_base,
    get_available_documents,
)
from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
)

app = FastAPI(
    title="KelanaAI",
    description="RESTful Web API with JWT Authentication, PostgreSQL Persistence, Bedrock Conversational Memory & RAG",
    version="0.8.0",
)

# Konfigurasi CORS agar frontend Next.js (http://localhost:3000) dapat mengakses REST API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inisialisasi tabel database saat aplikasi dimuat
init_db()


# ==========================================
# Pydantic Schemas - Authentication & Users
# ==========================================

class UserRegisterRequest(BaseModel):
    """Schema model untuk registrasi user baru."""
    name: str = Field(..., min_length=2, max_length=100, description="Nama lengkap pengguna", examples=["Alice"])
    email: EmailStr = Field(..., description="Alamat email unik pengguna", examples=["alice@email.com"])
    password: str = Field(..., min_length=6, description="Kata sandi akun pengguna (minimal 6 karakter)", examples=["password123"])


class UserLoginRequest(BaseModel):
    """Schema model untuk login user."""
    email: EmailStr = Field(..., description="Alamat email akun", examples=["alice@email.com"])
    password: str = Field(..., description="Kata sandi akun", examples=["password123"])


class UserResponse(BaseModel):
    """Schema model representasi data profil pengguna."""
    id: int
    name: str
    email: str
    total_trips: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """Schema model respons JWT Access Token setelah login / registrasi berhasil."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ==========================================
# Pydantic Schemas - Trips
# ==========================================

class TripRequest(BaseModel):
    """
    Schema model validasi request body untuk pembuatan data perjalanan baru.
    Catatan keamanan: Frontend TIDAK mengirimkan user_id; backend mengisinya dari JWT.
    """
    destination: str = Field(..., min_length=1, description="Destinasi atau kota/negara tujuan perjalanan", examples=["Japan"])
    days: int = Field(..., gt=0, description="Durasi perjalanan dalam hari", examples=[5])
    budget: float = Field(..., ge=0, description="Total anggaran perjalanan", examples=[2000.0])
    travel_style: Optional[str] = Field("Standard", description="Gaya perjalanan (e.g. Solo, Family, Couple, Standard)", examples=["Family"])


class TripUpdate(BaseModel):
    """
    Schema model validasi request body untuk pembaruan data perjalanan.
    """
    budget: float = Field(..., ge=0, description="Total anggaran perjalanan yang baru", examples=[2500.0])
    destination: Optional[str] = Field(None, description="Destinasi tujuan perjalanan baru (opsional)", examples=["Japan"])
    days: Optional[int] = Field(None, gt=0, description="Durasi perjalanan baru dalam hari (opsional)", examples=[5])
    travel_style: Optional[str] = Field(None, description="Gaya perjalanan baru (opsional)", examples=["Couple"])


class TripResponse(BaseModel):
    """
    Schema model respons data perjalanan tersimpan milik pengguna.
    """
    id: int
    user_id: int
    destination: str
    days: int
    budget: float
    category: str
    daily_budget: float
    travel_style: Optional[str] = "Standard"
    ai_recommendation: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TripGenerateResponse(BaseModel):
    """
    Schema model respons hasil generate rekomendasi rencana perjalanan AI dari Amazon Bedrock.
    """
    trip_id: int = Field(..., description="ID perjalanan yang di-generate", examples=[1])
    destination: str = Field(..., description="Destinasi tujuan perjalanan", examples=["Japan"])
    recommendation: str = Field(..., description="Rencana dan rekomendasi perjalanan harian yang dihasilkan oleh AI")


# ==========================================
# Pydantic Schemas - Assistant & Knowledge Base (RAG)
# ==========================================

class AssistantQuestionRequest(BaseModel):
    """
    Schema model request untuk bertanya ke KelanaAI Assistant / Knowledge Base.
    """
    question: str = Field(
        ...,
        min_length=2,
        description="Pertanyaan terkait panduan, regulasi, visa, atau informasi perjalanan",
        examples=["Do I need a visa to visit Japan?"],
    )
    mode: Optional[str] = Field(
        "rag",
        description="Mode inferensi: 'rag' (grounded dengan Knowledge Base) atau 'base' (pure LLM)",
        examples=["rag"],
    )


class AssistantQuestionResponse(BaseModel):
    """
    Schema model respons jawaban dari Knowledge Base / Assistant.
    """
    question: str
    answer: str
    sources: List[str] = []
    mode: str = "rag"
    model: str = "amazon.nova-lite-v1:0"


class AssistantCompareResponse(BaseModel):
    """
    Schema model respons perbandingan Side-by-Side: Base Model vs Grounded RAG.
    """
    question: str
    base_model: dict
    rag: dict
    comparison_summary: str


class AssistantDocumentInfo(BaseModel):
    """
    Schema model informasi dokumen dalam Knowledge Base.
    """
    filename: str
    title: str
    size_bytes: int
    topics: List[str] = []
    path: str


class AssistantDocumentListResponse(BaseModel):
    """
    Schema model daftar seluruh dokumen yang tersinkronisasi dalam Knowledge Base.
    """
    total_documents: int
    documents: List[AssistantDocumentInfo]


# ==========================================
# Pydantic Schemas - Conversational Memory & Chat (Session 10)
# ==========================================

class ConversationCreateRequest(BaseModel):
    """Schema model untuk membuat sesi percakapan baru."""
    title: Optional[str] = Field(None, max_length=256, description="Judul sesi percakapan", examples=["Japan Family Trip"])


class ConversationUpdateRequest(BaseModel):
    """Schema model untuk memperbarui judul percakapan (Rename)."""
    title: str = Field(..., min_length=1, max_length=256, description="Judul baru untuk percakapan", examples=["Japan Family Trip 2025"])


class MessageSendRequest(BaseModel):
    """Schema model untuk mengirim pesan baru ke asisten percakapan."""
    content: str = Field(..., min_length=1, description="Isi pesan dari pengguna", examples=["Plan a family trip to Japan."])


class MessageResponse(BaseModel):
    """Schema model respons satu pesan dalam percakapan."""
    id: int
    conversation_id: int
    role: str
    content: str
    created_at: Any

    model_config = ConfigDict(from_attributes=True)


class ConversationResponse(BaseModel):
    """Schema model respons ringkas entitas percakapan."""
    id: int
    conversation_id: int
    title: str
    created_at: Any
    updated_at: Optional[Any] = None
    message_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


class ConversationDetailResponse(BaseModel):
    """Schema model respons detail percakapan beserta riwayat lengkap pesan."""
    id: int
    conversation_id: int
    title: str
    created_at: Any
    updated_at: Optional[Any] = None
    messages: List[MessageResponse] = []

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Basic & Health Endpoints
# ==========================================

@app.get("/")
def home() -> dict:
    """Root endpoint sambutan KelanaAI."""
    return {"message": "Welcome to KelanaAI"}


@app.get("/health")
def health_check() -> dict:
    """Endpoint health check untuk memantau status aplikasi/server."""
    return {"status": "OK"}


# ==========================================
# Authentication Endpoints
# ==========================================

@app.post(
    "/api/v1/auth/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register New User",
    description="Mendaftarkan akun pengguna baru dengan password yang di-hash menggunakan bcrypt.",
)
def register(request: UserRegisterRequest, db: Session = Depends(get_db)):
    """Mendaftarkan akun baru dan langsung menghasilkan JWT access token."""
    user = register_user(db, name=request.name, email=request.email, password=request.password)
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    
    user_data = UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        total_trips=0,
    )
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_data,
    )


@app.post(
    "/api/v1/auth/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="User Login",
    description="Memverifikasi kredensial pengguna dan mengembalikan JWT access token.",
)
def login(request: UserLoginRequest, db: Session = Depends(get_db)):
    """Login pengguna dan mengembalikan JWT access token."""
    user = authenticate_user(db, email=request.email, password=request.password)
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    total_trips = db.query(Trip).filter(Trip.user_id == user.id).count()

    user_data = UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        total_trips=total_trips,
    )
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_data,
    )


@app.get(
    "/api/v1/auth/me",
    response_model=UserResponse,
    summary="Get Current Authenticated User",
    description="Mengambil profil dan total trip pengguna yang saat ini terautentikasi melalui JWT token.",
)
def get_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Mengembalikan data profil pengguna saat ini."""
    total_trips = db.query(Trip).filter(Trip.user_id == user.id).count()
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        total_trips=total_trips,
    )


# ==========================================
# Protected Trip Endpoints (CRUD with Ownership)
# ==========================================

@app.post(
    "/api/v1/trips",
    response_model=TripResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Trip Itinerary (Protected)",
    description="Membuat rencana perjalanan baru yang secara otomatis dikaitkan dengan user_id pengguna yang login.",
)
def create_trip(
    request: TripRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Membuat data perjalanan baru.
    Backend secara otomatis menetapkan ownership (user_id = user.id) dari JWT.
    """
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)

    trip = Trip(
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        category=category,
        daily_budget=daily_budget,
        travel_style=request.travel_style or "Standard",
        user_id=user.id,  # Ownership: backend assigns from authenticated JWT
    )

    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


@app.get(
    "/api/v1/trips",
    response_model=List[TripResponse],
    summary="List User's Trips (View: Only Own Trips)",
    description="Mengambil daftar riwayat perjalanan HANYA milik pengguna yang sedang login.",
)
def list_trips(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Mengambil data riwayat perjalanan milik pengguna yang sedang terautentikasi.
    Alice hanya melihat perjalanan milik Alice, Bob hanya melihat perjalanan milik Bob.
    """
    trips = db.query(Trip).filter(Trip.user_id == user.id).order_by(Trip.id.desc()).all()
    return trips


@app.get(
    "/api/v1/trips/{id}",
    response_model=TripResponse,
    summary="Get Trip Details (Protected & Ownership Checked)",
    description="Mengambil detail satu data perjalanan berdasarkan ID. Menolak akses (403) jika bukan milik user yang login.",
)
def get_trip(
    id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Mengambil detail data perjalanan berdasarkan ID.
    Jika ID tidak ditemukan: 404 Not Found.
    Jika bukan milik user login: 403 Forbidden.
    """
    trip = db.query(Trip).filter(Trip.id == id).first()
    if trip is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with id {id} not found",
        )

    # Ownership check
    if trip.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to view this trip",
        )

    return trip


@app.put(
    "/api/v1/trips/{id}",
    response_model=TripResponse,
    summary="Update Trip (Reject Other Users' Trips)",
    description="Memperbarui data perjalanan. Mengembalikan 403 Forbidden jika mencoba mengubah trip milik pengguna lain.",
)
def update_trip(
    id: int,
    request: TripUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Memperbarui data perjalanan tertentu.
    Jika ID tidak ditemukan: 404 Not Found.
    Jika bukan milik user login: 403 Forbidden.
    """
    trip = db.query(Trip).filter(Trip.id == id).first()
    if trip is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with id {id} not found",
        )

    # Ownership check: reject other users' update attempts
    if trip.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to update this trip",
        )

    if request.destination is not None:
        trip.destination = request.destination
    if request.days is not None:
        trip.days = request.days
    if request.travel_style is not None:
        trip.travel_style = request.travel_style

    trip.budget = request.budget

    # Recalculate business logic
    trip.daily_budget = calculate_daily_budget(trip.budget, trip.days)
    trip.category = get_trip_category(trip.budget)

    db.commit()
    db.refresh(trip)
    return trip


@app.delete(
    "/api/v1/trips/{id}",
    summary="Delete Trip (Reject Other Users' Trips)",
    description="Menghapus data perjalanan. Mengembalikan 403 Forbidden jika mencoba menghapus trip milik pengguna lain.",
)
def delete_trip(
    id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """
    Menghapus data perjalanan berdasarkan ID.
    Jika ID tidak ditemukan: 404 Not Found.
    Jika bukan milik user login: 403 Forbidden.
    """
    trip = db.query(Trip).filter(Trip.id == id).first()
    if trip is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with id {id} not found",
        )

    # Ownership check: reject other users' delete attempts
    if trip.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to delete this trip",
        )

    db.delete(trip)
    db.commit()
    return {"message": f"Trip with id {id} deleted successfully"}


@app.post(
    "/api/v1/trips/{id}/generate",
    response_model=TripGenerateResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate AI Travel Recommendation (Protected)",
    description="Menghasilkan rekomendasi rencana perjalanan AI dan menyimpannya ke database PostgreSQL untuk trip milik pengguna.",
)
def generate_trip_itinerary(
    id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Menghasilkan rekomendasi rencana perjalanan menggunakan Amazon Bedrock untuk trip milik user.
    Jika trip bukan milik user: 403 Forbidden.
    """
    trip = db.query(Trip).filter(Trip.id == id).first()
    if trip is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with id {id} not found",
        )

    # Ownership check
    if trip.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to generate recommendations for this trip",
        )

    try:
        ai_recommendation = generate_travel_recommendation(
            destination=trip.destination,
            days=trip.days,
            budget=trip.budget,
            category=trip.category,
            daily_budget=trip.daily_budget,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Bedrock AI generation failed: {str(e)}",
        )

    # Simpan hasil rekomendasi AI ke kolom ai_recommendation pada database
    trip.ai_recommendation = ai_recommendation
    db.commit()
    db.refresh(trip)

    return TripGenerateResponse(
        trip_id=trip.id,
        destination=trip.destination,
        recommendation=trip.ai_recommendation,
    )


# ==========================================
# Knowledge Base & RAG Assistant Endpoints (Session 9)
# ==========================================

@app.post(
    "/api/v1/assistant",
    response_model=AssistantQuestionResponse,
    status_code=status.HTTP_200_OK,
    summary="Ask KelanaAI Travel Assistant (RAG Grounded)",
    description="Mengajukan pertanyaan informasi/regulasi perjalanan. Backend mencari jawaban terverifikasi dari Basis Pengetahuan (Knowledge Base) dan menyertakan sitasi dokumen sumber.",
)
@app.post(
    "/api/v1/ask",
    response_model=AssistantQuestionResponse,
    status_code=status.HTTP_200_OK,
    summary="Ask KelanaAI Travel Assistant (RAG Alias)",
    description="Endpoint alternatif /api/v1/ask sesuai panduan materi Sesi 09.",
)
def ask_assistant(request: AssistantQuestionRequest) -> AssistantQuestionResponse:
    """
    Endpoint RAG Assistant:
    1. Jika mode == 'rag': Query ke Knowledge Base (retrieval + grounding + citation).
    2. Jika mode == 'base': Query ke Base Foundation Model tanpa Knowledge Base.
    """
    if request.mode == "base":
        result = ask_base_model(request.question)
    else:
        result = ask_knowledge_base(request.question)

    return AssistantQuestionResponse(
        question=result.get("question", request.question),
        answer=result.get("answer", ""),
        sources=result.get("sources", []),
        mode=result.get("mode", request.mode or "rag"),
        model=result.get("model", "amazon.nova-lite-v1:0"),
    )


@app.post(
    "/api/v1/assistant/compare",
    response_model=AssistantCompareResponse,
    status_code=status.HTTP_200_OK,
    summary="Compare RAG vs Base Model Answers",
    description="Membandingkan respons murni base model (tanpa dokumen) vs grounded RAG (dengan Basis Pengetahuan).",
)
def compare_assistant_modes(request: AssistantQuestionRequest) -> AssistantCompareResponse:
    """
    Membandingkan respons Base Model vs RAG untuk pertanyaan yang sama.
    """
    comparison = compare_rag_vs_base(request.question)
    return AssistantCompareResponse(
        question=comparison["question"],
        base_model=comparison["base_model"],
        rag=comparison["rag"],
        comparison_summary=comparison["comparison_summary"],
    )


@app.get(
    "/api/v1/assistant/documents",
    response_model=AssistantDocumentListResponse,
    status_code=status.HTTP_200_OK,
    summary="List Knowledge Base Documents",
    description="Mendapatkan daftar seluruh dokumen panduan perjalanan yang tersedia di Knowledge Base.",
)
def list_knowledge_documents() -> AssistantDocumentListResponse:
    """
    Mengembalikan daftar dokumen travel yang tersimpan di Knowledge Base.
    """
    docs = get_available_documents()
    return AssistantDocumentListResponse(
        total_documents=len(docs),
        documents=[
            AssistantDocumentInfo(
                filename=d["filename"],
                title=d["title"],
                size_bytes=d["size_bytes"],
                topics=d.get("topics", []),
                path=d["path"],
            )
            for d in docs
        ],
    )


# ==========================================
# Conversational Memory & Chat Endpoints (Session 10)
# ==========================================

@app.post(
    "/api/v1/conversations",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create New Conversation",
    description="Membuat sesi percakapan baru untuk pengguna terautentikasi dan mengembalikan identifier.",
)
def api_create_conversation(
    request: Optional[ConversationCreateRequest] = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ConversationResponse:
    title = request.title if request else None
    conversation = create_conversation(db, user_id=user.id, title=title)
    return ConversationResponse(
        id=conversation.id,
        conversation_id=conversation.id,
        title=conversation.title,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        message_count=0,
    )


@app.get(
    "/api/v1/conversations",
    response_model=List[ConversationResponse],
    summary="List User's Conversations",
    description="Mengambil daftar seluruh riwayat percakapan milik pengguna yang terautentikasi.",
)
def api_list_conversations(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[ConversationResponse]:
    conversations = list_conversations(db, user_id=user.id)
    return [
        ConversationResponse(
            id=c.id,
            conversation_id=c.id,
            title=c.title,
            created_at=c.created_at,
            updated_at=c.updated_at,
            message_count=len(c.messages) if c.messages else 0,
        )
        for c in conversations
    ]


@app.get(
    "/api/v1/conversations/{id}",
    response_model=ConversationDetailResponse,
    summary="Get Conversation Detail and History",
    description="Mengambil satu sesi percakapan beserta seluruh daftar pesan riwayatnya.",
)
def api_get_conversation(
    id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ConversationDetailResponse:
    conversation = get_conversation(db, conversation_id=id, user_id=user.id)
    messages = get_conversation_messages(db, conversation_id=id, user_id=user.id)
    return ConversationDetailResponse(
        id=conversation.id,
        conversation_id=conversation.id,
        title=conversation.title,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        messages=[
            MessageResponse(
                id=m.id,
                conversation_id=m.conversation_id,
                role=m.role,
                content=m.content,
                created_at=m.created_at,
            )
            for m in messages
        ],
    )


@app.get(
    "/api/v1/conversations/{id}/messages",
    response_model=List[MessageResponse],
    summary="Get Messages for Conversation",
    description="Mengambil riwayat pesan dari percakapan tertentu.",
)
def api_get_messages(
    id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[MessageResponse]:
    messages = get_conversation_messages(db, conversation_id=id, user_id=user.id)
    return [
        MessageResponse(
            id=m.id,
            conversation_id=m.conversation_id,
            role=m.role,
            content=m.content,
            created_at=m.created_at,
        )
        for m in messages
    ]


@app.post(
    "/api/v1/conversations/{id}/messages",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Send Message in Conversation",
    description="Mengirim pesan pengguna, membangun konteks percakapan multi-turn, memanggil Bedrock, dan menyimpan balasan AI.",
)
def api_send_message(
    id: int,
    request: MessageSendRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    ai_message = send_message_and_get_reply(
        db=db,
        conversation_id=id,
        user_id=user.id,
        user_content=request.content,
    )
    return MessageResponse(
        id=ai_message.id,
        conversation_id=ai_message.conversation_id,
        role=ai_message.role,
        content=ai_message.content,
        created_at=ai_message.created_at,
    )


@app.patch(
    "/api/v1/conversations/{id}",
    response_model=ConversationResponse,
    summary="Rename Conversation (Bonus Challenge)",
    description="Mengubah judul sesi percakapan.",
)
def api_update_conversation_title(
    id: int,
    request: ConversationUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ConversationResponse:
    conversation = update_conversation_title(
        db=db,
        conversation_id=id,
        user_id=user.id,
        new_title=request.title,
    )
    return ConversationResponse(
        id=conversation.id,
        conversation_id=conversation.id,
        title=conversation.title,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        message_count=len(conversation.messages) if conversation.messages else 0,
    )


@app.delete(
    "/api/v1/conversations/{id}",
    summary="Delete Conversation",
    description="Menghapus sesi percakapan beserta seluruh pesan di dalamnya.",
)
def api_delete_conversation(
    id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    delete_conversation(db, conversation_id=id, user_id=user.id)
    return {"message": f"Conversation with id {id} deleted successfully"}

