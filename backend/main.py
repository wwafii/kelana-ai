"""
KelanaAI - Web Layer (FastAPI REST API)
Menyediakan REST API endpoints untuk asisten perjalanan KelanaAI
dengan mengintegrasikan Business Logic Layer (services.trip_service)
dan Persistence Layer (database PostgreSQL via SQLAlchemy ORM).
"""

import os
import sys
from typing import List, Optional
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field

# Memastikan direktori backend berada di sys.path agar impor modul services dan database berjalan lancar
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, init_db
from models.trip import Trip
from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
)

app = FastAPI(
    title="KelanaAI",
    description="RESTful Web API with PostgreSQL Persistence for AI-Powered Travel Planning Assistant",
    version="0.4.0",
)

# Inisialisasi tabel database saat aplikasi dimuat
init_db()


class TripRequest(BaseModel):
    """
    Schema model validasi request body untuk pembuatan data perjalanan baru.
    """
    destination: str = Field(..., description="Destinasi atau kota/negara tujuan perjalanan", example="Japan")
    days: int = Field(..., gt=0, description="Durasi perjalanan dalam hari", example=5)
    budget: float = Field(..., ge=0, description="Total anggaran perjalanan", example=2000.0)


class TripUpdate(BaseModel):
    """
    Schema model validasi request body untuk pembaruan anggaran (budget) perjalanan.
    """
    budget: float = Field(..., ge=0, description="Total anggaran perjalanan yang baru", example=2500.0)
    destination: Optional[str] = Field(None, description="Destinasi tujuan perjalanan baru (opsional)", example="Japan")
    days: Optional[int] = Field(None, gt=0, description="Durasi perjalanan baru dalam hari (opsional)", example=5)


class TripResponse(BaseModel):
    """
    Schema model respons data perjalanan tersimpan.
    """
    id: int
    destination: str
    days: int
    budget: float
    category: str
    daily_budget: float

    model_config = ConfigDict(from_attributes=True)


@app.get("/")
def home() -> dict:
    """
    Root endpoint sambutan KelanaAI.
    """
    return {"message": "Welcome to KelanaAI"}


@app.get("/health")
def health_check() -> dict:
    """
    Endpoint health check untuk memantau status aplikasi/server.
    """
    return {"status": "OK"}


@app.post("/api/v1/trips", response_model=TripResponse)
def create_trip(request: TripRequest):
    """
    Membuat data perjalanan baru, menghitung alokasi harian dan kategori,
    lalu menyimpannya secara persisten ke database PostgreSQL.
    """
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)

    trip = Trip(
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        category=category,
        daily_budget=daily_budget,
    )

    db = SessionLocal()
    try:
        db.add(trip)
        db.commit()
        db.refresh(trip)
        return trip
    finally:
        db.close()


@app.get("/api/v1/trips", response_model=List[TripResponse])
def list_trips():
    """
    Mengambil seluruh daftar riwayat data perjalanan yang tersimpan di PostgreSQL.
    """
    db = SessionLocal()
    try:
        trips = db.query(Trip).all()
        return trips
    finally:
        db.close()


@app.get("/api/v1/trips/{id}", response_model=TripResponse)
def get_trip(id: int):
    """
    Mengambil detail satu data perjalanan berdasarkan ID dari database PostgreSQL.
    Jika ID tidak ditemukan, mengembalikan HTTP 404.
    """
    db = SessionLocal()
    try:
        trip = db.query(Trip).filter(Trip.id == id).first()
        if trip is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trip with id {id} not found",
            )
        return trip
    finally:
        db.close()


@app.put("/api/v1/trips/{id}", response_model=TripResponse)
def update_trip(id: int, request: TripUpdate):
    """
    Memperbarui anggaran (budget) perjalanan tertentu berdasarkan ID.
    Sebelum menyimpan ke database, nilai category dan daily_budget
    dihitung ulang secara otomatis.
    Jika ID tidak ditemukan, mengembalikan HTTP 404.
    """
    db = SessionLocal()
    try:
        trip = db.query(Trip).filter(Trip.id == id).first()
        if trip is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trip with id {id} not found",
            )

        if request.destination is not None:
            trip.destination = request.destination
        if request.days is not None:
            trip.days = request.days

        trip.budget = request.budget

        # Hitung ulang logika bisnis (recalculate category & daily_budget)
        trip.daily_budget = calculate_daily_budget(trip.budget, trip.days)
        trip.category = get_trip_category(trip.budget)

        db.commit()
        db.refresh(trip)
        return trip
    finally:
        db.close()


@app.delete("/api/v1/trips/{id}")
def delete_trip(id: int) -> dict:
    """
    Menghapus data perjalanan dari database PostgreSQL berdasarkan ID.
    Jika ID tidak ditemukan, mengembalikan HTTP 404.
    """
    db = SessionLocal()
    try:
        trip = db.query(Trip).filter(Trip.id == id).first()
        if trip is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trip with id {id} not found",
            )

        db.delete(trip)
        db.commit()
        return {"message": f"Trip with id {id} deleted successfully"}
    finally:
        db.close()
