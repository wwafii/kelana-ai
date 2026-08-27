# KelanaAI

KelanaAI adalah aplikasi asisten perjalanan cerdas berbasis AI (*AI-Native Travel Planner*) yang menggabungkan kecerdasan **Amazon Bedrock (Generative AI)**, kecepatan dan keandalan **FastAPI (Python REST API)**, persistensi **PostgreSQL (SQLAlchemy ORM)**, serta antarmuka modern multi-halaman **Next.js 15 (React 19 & Tailwind CSS)**.

---

## 📁 Struktur Proyek & Clean Architecture

Aplikasi dibangun dengan prinsip **Clean Architecture & Separation of Concerns**:

```text
KelanaAi/
├── .env.example
├── .gitignore
├── README.md
├── requirements.txt               # Dependensi backend (FastAPI, Uvicorn, SQLAlchemy, psycopg2-binary, boto3, pytest)
├── backend/
│   ├── database.py                # Persistence Layer (DB Engine, SessionLocal, get_db Dependency & Schema Migration)
│   ├── main.py                    # Web Layer (FastAPI REST API CRUD & AI Generation with Dependency Injection)
│   ├── models/                    # Data Layer (SQLAlchemy ORM Models)
│   │   ├── __init__.py
│   │   └── trip.py                # Model Tabel Trip (destinasi, hari, budget, kategori, gaya perjalanan, rekomendasi AI)
│   └── services/                  # Business Logic & AI Services Layer
│       ├── __init__.py
│       ├── trip_service.py        # Logic: Category, Season, Daily Budget, Transport & Destination Recommendations
│       └── bedrock_service.py     # AI Integration: Amazon Bedrock Converse API & Prompt Engineering
├── frontend/                      # User Interface Layer (Next.js 15, React 19, Tailwind CSS)
│   ├── app/
│   │   ├── globals.css            # Tailwind CSS styling & custom animations
│   │   ├── layout.tsx             # Root layout with navigation & typography
│   │   ├── page.tsx               # / -> Home & AI Travel Planner Generator
│   │   └── trips/
│   │       ├── page.tsx           # /trips -> Trip History Dashboard (Search, Sort, Filter, Stats & Pagination)
│   │       └── [id]/
│   │           └── page.tsx       # /trips/[id] -> Dynamic Route: Detailed Itinerary View & AI Generator
│   ├── components/                # Reusable UI Component Library
│   │   ├── Navbar.tsx             # Responsive sticky navigation header with route tracking
│   │   ├── Hero.tsx               # Destination hero visual banner & quick suggestion pills
│   │   ├── TravelForm.tsx         # Responsive travel planner form with real-time budget calculation
│   │   ├── TripCard.tsx           # Rich trip cards (Flags, Landmarks, Currency Format, Category & Style Badges)
│   │   ├── Pagination.tsx         # Accessible, responsive pagination controls for > 10 items
│   │   ├── ItineraryResult.tsx    # Rich structured itinerary breakdown cards (Morning/Afternoon/Evening)
│   │   ├── FormattedText.tsx      # Markdown bold & typography parser
│   │   ├── LoadingSpinner.tsx     # Animated Bedrock AI thinking loading indicator
│   │   ├── ErrorMessage.tsx       # Graceful error banner with retry controls
│   │   ├── DestinationShowcase.tsx# Curated popular destination cards
│   │   ├── Features.tsx           # Architecture & workflow overview
│   │   └── Footer.tsx             # Informative footer with copyright & navigation links
│   ├── services/                  # Networking / API Client Layer
│   │   └── tripService.ts         # Centralized API service layer (getTrips, getTrip, createTrip, generateItinerary, deleteTrip)
│   ├── lib/
│   │   ├── api.ts                 # Re-export API service for backward compatibility
│   │   └── parser.ts              # Intelligent itinerary markdown/text parser
│   └── types/
│       └── index.ts               # TypeScript data definitions & interface models
└── tests/                         # Automated Test Suite (Pytest)
    ├── test_api.py                # REST API Integration & CRUD tests
    ├── test_bedrock_service.py    # Amazon Bedrock AI service tests
    └── test_trip_service.py       # Pure business logic unit tests
```

