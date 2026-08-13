# KelanaAI

KelanaAI adalah aplikasi asisten perjalanan cerdas yang dirancang untuk membantu pengguna merencanakan perjalanan mereka.

## 📁 Struktur Proyek

```text
KelanaAi/
├── .gitignore
├── README.md
├── backend/
│   ├── main.py                    # Presentation Layer (CLI I/O)
│   └── services/                  # Business Logic Layer
│       ├── __init__.py
│       └── trip_service.py        # Logic: Category, Season, Daily Budget, Recommendations
└── frontend/
    └── .gitkeep                   # Reserved for Next.js (Session 5+)
```

---

## 🚀 Fitur

### 1. Sesi 1: Trip Summary Generator (Console App)
- Menerima data input perjalanan (destinasi, hari, anggaran, mata uang, dan bulan keberangkatan).
- Menampilkan ringkasan informasi perjalanan terstruktur.

### 2. Sesi 2: Recommendation Engine & Layered Architecture
- **Layered Architecture**: Pemisahan antarmuka pengguna (`backend/main.py`) dengan logika bisnis (`backend/services/trip_service.py`).
- **Kategori Perjalanan (`get_trip_category`)**:
  - `< 1000` &rarr; `Backpacker`
  - `1000 - 3000` &rarr; `Standard`
  - `> 3000` &rarr; `Luxury`
- **Kategori Season (`get_travel_season`)**:
  - `December` &rarr; `Peak Season`
  - `June` &rarr; `Holiday Season`
  - Bulan lainnya &rarr; `Regular Season`
- **Kalkulasi Anggaran Harian (`calculate_daily_budget`)**: Menghitung alokasi anggaran per hari (`budget / days`).
- **Rekomendasi Tempat (`get_recommended_places`)**: Menampilkan daftar destinasi wisata rekomendasi.

---

## 🛠️ Cara Menjalankan

1. Pastikan Python 3 sudah terpasang di sistem Anda.
2. Jalankan aplikasi melalui terminal:

```bash
python3 backend/main.py
```

### Contoh Penggunaan

```text
=== Welcome to KelanaAI Recommendation Generator ===

Enter destination: Japan
Enter duration (days): 5
Enter budget: 1500
Enter currency (e.g. USD, IDR): USD
Enter travel month: December

==================================
KelanaAI
==================================
Destination     : Japan
Days            : 5
Budget          : 1500 USD
Category        : Standard
Daily Budget    : 300 USD/Day
Travel Month    : December
Season          : Peak Season

Recommended Places
- Tokyo Tower
- Shibuya
- Mount Fuji
```
