"""
Modul layanan logika bisnis KelanaAI untuk rekomendasi perjalanan.
Berisi fungsi-fungsi murni untuk kalkulasi anggaran, kategorisasi perjalanan,
musim perjalanan, dan daftar rekomendasi destinasi.
"""

from typing import List


def calculate_daily_budget(budget: float, days: int) -> float:
    """
    Menghitung alokasi anggaran harian pengguna (budget / days).

    Args:
        budget (float): Total anggaran perjalanan.
        days (int): Durasi perjalanan dalam hari.

    Returns:
        float: Alokasi anggaran per hari.
    """
    if days <= 0:
        return 0.0
    return budget / days


def get_trip_category(budget: float, currency: str = "USD") -> str:
    """
    Menentukan kategori perjalanan berdasarkan besaran anggaran dan mata uang.
    Mendukung konversi/normalisasi multi-mata uang (seperti IDR, USD, SGD, EUR, dll.) ke basis USD.

    Aturan Kategori (Basis USD):
    - Budget < 1000          -> "Backpacker"
    - 1000 <= Budget <= 3000 -> "Standard"
    - Budget > 3000          -> "Luxury"

    Args:
        budget (float): Total anggaran perjalanan.
        currency (str, optional): Kode mata uang (contoh: "USD", "IDR"). Default "USD".

    Returns:
        str: Kategori perjalanan ("Backpacker", "Standard", atau "Luxury").
    """
    rates_to_usd = {
        "USD": 1.0,
        "IDR": 1 / 16000.0,
        "SGD": 0.75,
        "EUR": 1.08,
        "GBP": 1.28,
        "JPY": 0.0067,
        "MYR": 0.22,
        "AUD": 0.65,
    }

    curr = str(currency).strip().upper()
    rate = rates_to_usd.get(curr, 1.0)
    budget_in_usd = budget * rate

    if budget_in_usd < 1000:
        return "Backpacker"
    elif budget_in_usd <= 3000:
        return "Standard"
    else:
        return "Luxury"


def get_travel_season(month: str) -> str:
    """
    Menentukan kategori musim wisata berdasarkan bulan keberangkatan.
    - December / 12 -> "Peak Season"
    - June / 6      -> "Holiday Season"
    - Bulan lainnya -> "Regular Season"

    Args:
        month (str): Bulan keberangkatan (contoh: "December", "June", "12").

    Returns:
        str: Kategori musim ("Peak Season", "Holiday Season", atau "Regular Season").
    """
    cleaned_month = str(month).strip().capitalize()
    if cleaned_month in ("December", "Desember", "12"):
        return "Peak Season"
    elif cleaned_month in ("June", "Juni", "6", "06"):
        return "Holiday Season"
    else:
        return "Regular Season"


def get_recommended_places(destination: str = "") -> List[str]:
    """
    Mengembalikan daftar tempat rekomendasi wisata berdasarkan destinasi tujuan.

    Args:
        destination (str): Nama destinasi atau kota/negara tujuan.

    Returns:
        List[str]: Koleksi rekomendasi tempat wisata.
    """
    dest = destination.strip().lower()
    if any(keyword in dest for keyword in ("japan", "jepang", "tokyo", "osaka", "kyoto")):
        return ["Tokyo Tower", "Shibuya", "Mount Fuji"]
    elif "bali" in dest:
        return ["Ubud Monkey Forest", "Tanah Lot", "Kuta Beach"]
    elif any(keyword in dest for keyword in ("korea", "seoul")):
        return ["Gyeongbokgung Palace", "N Seoul Tower", "Myeongdong"]
    elif any(keyword in dest for keyword in ("france", "paris", "prancis")):
        return ["Eiffel Tower", "Louvre Museum", "Arc de Triomphe"]
    else:
        return ["Tokyo Tower", "Shibuya", "Mount Fuji"]


def get_transportation_recommendation(category: str) -> str:
    """
    Menentukan rekomendasi moda transportasi berdasarkan kategori perjalanan.
    - Backpacker -> "Bus"
    - Standard   -> "Train"
    - Luxury     -> "Flight"

    Args:
        category (str): Kategori perjalanan.

    Returns:
        str: Rekomendasi moda transportasi.
    """
    cat = category.strip().capitalize()
    if cat == "Backpacker":
        return "Bus"
    elif cat == "Standard":
        return "Train"
    elif cat == "Luxury":
        return "Flight"
    return "Train"