---

## 🚀 Fitur & Milestone Pengembangan

### 1. Sesi 1: Trip Summary Generator (Console App)
- Menerima data input perjalanan (destinasi, durasi hari, anggaran, mata uang, dan bulan keberangkatan).
- Menampilkan ringkasan informasi perjalanan terstruktur pada antarmuka konsol.

### 2. Sesi 2: Recommendation Engine & Layered Architecture
- **Layered Architecture**: Pemisahan antarmuka pengguna (`backend/main.py`) dengan logika bisnis (`backend/services/trip_service.py`).
- **Kategori Perjalanan (`get_trip_category`)**:
  - `< 1000 USD` &rarr; `Backpacker`
  - `1000 - 3000 USD` &rarr; `Standard`
  - `> 3000 USD` &rarr; `Luxury`
- **Kategori Season (`get_travel_season`)**:
  - `December` &rarr; `Peak Season`, `June` &rarr; `Holiday Season`, Lainnya &rarr; `Regular Season`.
- **Kalkulasi Anggaran Harian (`calculate_daily_budget`)**: Menghitung alokasi harian (`budget / days`).

### 3. Sesi 3: Teaching KelanaAI to Communicate (REST API dengan FastAPI)
- **Web Layer (REST API)**: Mengonversi antarmuka konsol menjadi REST API berbasis FastAPI.
- **Model Validasi Pydantic**: Validasi otomatis payload request dan serialisasi respons.
- **Dokumentasi Interaktif**: Swagger UI otomatis di `/docs` dan ReDoc di `/redoc`.

### 4. Sesi 4: Teaching KelanaAI to Remember (Persistence Layer & CRUD API)
- **Persistence Layer**: Integrasi database PostgreSQL menggunakan ORM SQLAlchemy.
- **Full CRUD Endpoints**: `POST`, `GET`, `PUT`, dan `DELETE` untuk mengelola data perjalanan secara persisten.

### 5. Sesi 5: Teaching KelanaAI to Think with AI (Amazon Bedrock Integration)
- **AI-Native Transformation**: Integrasi Amazon Bedrock Foundation Models (Amazon Nova Lite / Claude).
- **Richer Prompt Engineering**: Rencana perjalanan harian (*structured daily plan*) yang terbagi menjadi slot *Morning*, *Afternoon*, dan *Evening*.
- **Endpoint Generasi AI**: `POST /api/v1/trips/{id}/generate` untuk meng-generate dan menyimpan rekomendasi ke database PostgreSQL.

### 6. Sesi 6: Giving KelanaAI a Face (Next.js Frontend & Tailwind CSS)
- **Modern Web Interface**: Antarmuka web interaktif menggunakan Next.js 15, React 19, TypeScript, dan Tailwind CSS.
- **Interactive Travel Planner Form**: Real-time daily budget calculation, kategori otomatis (*tier preview*), dan integrasi mulus dengan REST API.

### 7. Sesi 7: Connecting KelanaAI's Brain and Face (Trip History Dashboard & Multi-Page Flow)
- **Multi-Page App Routing**: Navigasi lengkap antara `/` (Home), `/trips` (Dashboard), dan `/trips/[id]` (Detail View).
- **DB-First Reads Architecture**: Menjelajahi riwayat trip membaca langsung dari PostgreSQL (cepat dan tanpa biaya token Bedrock berulang).
- **API Service Layer ([`frontend/services/tripService.ts`](frontend/services/tripService.ts))**: Sentralisasi pemanggilan networking API ke file service terpisah.
- **Komponen Kartu Perjalanan ([`TripCard.tsx`](frontend/components/TripCard.tsx))**:
  - 🚩 **Destination Icon / Flag & Landmark Visual**: Deteksi otomatis bendera negara (🇯🇵 Japan, 🇮🇩 Indonesia/Bali, 🇫🇷 France, 🇸🇬 Singapore, 🇰🇷 South Korea, 🇺🇸 USA, 🇮🇹 Italy, dll.) dan landmark khas.
  - 💵 **Currency & Budget Formatting**: Format anggaran rapi `USD 2,000` dan `USD 400 / day` dengan pemisah ribuan.
  - 🏷️ **Color-Coded Category Badge**: *Backpacker* (Emerald), *Standard* (Sky Blue), *Luxury* (Purple/Gold).
  - 🎒 **Travel Style Badge**: *Family*, *Solo*, *Couple*.
  - 🔗 **Direct Navigation**: Tautan *"View Details →"* menuju halaman detail dinamis.
