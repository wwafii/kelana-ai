"""
Unit tests for KelanaAI Bedrock Service Layer (backend/services/bedrock_service.py).
"""

import os
import sys
from unittest.mock import MagicMock, patch

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from services.bedrock_service import (
    build_rich_prompt,
    generate_travel_recommendation,
    get_bedrock_client,
)


class TestBuildRichPrompt:
    def test_prompt_contains_trip_details(self):
        prompt = build_rich_prompt(
            destination="Tokyo, Japan",
            days=5,
            budget=2000.0,
            category="Standard",
            daily_budget=400.0,
        )
        assert "Tokyo, Japan" in prompt
        assert "5 days" in prompt
        assert "$2,000.00 USD" in prompt
        assert "$400.00 USD/day" in prompt
        assert "Standard" in prompt

    def test_prompt_contains_mandatory_checklist_criteria(self):
        prompt = build_rich_prompt(
            destination="Kyoto",
            days=3,
            budget=1500.0,
            category="Standard",
            daily_budget=500.0,
        )
        # Checklist 1: Morning activities: 2-3 activities per day
        assert "Morning" in prompt
        assert "2-3" in prompt

        # Checklist 1: Afternoon activities: cultural sites and local experiences
        assert "Afternoon" in prompt
        assert "cultural" in prompt.lower()

        # Checklist 1: Evening activities: dinner spots and nightlife
        assert "Evening" in prompt
        assert "dinner" in prompt.lower()
        assert "nightlife" in prompt.lower()

    def test_prompt_format_instructions(self):
        prompt = build_rich_prompt(
            destination="Bali",
            days=4,
            budget=800.0,
            category="Backpacker",
            daily_budget=200.0,
        )
        assert "Day 1:" in prompt
        assert "bullet points (-)" in prompt.lower()


class TestGenerateTravelRecommendation:
    @patch("services.bedrock_service.get_bedrock_client")
    def test_successful_bedrock_invocation(self, mock_get_client):
        mock_client = MagicMock()
        mock_client.converse.return_value = {
            "output": {
                "message": {
                    "content": [
                        {"text": "Day 1: Exploring Tokyo\nMorning:\n- Visit Senso-ji"}
                    ]
                }
            }
        }
        mock_get_client.return_value = mock_client

        result = generate_travel_recommendation(
            destination="Tokyo",
            days=3,
            budget=1500.0,
            category="Standard",
            daily_budget=500.0,
        )

        assert "Day 1: Exploring Tokyo" in result
        assert mock_client.converse.called

    @patch("services.bedrock_service.get_bedrock_client")
    def test_bedrock_error_handling(self, mock_get_client):
        from botocore.exceptions import ClientError

        mock_client = MagicMock()
        mock_client.converse.side_effect = ClientError(
            {"Error": {"Code": "AccessDeniedException", "Message": "Invalid token"}},
            "Converse",
        )
        mock_get_client.return_value = mock_client

        try:
            generate_travel_recommendation(
                destination="Tokyo",
                days=3,
                budget=1500.0,
                category="Standard",
                daily_budget=500.0,
            )
            assert False, "Should have raised RuntimeError"
        except RuntimeError as e:
            assert "Amazon Bedrock invocation failed" in str(e)
