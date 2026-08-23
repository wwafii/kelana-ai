"""
Integration tests for KelanaAI FastAPI REST API Endpoints (backend/main.py).
"""

import os
import sys
from unittest.mock import patch
from fastapi.testclient import TestClient

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

import main
from main import app
from database import SessionLocal, init_db
from models.trip import Trip

# Ensure tables are initialized
init_db()

client = TestClient(app)


class TestBasicEndpoints:
    def test_root_endpoint(self):
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "Welcome to KelanaAI"}

    def test_health_endpoint(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "OK"}


class TestTripCRUDEndpoints:
    def test_create_and_get_trip(self):
        # Create Trip
        payload = {
            "destination": "Kyoto, Japan",
            "days": 4,
            "budget": 1600.0,
        }
        res = client.post("/api/v1/trips", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["destination"] == "Kyoto, Japan"
        assert data["days"] == 4
        assert data["budget"] == 1600.0
        assert data["daily_budget"] == 400.0
        assert data["category"] == "Standard"
        assert "id" in data
        trip_id = data["id"]

        # Get Trip by ID
        get_res = client.get(f"/api/v1/trips/{trip_id}")
        assert get_res.status_code == 200
        assert get_res.json()["id"] == trip_id

    def test_get_nonexistent_trip(self):
        res = client.get("/api/v1/trips/999999")
        assert res.status_code == 404
        assert "not found" in res.json()["detail"].lower()

    def test_update_trip_budget_recalculation(self):
        # Create trip
        res = client.post("/api/v1/trips", json={
            "destination": "Osaka",
            "days": 2,
            "budget": 600.0,
        })
        trip_id = res.json()["id"]
        assert res.json()["category"] == "Backpacker"

        # Update budget to 4000 (Luxury)
        update_res = client.put(f"/api/v1/trips/{trip_id}", json={"budget": 4000.0})
        assert update_res.status_code == 200
        updated = update_res.json()
        assert updated["budget"] == 4000.0
        assert updated["category"] == "Luxury"
        assert updated["daily_budget"] == 2000.0

    def test_delete_trip(self):
        # Create trip
        res = client.post("/api/v1/trips", json={
            "destination": "Sapporo",
            "days": 3,
            "budget": 900.0,
        })
        trip_id = res.json()["id"]

        # Delete trip
        del_res = client.delete(f"/api/v1/trips/{trip_id}")
        assert del_res.status_code == 200
        assert "deleted successfully" in del_res.json()["message"]

        # Verify it's gone
        get_res = client.get(f"/api/v1/trips/{trip_id}")
        assert get_res.status_code == 404


class TestAIGenerationEndpoint:
    def test_generate_ai_recommendation_and_persistence(self):
        # 1. Create a trip
        res = client.post("/api/v1/trips", json={
            "destination": "Tokyo",
            "days": 3,
            "budget": 2100.0,
        })
        assert res.status_code == 200
        trip_id = res.json()["id"]

        sample_itinerary = (
            "Day 1: Exploring Tokyo\n\n"
            "Morning:\n"
            "- Visit Senso-ji Temple early to avoid crowds.\n"
            "- Take a stroll around Nakamise Shopping Street.\n"
            "- Have breakfast at a traditional local bakery nearby.\n\n"
            "Afternoon:\n"
            "- Experience a traditional Japanese tea ceremony.\n"
            "- Explore the Tokyo National Museum to learn about local culture.\n\n"
            "Evening:\n"
            "- Enjoy dinner at an authentic Izakaya in Hoppy Street.\n"
            "- Experience the vibrant local nightlife and city lights around Asakusa."
        )

        # 2. Call generate endpoint
        with patch.object(main, "generate_travel_recommendation", return_value=sample_itinerary):
            gen_res = client.post(f"/api/v1/trips/{trip_id}/generate")
            assert gen_res.status_code == 200, gen_res.text
            gen_data = gen_res.json()
            assert gen_data["trip_id"] == trip_id
            assert gen_data["destination"] == "Tokyo"
            assert gen_data["recommendation"] == sample_itinerary

        # 3. Verify PostgreSQL database persistence
        db = SessionLocal()
        persisted_trip = db.query(Trip).filter(Trip.id == trip_id).first()
        assert persisted_trip is not None
        assert persisted_trip.ai_recommendation == sample_itinerary
        db.close()

        # 4. Verify GET /api/v1/trips/{id} returns saved ai_recommendation
        get_res = client.get(f"/api/v1/trips/{trip_id}")
        assert get_res.status_code == 200
        assert get_res.json()["ai_recommendation"] == sample_itinerary

    def test_generate_nonexistent_trip_returns_404(self):
        res = client.post("/api/v1/trips/999999/generate")
        assert res.status_code == 404
        assert "not found" in res.json()["detail"].lower()
