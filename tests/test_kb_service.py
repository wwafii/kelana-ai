"""
Unit and Integration Tests for Knowledge Base & RAG Assistant Service (Session 09)
"""

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.kb_service import (
    get_available_documents,
    retrieve_local_passages,
    ask_knowledge_base,
    ask_base_model,
    compare_rag_vs_base,
)

client = TestClient(app)


def test_get_available_documents():
    """Memastikan dokumen travel knowledge base terbaca dengan benar dari direktori."""
    docs = get_available_documents()
    assert len(docs) >= 3
    filenames = [d["filename"] for d in docs]
    assert any("korea" in f for f in filenames)
    assert any("singapore" in f for f in filenames)
    assert any("japan" in f for f in filenames)


def test_retrieve_local_passages_south_korea():
    """Memastikan retriever lokal dapat menemukan bagian relevan tentang K-ETA dan T-Money."""
    passages = retrieve_local_passages("How do I use T-Money card in South Korea and what is K-ETA?", top_k=2)
    assert len(passages) > 0
    assert "south-korea-travel-guide.md" in passages[0]["source"]
    assert "T-Money" in passages[0]["content"] or "K-ETA" in passages[0]["content"]


def test_retrieve_local_passages_singapore_chewing_gum():
    """Memastikan retriever lokal menemukan pasal larangan permen karet di Singapura."""
    passages = retrieve_local_passages("Is chewing gum prohibited in Singapore and what is the fine?", top_k=2)
    assert len(passages) > 0
    assert "singapore-travel-guide.md" in passages[0]["source"]
    assert "Chewing Gum" in passages[0]["content"] or "gum" in passages[0]["content"].lower()


def test_retrieve_local_passages_japan_shinkansen_luggage():
    """Memastikan retriever lokal menemukan regulasi bagasi Shinkansen di Jepang."""
    passages = retrieve_local_passages("What are the oversized luggage dimensions for Shinkansen in Japan?", top_k=2)
    assert len(passages) > 0
    assert "japan-travel-insurance-and-customs.md" in passages[0]["source"]
    assert "160" in passages[0]["content"] or "Shinkansen" in passages[0]["content"]


@patch("backend.services.bedrock_service.get_bedrock_client")
def test_ask_knowledge_base_mocked(mock_get_client):
    """Menguji fungsi ask_knowledge_base dengan mock Bedrock client."""
    mock_bedrock = MagicMock()
    mock_bedrock.converse.return_value = {
        "output": {
            "message": {
                "content": [
                    {"text": "Under Singapore law, the import and sale of chewing gum is prohibited with fines starting at SGD 1,000. Source: singapore-travel-guide.md"}
                ]
            }
        }
    }
    mock_get_client.return_value = mock_bedrock

    response = ask_knowledge_base("Is chewing gum allowed in Singapore?")
    assert "singapore-travel-guide.md" in response["sources"][0]
    assert response["mode"] == "rag"
    assert "chewing gum" in response["answer"].lower() or "singapore" in response["answer"].lower()


@patch("backend.services.bedrock_service.get_bedrock_client")
def test_ask_base_model_mocked(mock_get_client):
    """Menguji fungsi ask_base_model (tanpa knowledge base)."""
    mock_bedrock = MagicMock()
    mock_bedrock.converse.return_value = {
        "output": {
            "message": {
                "content": [
                    {"text": "Singapore is known for strict cleanliness laws."}
                ]
            }
        }
    }
    mock_get_client.return_value = mock_bedrock

    response = ask_base_model("Tell me about Singapore rules")
    assert response["mode"] == "base_model"
    assert response["sources"] == []
    assert len(response["answer"]) > 0


@patch("backend.services.kb_service.ask_base_model")
@patch("backend.services.kb_service.ask_knowledge_base")
def test_compare_rag_vs_base(mock_ask_kb, mock_ask_base):
    """Menguji fungsi perbandingan side-by-side RAG vs Base Model."""
    mock_ask_base.return_value = {
        "question": "Can I bring medication to Japan?",
        "answer": "You might need a doctor's note.",
        "sources": [],
        "model": "amazon.nova-lite-v1:0",
    }
    mock_ask_kb.return_value = {
        "question": "Can I bring medication to Japan?",
        "answer": "Up to 1-month supply allowed. For more or injectables, apply for Yakkan Shoumei certificate.",
        "sources": ["knowledge-docs/japan-travel-insurance-and-customs.md"],
        "model": "amazon.nova-lite-v1:0",
    }

    comp = compare_rag_vs_base("Can I bring medication to Japan?")
    assert comp["question"] == "Can I bring medication to Japan?"
    assert comp["base_model"]["sources"] == []
    assert "japan-travel-insurance-and-customs.md" in comp["rag"]["sources"][0]
    assert "comparison_summary" in comp


# =======================================================
# REST API Endpoint Tests
# =======================================================

def test_api_list_documents():
    """Menguji endpoint GET /api/v1/assistant/documents."""
    response = client.get("/api/v1/assistant/documents")
    assert response.status_code == 200
    data = response.json()
    assert data["total_documents"] >= 3
    assert len(data["documents"]) >= 3
    assert "filename" in data["documents"][0]
    assert "title" in data["documents"][0]


@patch("backend.services.kb_service.ask_knowledge_base")
def test_api_post_assistant_rag(mock_ask_kb):
    """Menguji endpoint POST /api/v1/assistant dalam mode RAG."""
    mock_ask_kb.return_value = {
        "question": "What is the tax refund threshold in South Korea?",
        "answer": "The instant tax refund threshold is 15,000 KRW per receipt at certified Tax-Free stores.",
        "sources": ["knowledge-docs/south-korea-travel-guide.md"],
        "mode": "rag",
        "model": "amazon.nova-lite-v1:0",
    }

    response = client.post(
        "/api/v1/assistant",
        json={"question": "What is the tax refund threshold in South Korea?", "mode": "rag"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["mode"] == "rag"
    assert "15,000 KRW" in data["answer"]
    assert "south-korea-travel-guide.md" in data["sources"][0]


@patch("backend.services.kb_service.ask_knowledge_base")
def test_api_post_ask_alias(mock_ask_kb):
    """Menguji endpoint alias POST /api/v1/ask."""
    mock_ask_kb.return_value = {
        "question": "Do I need a visa to visit Japan?",
        "answer": "Indonesian IC e-Passport holders can obtain visa waiver pre-registration.",
        "sources": ["knowledge-docs/japan-travel-insurance-and-customs.md"],
        "mode": "rag",
        "model": "amazon.nova-lite-v1:0",
    }

    response = client.post(
        "/api/v1/ask",
        json={"question": "Do I need a visa to visit Japan?"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["question"] == "Do I need a visa to visit Japan?"
    assert len(data["sources"]) > 0


@patch("backend.services.kb_service.compare_rag_vs_base")
def test_api_post_assistant_compare(mock_compare):
    """Menguji endpoint POST /api/v1/assistant/compare."""
    mock_compare.return_value = {
        "question": "What is SG Arrival Card?",
        "base_model": {"answer": "A generic card", "sources": [], "model": "amazon.nova-lite-v1:0"},
        "rag": {"answer": "Mandatory digital submission within 3 days prior", "sources": ["knowledge-docs/singapore-travel-guide.md"], "model": "amazon.nova-lite-v1:0"},
        "comparison_summary": "RAG provided exact 3-day timeline and official ICA portal reference.",
    }

    response = client.post(
        "/api/v1/assistant/compare",
        json={"question": "What is SG Arrival Card?"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "base_model" in data
    assert "rag" in data
    assert len(data["rag"]["sources"]) > 0
