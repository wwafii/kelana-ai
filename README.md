# KelanaAI

KelanaAI adalah aplikasi asisten perjalanan cerdas yang dirancang untuk membantu pengguna merencanakan perjalanan mereka.

## 📁 Struktur Proyek

```text
KelanaAi/
├── .gitignore
├── README.md
├── requirements.txt               # Dependensi proyek (FastAPI, Uvicorn)
├── backend/
│   ├── main.py                    # Web Layer (FastAPI REST API)
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

### 3. Sesi 3: Teaching KelanaAI to Communicate (REST API dengan FastAPI)
- **Web Layer (REST API)**: Mengonversi interface konsol menjadi REST API berbasis FastAPI.
- **Prinsip Separation of Concerns**: Menggunakan kembali seluruh kode logika bisnis dari `trip_service.py` tanpa perubahan.
- **Model Validasi Pydantic**: `TripRequest` untuk memvalidasi request body secara otomatis.
- **REST Endpoints**:
  - `GET /`: Sambutan (`{"message": "Welcome to KelanaAI"}`)
  - `GET /health`: Health check server (`{"status": "OK"}`)
  - `POST /api/v1/trips`: Menghitung alokasi harian dan kategori perjalanan.
- **Dokumentasi Interaktif**: Swagger UI otomatis di `/docs` dan ReDoc di `/redoc`.

---

## 🛠️ Cara Menjalankan

### 1. Install Dependensi
```bash
pip install -r requirements.txt
```

### 2. Jalankan FastAPI Server dengan Uvicorn

Dari root direktori:
```bash
uvicorn backend.main:app --reload
```

Atau masuk ke direktori `backend`:
```bash
cd backend
uvicorn main:app --reload
```

Server akan aktif di `http://localhost:8000`.

### 3. Akses Swagger UI
Buka browser dan navigasikan ke:
```text
http://localhost:8000/docs
```

---

## 📡 Dokumentasi Endpoint & Contoh Penggunaan

### 1. Welcome Message
- **Endpoint**: `GET /`
- **Response (200 OK)**:
```json
{
  "message": "Welcome to KelanaAI"
}
```

### 2. Health Check
- **Endpoint**: `GET /health`
- **Response (200 OK)**:
```json
{
  "status": "OK"
}
```

### 3. Trip Calculation
- **Endpoint**: `POST /api/v1/trips`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "destination": "Japan",
  "days": 5,
  "budget": 2000
}
```
- **Response (200 OK)**:
```json
{
  "destination": "Japan",
  "days": 5,
  "budget": 2000.0,
  "daily_budget": 400.0,
  "category": "Standard"
}
```
