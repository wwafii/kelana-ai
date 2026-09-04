"""
Integration tests for KelanaAI Conversational Memory Endpoints (Session 10)
Covering:
- POST /api/v1/conversations (Create conversation)
- GET /api/v1/conversations (List user's conversations)
- GET /api/v1/conversations/{id} (Get conversation detail)
- GET /api/v1/conversations/{id}/messages (Get conversation messages)
- POST /api/v1/conversations/{id}/messages (Multi-turn send message with context reconstruction)
- PATCH /api/v1/conversations/{id} (Rename conversation - Bonus Challenge)
- DELETE /api/v1/conversations/{id} (Delete conversation)
- AuthN / AuthZ Ownership Protection (401 Unauthorized & 403 Forbidden)
"""

import os
import sys
import uuid
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

import main
from main import app
from database import init_db

# Ensure tables are initialized
init_db()

client = TestClient(app)


def register_user(name: str = "Alice", email: str = None, password: str = "password123"):
    """Helper untuk mendaftarkan user baru dan mengembalikan authorization headers."""
    if email is None:
        email = f"chat_user_{uuid.uuid4().hex[:8]}@example.com"

    res = client.post("/api/v1/auth/register", json={
        "name": name,
        "email": email,
        "password": password,
    })
    assert res.status_code in [200, 201], f"Registration failed: {res.text}"
    data = res.json()
    token = data["access_token"]
    return {
        "user_id": data["user"]["id"],
        "email": email,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }


class TestConversationalMemory:
    def test_create_and_list_conversations(self):
        """User dapat membuat percakapan baru dan melihat daftar percakapan miliknya."""
        user = register_user("Traveler One")

        # 1. Buat percakapan baru
        res = client.post(
            "/api/v1/conversations",
            json={"title": "Japan Family Trip"},
            headers=user["headers"],
        )
        assert res.status_code == 201
        data = res.json()
        assert "conversation_id" in data
        assert data["conversation_id"] == data["id"]
        assert data["title"] == "Japan Family Trip"
        conv_id = data["conversation_id"]

        # 2. Buat percakapan kedua
        res2 = client.post(
            "/api/v1/conversations",
            json={"title": "Singapore Food Tour"},
            headers=user["headers"],
        )
        assert res2.status_code == 201

        # 3. List percakapan
        list_res = client.get("/api/v1/conversations", headers=user["headers"])
        assert list_res.status_code == 200
        conversations = list_res.json()
        assert len(conversations) >= 2
        titles = [c["title"] for c in conversations]
        assert "Japan Family Trip" in titles
        assert "Singapore Food Tour" in titles

    def test_ownership_isolation_between_users(self):
        """User A tidak dapat melihat, mengubah, atau mengirim pesan ke percakapan User B (403 Forbidden)."""
        alice = register_user("Alice")
        bob = register_user("Bob")

        # Alice membuat percakapan
        alice_conv = client.post(
            "/api/v1/conversations",
            json={"title": "Alice Secret Trip"},
            headers=alice["headers"],
        ).json()
        conv_id = alice_conv["conversation_id"]

        # Bob mencoba melihat percakapan Alice
        bob_get = client.get(f"/api/v1/conversations/{conv_id}", headers=bob["headers"])
        assert bob_get.status_code == 403

        # Bob mencoba mengirim pesan ke percakapan Alice
        bob_send = client.post(
            f"/api/v1/conversations/{conv_id}/messages",
            json={"content": "Can I join?"},
            headers=bob["headers"],
        )
        assert bob_send.status_code == 403

        # Bob mencoba rename percakapan Alice
        bob_patch = client.patch(
            f"/api/v1/conversations/{conv_id}",
            json={"title": "Hacked Title"},
            headers=bob["headers"],
        )
        assert bob_patch.status_code == 403

        # Bob mencoba menghapus percakapan Alice
        bob_delete = client.delete(f"/api/v1/conversations/{conv_id}", headers=bob["headers"])
        assert bob_delete.status_code == 403

        # Pastikan percakapan Alice tidak muncul di daftar percakapan Bob
        bob_list = client.get("/api/v1/conversations", headers=bob["headers"]).json()
        bob_conv_ids = [c["id"] for c in bob_list]
        assert conv_id not in bob_conv_ids

    def test_unauthenticated_requests_return_401(self):
        """Request tanpa JWT token ditolak dengan HTTP 401 Unauthorized."""
        assert client.get("/api/v1/conversations").status_code == 401
        assert client.post("/api/v1/conversations", json={"title": "Test"}).status_code == 401
        assert client.get("/api/v1/conversations/1").status_code == 401
        assert client.post("/api/v1/conversations/1/messages", json={"content": "Hi"}).status_code == 401

    @patch("services.conversation_service.get_bedrock_client")
    def test_multi_turn_conversational_memory(self, mock_bedrock_client_factory):
        """
        Pengujian Multi-Turn Conversational Memory:
        Turn 1: User meminta rencana liburan Jepang -> AI menjawab itinerary.
        Turn 2: User bertanya lanjutan "What about Day 2?" -> Backend mengirimkan riwayat lengkap
        (Turn 1 user + Turn 1 assistant + Turn 2 user) ke Amazon Bedrock.
        """
        user = register_user("Charlie")

        # Mock Bedrock Runtime Converse client
        mock_bedrock = MagicMock()
        mock_bedrock_client_factory.return_value = mock_bedrock

        # Response simulasi untuk Turn 1
        mock_bedrock.converse.side_effect = [
            {
                "output": {
                    "message": {
                        "role": "assistant",
                        "content": [{"text": "Here is a 5-day Tokyo–Kyoto itinerary with family-friendly stops..."}],
                    }
                }
            },
            {
                "output": {
                    "message": {
                        "role": "assistant",
                        "content": [{"text": "Day 2: explore Asakusa, Senso-ji Temple, and the Sumida River cruise."}],
                    }
                }
            },
        ]

        # 1. Buat percakapan
        conv = client.post(
            "/api/v1/conversations",
            json={"title": "Japan Family Trip"},
            headers=user["headers"],
        ).json()
        conv_id = conv["conversation_id"]

        # 2. TURN 1: Kirim pesan pertama
        t1_res = client.post(
            f"/api/v1/conversations/{conv_id}/messages",
            json={"content": "Plan a Japan trip."},
            headers=user["headers"],
        )
        assert t1_res.status_code == 200
        t1_data = t1_res.json()
        assert t1_data["role"] == "assistant"
        assert "Tokyo–Kyoto" in t1_data["content"]
        assert "created_at" in t1_data

        # Verifikasi panggilan Bedrock Turn 1:
        assert mock_bedrock.converse.call_count == 1
        call_args_1 = mock_bedrock.converse.call_args_list[0][1]
        sent_messages_1 = call_args_1["messages"]
        assert len(sent_messages_1) == 1
        assert sent_messages_1[0]["role"] == "user"
        assert sent_messages_1[0]["content"][0]["text"] == "Plan a Japan trip."

        # 3. TURN 2: Kirim pertanyaan lanjutan yang bergantung konteks
        t2_res = client.post(
            f"/api/v1/conversations/{conv_id}/messages",
            json={"content": "What about Day 2?"},
            headers=user["headers"],
        )
        assert t2_res.status_code == 200
        t2_data = t2_res.json()
        assert t2_data["role"] == "assistant"
        assert "Asakusa" in t2_data["content"]

        # Verifikasi panggilan Bedrock Turn 2 menerima RIWAYAT LENGKAP:
        assert mock_bedrock.converse.call_count == 2
        call_args_2 = mock_bedrock.converse.call_args_list[1][1]
        sent_messages_2 = call_args_2["messages"]
        # Harusnya ada 3 pesan: Turn 1 User, Turn 1 Assistant, Turn 2 User
        assert len(sent_messages_2) == 3
        assert sent_messages_2[0]["role"] == "user"
        assert sent_messages_2[0]["content"][0]["text"] == "Plan a Japan trip."
        assert sent_messages_2[1]["role"] == "assistant"
        assert "Tokyo–Kyoto" in sent_messages_2[1]["content"][0]["text"]
        assert sent_messages_2[2]["role"] == "user"
        assert sent_messages_2[2]["content"][0]["text"] == "What about Day 2?"

        # 4. Verifikasi riwayat pesan saat memanggil GET /api/v1/conversations/{id}
        detail_res = client.get(f"/api/v1/conversations/{conv_id}", headers=user["headers"])
        assert detail_res.status_code == 200
        detail = detail_res.json()
        assert len(detail["messages"]) == 4  # 2 user + 2 assistant
        assert detail["messages"][0]["role"] == "user"
        assert detail["messages"][1]["role"] == "assistant"
        assert detail["messages"][2]["role"] == "user"
        assert detail["messages"][3]["role"] == "assistant"

    def test_rename_and_delete_conversation(self):
        """User dapat mengganti nama (rename) dan menghapus (delete) percakapan."""
        user = register_user("David")

        # Buat percakapan
        conv = client.post(
            "/api/v1/conversations",
            json={"title": "Old Title"},
            headers=user["headers"],
        ).json()
        conv_id = conv["conversation_id"]

        # Rename
        patch_res = client.patch(
            f"/api/v1/conversations/{conv_id}",
            json={"title": "Korea Backpacking 2026"},
            headers=user["headers"],
        )
        assert patch_res.status_code == 200
        assert patch_res.json()["title"] == "Korea Backpacking 2026"

        # Delete
        del_res = client.delete(f"/api/v1/conversations/{conv_id}", headers=user["headers"])
        assert del_res.status_code == 200

        # Verifikasi 404 setelah dihapus
        get_res = client.get(f"/api/v1/conversations/{conv_id}", headers=user["headers"])
        assert get_res.status_code == 404
