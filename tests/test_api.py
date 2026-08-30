"""
Integration tests for KelanaAI FastAPI REST API Endpoints (backend/main.py)
Covering Basic, Authentication, Authorization, Ownership Protection (View/Update/Delete),
and AI Generation Endpoints.
"""

import os
import sys
import uuid
from unittest.mock import patch
from fastapi.testclient import TestClient

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

import main
from main import app
from database import SessionLocal, init_db
from models.trip import Trip
from models.user import User

# Ensure tables are initialized
init_db()

client = TestClient(app)


def create_test_user(name: str = "Alice", email: str = None, password: str = "password123"):
    """Helper to register a unique test user and return the token and user data."""
    if email is None:
        email = f"user_{uuid.uuid4().hex[:8]}@example.com"

    res = client.post("/api/v1/auth/register", json={
        "name": name,
        "email": email,
        "password": password,
    })
    assert res.status_code in [200, 201], f"Failed to register test user: {res.text}"
    data = res.json()
    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    return {"token": token, "headers": headers, "user": data["user"], "email": email, "password": password}


class TestBasicEndpoints:
    def test_root_endpoint(self):
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "Welcome to KelanaAI"}

    def test_health_endpoint(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "OK"}


class TestAuthEndpoints:
    def test_register_and_login_success(self):
        unique_email = f"alice_{uuid.uuid4().hex[:8]}@example.com"
        reg_res = client.post("/api/v1/auth/register", json={
            "name": "Alice Wonderland",
            "email": unique_email,
            "password": "securepassword123",
        })
        assert reg_res.status_code == 201
        reg_data = reg_res.json()
        assert "access_token" in reg_data
        assert reg_data["user"]["email"] == unique_email
        assert reg_data["user"]["name"] == "Alice Wonderland"

        # Test login
        login_res = client.post("/api/v1/auth/login", json={
            "email": unique_email,
            "password": "securepassword123",
        })
        assert login_res.status_code == 200
        login_data = login_res.json()
        assert "access_token" in login_data
        assert login_data["user"]["email"] == unique_email

    def test_register_duplicate_email_fails(self):
        unique_email = f"dup_{uuid.uuid4().hex[:8]}@example.com"
        res1 = client.post("/api/v1/auth/register", json={
            "name": "First User",
            "email": unique_email,
            "password": "password123",
        })
        assert res1.status_code == 201

        res2 = client.post("/api/v1/auth/register", json={
            "name": "Second User",
            "email": unique_email,
            "password": "password123",
        })
        assert res2.status_code == 400
        assert "already registered" in res2.json()["detail"].lower()

    def test_login_invalid_credentials(self):
        unique_email = f"user_{uuid.uuid4().hex[:8]}@example.com"
        client.post("/api/v1/auth/register", json={
            "name": "Test User",
            "email": unique_email,
            "password": "correctpassword",
        })

        # Wrong password
        res_wrong_pw = client.post("/api/v1/auth/login", json={
            "email": unique_email,
            "password": "wrongpassword",
        })
        assert res_wrong_pw.status_code == 401

        # Non-existent email
        res_wrong_email = client.post("/api/v1/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "correctpassword",
        })
        assert res_wrong_email.status_code == 401

    def test_get_current_user_profile(self):
        user_info = create_test_user("Charlie")
        res = client.get("/api/v1/auth/me", headers=user_info["headers"])
        assert res.status_code == 200
        data = res.json()
        assert data["email"] == user_info["email"]
        assert data["name"] == "Charlie"
        assert "total_trips" in data


