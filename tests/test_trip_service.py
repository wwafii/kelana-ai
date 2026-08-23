"""
Unit tests for KelanaAI Business Logic Layer (backend/services/trip_service.py).
"""

import os
import sys

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from services.trip_service import (
    calculate_daily_budget,
    get_recommended_places,
    get_transportation_recommendation,
    get_travel_season,
    get_trip_category,
)


class TestCalculateDailyBudget:
    def test_normal_calculation(self):
        assert calculate_daily_budget(2000.0, 5) == 400.0
        assert calculate_daily_budget(1500.0, 3) == 500.0

    def test_zero_days(self):
        assert calculate_daily_budget(2000.0, 0) == 0.0

    def test_negative_days(self):
        assert calculate_daily_budget(2000.0, -2) == 0.0


class TestGetTripCategory:
    def test_backpacker_usd(self):
        assert get_trip_category(500.0, "USD") == "Backpacker"
        assert get_trip_category(999.0, "USD") == "Backpacker"

    def test_standard_usd(self):
        assert get_trip_category(1000.0, "USD") == "Standard"
        assert get_trip_category(2000.0, "USD") == "Standard"
        assert get_trip_category(3000.0, "USD") == "Standard"

    def test_luxury_usd(self):
        assert get_trip_category(3001.0, "USD") == "Luxury"
        assert get_trip_category(5000.0, "USD") == "Luxury"

    def test_multi_currency_idr(self):
        # 10,000,000 IDR / 16000 = 625 USD -> Backpacker
        assert get_trip_category(10_000_000, "IDR") == "Backpacker"
        # 25,000,000 IDR / 16000 = 1562.5 USD -> Standard
        assert get_trip_category(25_000_000, "IDR") == "Standard"
        # 60,000,000 IDR / 16000 = 3750 USD -> Luxury
        assert get_trip_category(60_000_000, "IDR") == "Luxury"


class TestGetTravelSeason:
    def test_peak_season(self):
        assert get_travel_season("December") == "Peak Season"
        assert get_travel_season("Desember") == "Peak Season"
        assert get_travel_season("12") == "Peak Season"

    def test_holiday_season(self):
        assert get_travel_season("June") == "Holiday Season"
        assert get_travel_season("Juni") == "Holiday Season"
        assert get_travel_season("6") == "Holiday Season"

    def test_regular_season(self):
        assert get_travel_season("January") == "Regular Season"
        assert get_travel_season("March") == "Regular Season"
        assert get_travel_season("October") == "Regular Season"


class TestGetRecommendedPlaces:
    def test_japan(self):
        places = get_recommended_places("Japan")
        assert "Tokyo Tower" in places
        assert "Mount Fuji" in places

    def test_bali(self):
        places = get_recommended_places("Bali, Indonesia")
        assert "Tanah Lot" in places

    def test_korea(self):
        places = get_recommended_places("Seoul, South Korea")
        assert "Gyeongbokgung Palace" in places

    def test_france(self):
        places = get_recommended_places("Paris, France")
        assert "Eiffel Tower" in places


class TestGetTransportationRecommendation:
    def test_backpacker(self):
        assert get_transportation_recommendation("Backpacker") == "Bus"

    def test_standard(self):
        assert get_transportation_recommendation("Standard") == "Train"

    def test_luxury(self):
        assert get_transportation_recommendation("Luxury") == "Flight"
