"""
KelanaAI - Presentation Layer (CLI)
Menangani input/output dari pengguna dan menampilkan rekomendasi perjalanan.
"""

import os
import sys

# Memastikan direktori backend berada di sys.path agar impor modul services berjalan lancar
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.trip_service import (
    calculate_daily_budget,
    get_recommended_places,
    get_travel_season,
    get_trip_category,
)


def print_trip_summary(
    destination: str,
    days: int,
    budget: float,
    currency: str,
    travel_month: str,
) -> None:
    """
    Mencetak ringkasan rekomendasi perjalanan yang terstruktur berdasarkan kalkulasi dan analisis bisnis.
    """
    category = get_trip_category(budget)
    daily_budget = calculate_daily_budget(budget, days)
    season = get_travel_season(travel_month)
    places = get_recommended_places(destination)

    formatted_budget = (
        f"{int(budget)} {currency}"
        if budget.is_integer()
        else f"{budget} {currency}"
    )
    formatted_daily_budget = (
        f"{int(daily_budget)} {currency}/Day"
        if daily_budget.is_integer()
        else f"{daily_budget:.2f} {currency}/Day"
    )

    print("\n==================================")
    print("KelanaAI")
    print("==================================")
    print(f"Destination     : {destination}")
    print(f"Days            : {days}")
    print(f"Budget          : {formatted_budget}")
    print(f"Category        : {category}")
    print(f"Daily Budget    : {formatted_daily_budget}")
    print(f"Travel Month    : {travel_month}")
    print(f"Season          : {season}")
    print("\nRecommended Places")
    for place in places:
        print(f"- {place}")


def main() -> None:
    """
    Fungsi utama untuk menerima input interaktif dari pengguna dan menjalankan Recommendation Engine.
    """
    print("=== Welcome to KelanaAI Recommendation Generator ===\n")

    destination = input("Enter destination: ").strip()
    days = int(input("Enter duration (days): ").strip())
    budget = float(input("Enter budget: ").strip())
    currency = input("Enter currency (e.g. USD, IDR): ").strip()
    if not currency:
        currency = "USD"
    travel_month = input("Enter travel month: ").strip()

    print_trip_summary(
        destination=destination,
        days=days,
        budget=budget,
        currency=currency,
        travel_month=travel_month,
    )


if __name__ == "__main__":
    main()
