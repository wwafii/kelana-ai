"""Services package for KelanaAI business logic, AI integration, and authentication."""

from .trip_service import (
    calculate_daily_budget,
    get_recommended_places,
    get_transportation_recommendation,
    get_travel_season,
    get_trip_category,
)
from .bedrock_service import (
    build_rich_prompt,
    generate_travel_recommendation,
    get_bedrock_client,
)
from .auth_service import (
    authenticate_user,
    create_access_token,
    get_current_user,
    hash_password,
    register_user,
    verify_password,
)

__all__ = [
    "calculate_daily_budget",
    "get_recommended_places",
    "get_transportation_recommendation",
    "get_travel_season",
    "get_trip_category",
    "build_rich_prompt",
    "generate_travel_recommendation",
    "get_bedrock_client",
    "authenticate_user",
    "create_access_token",
    "get_current_user",
    "hash_password",
    "register_user",
    "verify_password",
]
