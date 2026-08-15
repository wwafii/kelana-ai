"""
KelanaAI - Web Layer (FastAPI REST API)
Menyediakan REST API endpoints untuk asisten perjalanan KelanaAI
dengan mengintegrasikan Business Logic Layer dari services.trip_service.
"""

import os
import sys
from fastapi import FastAPI
from pydantic import BaseModel, Field

# Memastikan direktori backend berada di sys.path agar impor modul services berjalan lancar
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
)

app = FastAPI(
    title="KelanaAI",
    description="RESTful Web API for AI-Powered Travel Planning Assistant",
    version="0.3.0",
)


class TripRequest(BaseModel):
    """
    Schema model validasi request body untuk perencanaan perjalanan.
    """
    destination: str = Field(..., description="Destinasi atau kota/negara tujuan perjalanan", example="Japan")
    days: int = Field(..., gt=0, description="Durasi perjalanan dalam hari", example=5)
    budget: float = Field(..., ge=0, description="Total anggaran perjalanan", example=2000.0)


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


@app.post("/api/v1/trips")
def create_trip(request: TripRequest) -> dict:
    """
    Membuat rekomendasi dan ringkasan kalkulasi perjalanan berdasarkan data input.
    Menggunakan kembali logika bisnis yang ada di services/trip_service.py.
    """
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)

    return {
        "destination": request.destination,
        "days": request.days,
        "budget": request.budget,
        "daily_budget": daily_budget,
        "category": category,
    }
