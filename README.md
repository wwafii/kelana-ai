# KelanaAI

KelanaAI adalah aplikasi asisten perjalanan cerdas yang dirancang untuk membantu pengguna merencanakan perjalanan mereka.

## 📁 Struktur Proyek

```text
KelanaAi/
├── .env.example
├── .gitignore
├── README.md
├── requirements.txt               # Dependensi proyek (FastAPI, Uvicorn, SQLAlchemy, psycopg2-binary, python-dotenv)
├── backend/
│   ├── database.py                # Persistence Layer (DB Engine & SessionLocal)
│   ├── main.py                    # Web Layer (FastAPI REST API CRUD)
│   ├── models/                    # Data Layer (SQLAlchemy ORM Models)
│   │   ├── __init__.py
│   │   └── trip.py                # Model Tabel Trip
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
- **Dokumentasi Interaktif**: Swagger UI otomatis di `/docs` dan ReDoc di `/redoc`.

### 4. Sesi 4: Teaching KelanaAI to Remember (Persistence Layer & CRUD API)
- **Persistence Layer**: Integrasi database PostgreSQL menggunakan ORM SQLAlchemy.
- **Stateful Application**: Data perjalanan kini tersimpan secara permanen di database PostgreSQL dan bertahan meskipun server di-restart.
- **Full CRUD Endpoints**:
  - `POST /api/v1/trips`: Menyimpan perjalanan baru dengan auto-generated ID dan kalkulasi otomatis.
  - `GET /api/v1/trips`: Mengambil seluruh riwayat data perjalanan.
  - `GET /api/v1/trips/{id}`: Mengambil detail satu perjalanan berdasarkan ID (mengembalikan 404 jika tidak ditemukan).
  - `PUT /api/v1/trips/{id}`: Memperbarui budget perjalanan dan menghitung ulang (*recalculate*) `category` serta `daily_budget` sebelum disimpan.
  - `DELETE /api/v1/trips/{id}`: Menghapus data perjalanan dari database (mengembalikan 404 jika tidak ditemukan).

---

## 🛠️ Cara Menjalankan

### 1. Konfigurasi Environment & Install Dependensi
Buat file `.env` dari template `.env.example`:
```bash
cp .env.example .env
```
Sesuaikan konfigurasi `DATABASE_URL` di dalam file `.env`:
```env
DATABASE_URL=postgresql+psycopg2://<user>:<password>@localhost:5432/kelana_ai
```

Install seluruh dependensi:
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

### 3. Create Trip (POST)
- **Endpoint**: `POST /api/v1/trips`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "destination": "Japan",
  "days": 5,
  "budget": 2000.0
}
```
- **Response (200 OK)**:
```json
{
  "id": 1,
  "destination": "Japan",
  "days": 5,
  "budget": 2000.0,
  "category": "Standard",
  "daily_budget": 400.0
}
```

### 4. List All Trips (GET)
- **Endpoint**: `GET /api/v1/trips`
- **Response (200 OK)**:
```json
[
  {
    "id": 1,
    "destination": "Japan",
    "days": 5,
    "budget": 2000.0,
    "category": "Standard",
    "daily_budget": 400.0
  }
]
```

### 5. Get Trip by ID (GET)
- **Endpoint**: `GET /api/v1/trips/{id}`
- **Response (200 OK)**:
```json
{
  "id": 1,
  "destination": "Japan",
  "days": 5,
  "budget": 2000.0,
  "category": "Standard",
  "daily_budget": 400.0
}
```
- **Response jika ID tidak ditemukan (404 Not Found)**:
```json
{
  "detail": "Trip with id 999 not found"
}
```

### 6. Update Trip Budget (PUT)
- **Endpoint**: `PUT /api/v1/trips/{id}`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "budget": 4000.0
}
```
- **Response (200 OK)** (Nilai `category` dan `daily_budget` otomatis dihitung ulang):
```json
{
  "id": 1,
  "destination": "Japan",
  "days": 5,
  "budget": 4000.0,
  "category": "Luxury",
  "daily_budget": 800.0
}
```

### 7. Delete Trip (DELETE)
- **Endpoint**: `DELETE /api/v1/trips/{id}`
- **Response (200 OK)**:
```json
{
  "message": "Trip with id 1 deleted successfully"
}
```
- **Response jika ID tidak ditemukan (404 Not Found)**:
```json
{
  "detail": "Trip with id 1 not found"
}
```