- **Fitur Pencarian & Pengurutan Real-Time (Search & Sort)**: Filter instan berdasarkan nama destinasi / gaya liburan serta sorting (*Latest*, *Oldest*, *Budget High/Low*, *Duration*).
- **Paginasi Interaktif ([`Pagination.tsx`](frontend/components/Pagination.tsx))**: Paginasi otomatis saat data melebihi 10 items.
- **Empty & Error States**: Panduan visual ramah pengguna saat data kosong atau saat server backend sedang offline.
- **Dynamic Route Detail Page ([`app/trips/[id]/page.tsx`](frontend/app/trips/[id]/page.tsx))**: Tampilan jadwal terperinci, rekomendasi kuliner, tips praktis, serta fitur *Copy* dan *Print/Save PDF*.

---

## 🛠️ Cara Menjalankan Aplikasi

Jalankan backend dan frontend secara bersamaan menggunakan dua terminal terpisah:

### 🖥️ 1. Menjalankan Backend (FastAPI + PostgreSQL)

1. Buat file konfigurasi `.env` dari template:
```bash
cp .env.example .env
```

2. Sesuaikan konfigurasi di `.env`:
```env
DATABASE_URL=postgresql+psycopg2://root:root@localhost:5432/kelana_ai
AWS_REGION=ap-southeast-2
MODEL_ID=amazon.nova-lite-v1:0
AWS_BEARER_TOKEN_BEDROCK=sk-bedrock-xxxxxxxxxxxxxxxxxxxx
```

3. Install dependensi dan jalankan server FastAPI:
```bash
# Aktifkan virtual environment
source .venv/bin/activate

# Install dependensi
pip install -r requirements.txt

# Jalankan server
uvicorn backend.main:app --reload --port 8000
```
* **REST API Endpoint**: `http://localhost:8000`
* **Swagger API Docs**: `http://localhost:8000/docs`

---

### 🌐 2. Menjalankan Frontend (Next.js)

1. Buka terminal baru, masuk ke direktori `frontend`, dan jalankan development server:
```bash
cd frontend
npm install
npm run dev
```

2. Buka antarmuka aplikasi di browser:
* **Home / Generator**: [http://localhost:3000](http://localhost:3000)
* **Trip History Dashboard**: [http://localhost:3000/trips](http://localhost:3000/trips)

---

## 🧪 Menjalankan Pengujian Otomatis (Testing)

Jalankan suite pengujian unit dan integrasi Pytest:
```bash
pytest
```
*Hasil: 30 test cases passed (Business Logic, Bedrock Service, REST API CRUD & Database Persistence).*

---

## 📡 Dokumentasi Endpoint REST API

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/` | Root welcome message |
| `GET` | `/health` | Server health check status |
| `POST` | `/api/v1/trips` | Membuat data perjalanan baru (Auto-calculate category & daily budget) |
| `GET` | `/api/v1/trips` | Mengambil seluruh riwayat perjalanan dari database PostgreSQL |
| `GET` | `/api/v1/trips/{id}` | Mengambil detail satu data perjalanan berdasarkan ID |
| `PUT` | `/api/v1/trips/{id}` | Memperbarui bujet atau data trip (Auto-recalculate kategori & bujet harian) |
| `DELETE` | `/api/v1/trips/{id}` | Menghapus data perjalanan berdasarkan ID |
| `POST` | `/api/v1/trips/{id}/generate` | Menghasilkan rekomendasi AI (Amazon Bedrock) dan menyimpannya ke PostgreSQL |

### Contoh Request Pembuatan Trip:
```bash
curl -X POST "http://localhost:8000/api/v1/trips" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Tokyo, Japan",
    "days": 5,
    "budget": 2000.0,
    "travel_style": "Family"
  }'
```