class TestOwnershipAndProtectionEndpoints:
    def test_unauthenticated_requests_rejected(self):
        # Without Authorization header
        assert client.get("/api/v1/trips").status_code == 401
        assert client.post("/api/v1/trips", json={"destination": "Tokyo", "days": 3, "budget": 1000}).status_code == 401
        assert client.get("/api/v1/trips/1").status_code == 401
        assert client.put("/api/v1/trips/1", json={"budget": 1200}).status_code == 401
        assert client.delete("/api/v1/trips/1").status_code == 401
        assert client.post("/api/v1/trips/1/generate").status_code == 401

    def test_view_only_own_trips(self):
        alice = create_test_user("Alice")
        bob = create_test_user("Bob")

        # Alice creates 2 trips
        res_a1 = client.post("/api/v1/trips", json={"destination": "Kyoto, Japan", "days": 4, "budget": 1600.0, "travel_style": "Family"}, headers=alice["headers"])
        assert res_a1.status_code == 201
        res_a2 = client.post("/api/v1/trips", json={"destination": "Osaka, Japan", "days": 3, "budget": 900.0, "travel_style": "Solo"}, headers=alice["headers"])
        assert res_a2.status_code == 201

        # Bob creates 1 trip
        res_b1 = client.post("/api/v1/trips", json={"destination": "Seoul, Korea", "days": 5, "budget": 2000.0, "travel_style": "Couple"}, headers=bob["headers"])
        assert res_b1.status_code == 201

        # Alice views trips -> sees only her trips
        alice_trips_res = client.get("/api/v1/trips", headers=alice["headers"])
        assert alice_trips_res.status_code == 200
        alice_trips = alice_trips_res.json()
        alice_destinations = [t["destination"] for t in alice_trips]
        assert "Kyoto, Japan" in alice_destinations
        assert "Osaka, Japan" in alice_destinations
        assert "Seoul, Korea" not in alice_destinations

        # Bob views trips -> sees only his trips
        bob_trips_res = client.get("/api/v1/trips", headers=bob["headers"])
        assert bob_trips_res.status_code == 200
        bob_trips = bob_trips_res.json()
        bob_destinations = [t["destination"] for t in bob_trips]
        assert "Seoul, Korea" in bob_destinations
        assert "Kyoto, Japan" not in bob_destinations
        assert "Osaka, Japan" not in bob_destinations

    def test_get_detail_rejects_other_users_trips(self):
        alice = create_test_user("Alice")
        bob = create_test_user("Bob")

        res_a = client.post("/api/v1/trips", json={"destination": "Hokkaido", "days": 5, "budget": 2500.0}, headers=alice["headers"])
        trip_id = res_a.json()["id"]

        # Alice can get her trip
        assert client.get(f"/api/v1/trips/{trip_id}", headers=alice["headers"]).status_code == 200

        # Bob cannot get Alice's trip -> 403 Forbidden
        bob_get_res = client.get(f"/api/v1/trips/{trip_id}", headers=bob["headers"])
        assert bob_get_res.status_code == 403
        assert "forbidden" in bob_get_res.json()["detail"].lower() or "not authorized" in bob_get_res.json()["detail"].lower()

    def test_update_rejects_other_users_trips(self):
        alice = create_test_user("Alice")
        bob = create_test_user("Bob")

        res_a = client.post("/api/v1/trips", json={"destination": "Tokyo", "days": 3, "budget": 600.0}, headers=alice["headers"])
        trip_id = res_a.json()["id"]

        # Bob tries to update Alice's trip -> 403 Forbidden
        bob_update = client.put(f"/api/v1/trips/{trip_id}", json={"budget": 5000.0}, headers=bob["headers"])
        assert bob_update.status_code == 403

        # Alice updates her trip -> 200 OK & recalculates
        alice_update = client.put(f"/api/v1/trips/{trip_id}", json={"budget": 4500.0}, headers=alice["headers"])
        assert alice_update.status_code == 200
        updated = alice_update.json()
        assert updated["budget"] == 4500.0
        assert updated["category"] == "Luxury"
        assert updated["daily_budget"] == 1500.0

    def test_delete_rejects_other_users_trips(self):
        alice = create_test_user("Alice")
        bob = create_test_user("Bob")

        res_a = client.post("/api/v1/trips", json={"destination": "Nara", "days": 2, "budget": 500.0}, headers=alice["headers"])
        trip_id = res_a.json()["id"]

        # Bob tries to delete Alice's trip -> 403 Forbidden
        bob_del = client.delete(f"/api/v1/trips/{trip_id}", headers=bob["headers"])
        assert bob_del.status_code == 403

        # Alice can delete her trip -> 200 OK
        alice_del = client.delete(f"/api/v1/trips/{trip_id}", headers=alice["headers"])
        assert alice_del.status_code == 200
        assert "deleted successfully" in alice_del.json()["message"]

        # Verify it's gone
        assert client.get(f"/api/v1/trips/{trip_id}", headers=alice["headers"]).status_code == 404

    def test_generate_ai_recommendation_ownership_and_persistence(self):
        alice = create_test_user("Alice")
        bob = create_test_user("Bob")

        res_a = client.post("/api/v1/trips", json={"destination": "Tokyo", "days": 3, "budget": 2100.0}, headers=alice["headers"])
        trip_id = res_a.json()["id"]

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

        # Bob cannot generate itinerary for Alice's trip -> 403 Forbidden
        bob_gen = client.post(f"/api/v1/trips/{trip_id}/generate", headers=bob["headers"])
        assert bob_gen.status_code == 403

        # Alice generates recommendation
        with patch.object(main, "generate_travel_recommendation", return_value=sample_itinerary):
            gen_res = client.post(f"/api/v1/trips/{trip_id}/generate", headers=alice["headers"])
            assert gen_res.status_code == 200, gen_res.text
            gen_data = gen_res.json()
            assert gen_data["trip_id"] == trip_id
            assert gen_data["destination"] == "Tokyo"
            assert gen_data["recommendation"] == sample_itinerary

        # Verify database persistence
        db = SessionLocal()
        persisted_trip = db.query(Trip).filter(Trip.id == trip_id).first()
        assert persisted_trip is not None
        assert persisted_trip.ai_recommendation == sample_itinerary
        assert persisted_trip.user_id == alice["user"]["id"]
        db.close()

        # Alice retrieves the persisted recommendation
        get_res = client.get(f"/api/v1/trips/{trip_id}", headers=alice["headers"])
        assert get_res.status_code == 200
        assert get_res.json()["ai_recommendation"] == sample_itinerary
