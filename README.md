# KelanaAI

KelanaAI adalah aplikasi asisten perjalanan cerdas berbasis AI (*AI-Native Travel Planner*) yang menggabungkan kecerdasan **Amazon Bedrock (Generative AI)**, kecepatan dan keandalan **FastAPI (Python REST API)**, persistensi **PostgreSQL (SQLAlchemy ORM)**, autentikasi **JWT & BCrypt**, serta antarmuka modern multi-halaman **Next.js 15 (React 19 & Tailwind CSS)**.

---

## 📁 Struktur Proyek & Clean Architecture

Aplikasi dibangun dengan prinsip **Clean Architecture & Separation of Concerns**:

```text
KelanaAi/
├── .env.example
├── .gitignore
├── README.md
├── requirements.txt               # Dependensi backend (FastAPI, Uvicorn, SQLAlchemy, psycopg2-binary, boto3, pytest, bcrypt, python-jose, passlib, email-validator)
├── knowledge-docs/                # Basis Pengetahuan Terverifikasi (Knowledge Base Data Source)
│   ├── south-korea-travel-guide.md
│   ├── singapore-travel-guide.md
│   ├── japan-travel-insurance-and-customs.md
│   └── vietnam-travel-guide.md
├── scripts/
│   ├── sync_knowledge_base.sh    # Script sinkronisasi dokumen ke S3 & Bedrock KB Ingestion Job
│   └── run_rag_evaluation.py     # Script evaluasi otomatis 5 pertanyaan pengujian RAG vs Base
├── backend/
│   ├── database.py                # Persistence Layer (DB Engine, SessionLocal, get_db Dependency & Schema Migration)
│   ├── main.py                    # Web Layer (FastAPI REST API CRUD, Auth, AI & RAG Assistant Endpoints)
│   ├── models/                    # Data Layer (SQLAlchemy ORM Models)
│   │   ├── __init__.py
│   │   ├── user.py                # Model Tabel User (id, name, email, password_hash, relationship to trips)
│   │   └── trip.py                # Model Tabel Trip (destinasi, hari, budget, kategori, gaya perjalanan, rekomendasi AI, user_id FK)
│   └── services/                  # Business Logic, Auth, AI & Knowledge Base Layer
│       ├── __init__.py
│       ├── auth_service.py        # Security & Identity: Password Hashing (bcrypt), JWT generation/verification, get_current_user
│       ├── trip_service.py        # Logic: Category, Season, Daily Budget, Transport & Destination Recommendations
│       ├── bedrock_service.py     # AI Integration: Amazon Bedrock Converse API & Prompt Engineering
│       └── kb_service.py          # RAG & Knowledge Base Integration (boto3 bedrock-agent-runtime & Local Grounding)
├── frontend/                      # User Interface Layer (Next.js 15, React 19, Tailwind CSS)
│   ├── app/
│   │   ├── globals.css            # Tailwind CSS styling & custom animations
│   │   ├── layout.tsx             # Root layout with AuthProvider & typography
│   │   ├── page.tsx               # / -> Home & AI Travel Planner Generator (Protected)
│   │   ├── assistant/
│   │   │   └── page.tsx           # /assistant -> Travel AI Assistant (RAG Grounded & Side-by-Side Comparison)
│   │   ├── login/
│   │   │   └── page.tsx           # /login -> Dedicated User Sign In Page
│   │   ├── register/
│   │   │   └── page.tsx           # /register -> Dedicated User Registration Page
│   │   ├── profile/
│   │   │   └── page.tsx           # /profile -> Personal User Profile & Statistics (Protected)
│   │   └── trips/
│   │       ├── page.tsx           # /trips -> Private Trip History Dashboard (Search, Sort, Filter, Stats & Pagination) (Protected)
│   │       └── [id]/
│   │           └── page.tsx       # /trips/[id] -> Dynamic Route: Detailed Itinerary View & AI Generator (Protected & Ownership Checked)
│   ├── components/                # Reusable UI Component Library
│   │   ├── ProtectedRoute.tsx     # Route Guard with automatic redirect to /login
│   │   ├── Navbar.tsx             # Responsive sticky navigation header with AI Assistant link & user identity
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
│   ├── context/
│   │   └── AuthContext.tsx        # React Context & Provider for client-side Auth state management (JWT + localStorage)
│   ├── services/                  # Networking / API Client Layer
│   │   ├── authService.ts         # Authentication API client (login, register, getCurrentUser, token management)
│   │   ├── tripService.ts         # Centralized API service layer with JWT Authorization headers
│   │   └── assistantService.ts    # AI Assistant & Knowledge Base API client (RAG query, compare, list documents)
│   ├── lib/
│   │   ├── api.ts                 # Re-export API service for backward compatibility
│   │   └── parser.ts              # Intelligent itinerary markdown/text parser
│   └── types/
│       └── index.ts               # TypeScript data definitions & interface models
└── tests/                         # Automated Test Suite (Pytest)
    ├── test_api.py                # REST API Integration, Auth & Ownership Protection Tests
    ├── test_bedrock_service.py    # Amazon Bedrock AI service tests
    ├── test_kb_service.py         # Knowledge Base & RAG service unit and integration tests
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
- **Paginasi & Pencarian Interaktif**: Filter kategori, gaya liburan, dan sorting dinamis.

### 8. Sesi 8: Teaching KelanaAI to Know Its Users (Authentication, Authorization & Data Ownership)
- 🔐 **Authentication & Identity System (AuthN)**:
  - Model `User` dan tabel `users` (`name`, `email` unik, `password_hash` dengan **bcrypt**).
  - Password hashing satu arah (*one-way salted hash*) mencegah kebocoran data.
  - JSON Web Tokens (**JWT**) stateless authentication dengan algoritma HS256.
  - Endpoint `POST /api/v1/auth/register` dan `POST /api/v1/auth/login`.
  - Endpoint `GET /api/v1/auth/me` untuk profil pengguna saat ini.
- 🛡️ **Authorization & Ownership Protection (AuthZ)**:
  - Relasi kepemilikan data: foreign key `user_id` pada tabel `trips`.
  - Backend menetapkan kepemilikan (`user_id = user.id`) langsung dari payload JWT terverifikasi (frontend tidak pernah mengirimkan `user_id`).
  - **View: Only own trips**: `GET /api/v1/trips` memfilter data eksklusif `Trip.user_id == user.id`.
  - **Reject other users' trips**: `GET /api/v1/trips/{id}`, `PUT /api/v1/trips/{id}`, `DELETE /api/v1/trips/{id}`, dan `POST /api/v1/trips/{id}/generate` menolak akses pengguna lain dengan status **HTTP 403 (Forbidden)**.
- 💻 **Frontend Authentication & Protected Routes**:
  - Halaman **Login** (`/login`) dan **Register** (`/register`) yang modern dan responsif.
  - Halaman **Profile** (`/profile`) menampilkan nama, email, dan total trip yang dibuat pengguna.
  - **Route Protection (`ProtectedRoute.tsx`)**: Mengunci halaman `/`, `/trips`, `/trips/[id]`, dan `/profile`, mengarahkan pengguna belum login secara otomatis ke `/login`.
  - **Personalized Experience**: Salam personal (*"Welcome back, {Name} 👋"*) dan kontrol avatar / logout pada navbar.

### 9. Sesi 9: Teaching KelanaAI to Read Knowledge (Amazon Bedrock Knowledge Bases & RAG)
- 🧠 **Retrieval-Augmented Generation (RAG)**:
  - Mengatasi keterbatasan LLM (halusinasi & knowledge cutoff) dengan menghubungkan model ke dokumen pengetahuan terpercaya.
  - Mendukung **Amazon Bedrock Knowledge Bases** (`bedrock-agent-runtime`) & sinkronisasi dokumen ke Amazon S3.
  - Modul **Local Grounded Retriever** (`backend/services/kb_service.py`) sebagai fallback deterministik yang andal.
- 📚 **Travel Knowledge Base Documents (`knowledge-docs/`)**:
  - `south-korea-travel-guide.md`: K-ETA, T-Money, threshold *instant tax refund* (15,000 KRW), nomor darurat.
  - `singapore-travel-guide.md`: SG Arrival Card (3 hari sebelum tiba), transit SimplyGo, larangan permen karet (denda SGD 1,000) & eTRS GST refund.
  - `japan-travel-insurance-and-customs.md`: Visit Japan Web QR, aturan obat *Yakkan Shoumei*, regulasi bagasi Shinkansen (160–250 cm, denda 1,000 JPY), asuransi *cashless*.
  - `vietnam-travel-guide.md`: Regulasi 90-Day e-Visa ($25 single / $50 multi via portal resmi), taksi terpercaya Mai Linh & Vinasun.
- 🤖 **Interactive Travel Assistant UI & Comparison (`/assistant`)**:
  - Halaman interaktif di Next.js (`/assistant`) untuk bertanya seputar visa, regulasi, bagasi, dan aturan perjalanan.
  - **Source Citations**: Menampilkan sitasi dokumen sumber terverifikasi (*provenance*) pada setiap jawaban AI.
  - **Side-by-Side Comparison**: Membandingkan secara langsung jawaban *Base Model* vs *Grounded RAG*.
- ⚙️ **Scripts & Otomasi**:
  - `scripts/sync_knowledge_base.sh`: Script otomatis untuk sinkronisasi dokumen lokal ke S3 dan memicu Bedrock Ingestion Job.
  - `scripts/run_rag_evaluation.py`: Script evaluasi komprehensif untuk menguji 5 pertanyaan spesifik.

---

## 🛠️ Cara Menjalankan Aplikasi

Jalankan backend dan frontend secara bersamaan menggunakan dua terminal terpisah:

### 🖥️ 1. Menjalankan Backend (FastAPI + PostgreSQL + Auth + RAG)

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
JWT_SECRET_KEY=your-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440
BEDROCK_KNOWLEDGE_BASE_ID=your-knowledge-base-id-optional
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
* **AI Travel Assistant (RAG)**: [http://localhost:3000/assistant](http://localhost:3000/assistant)
* **Home / Generator**: [http://localhost:3000](http://localhost:3000)
* **Trip History Dashboard**: [http://localhost:3000/trips](http://localhost:3000/trips)
* **Login**: [http://localhost:3000/login](http://localhost:3000/login)
* **Register**: [http://localhost:3000/register](http://localhost:3000/register)
* **User Profile**: [http://localhost:3000/profile](http://localhost:3000/profile)

---

## 🧪 Menjalankan Pengujian Otomatis (Testing)

Jalankan suite pengujian unit dan integrasi Pytest:
```bash
pytest -v
```
*Hasil: 45 test cases passed (Knowledge Base Service, Local Grounding Retriever, RAG & Base Model Invocations, REST API Endpoints, Authentication, Authorization, Ownership Protection 403/401, Business Logic & Database Persistence).*

---

## 📡 Dokumentasi Endpoint REST API

| Method | Endpoint | Auth Required | Deskripsi |
| :--- | :--- | :---: | :--- |
| `GET` | `/` | No | Root welcome message |
| `GET` | `/health` | No | Server health check status |
| `POST` | `/api/v1/auth/register` | No | Mendaftarkan akun baru (Bcrypt hashed) & menghasilkan JWT |
| `POST` | `/api/v1/auth/login` | No | Verifikasi kredensial pengguna & menghasilkan JWT |
| `GET` | `/api/v1/auth/me` | **Bearer JWT** | Mengambil profil dan statistik pengguna saat ini |
| `POST` | `/api/v1/trips` | **Bearer JWT** | Membuat trip baru (Ownership otomatis diasosiasikan ke `user.id`) |
| `GET` | `/api/v1/trips` | **Bearer JWT** | Mengambil daftar perjalanan **HANYA milik pengguna yang login** |
| `GET` | `/api/v1/trips/{id}` | **Bearer JWT** | Mengambil detail trip (Mengembalikan 403 Forbidden jika bukan pemilik) |
| `PUT` | `/api/v1/trips/{id}` | **Bearer JWT** | Memperbarui trip (Mengembalikan 403 Forbidden jika bukan pemilik) |
| `DELETE` | `/api/v1/trips/{id}` | **Bearer JWT** | Menghapus trip (Mengembalikan 403 Forbidden jika bukan pemilik) |
| `POST` | `/api/v1/trips/{id}/generate` | **Bearer JWT** | Menghasilkan rekomendasi AI Bedrock (Mengembalikan 403 jika bukan pemilik) |
| `POST` | `/api/v1/assistant` | No | Bertanya ke AI Travel Assistant berbasis Grounded RAG + Sitasi Sumber |
| `POST` | `/api/v1/ask` | No | Alias endpoint RAG sesuai silabus Sesi 09 |
| `POST` | `/api/v1/assistant/compare` | No | Membandingkan respons Base Model vs Grounded RAG untuk pertanyaan yang sama |
| `GET` | `/api/v1/assistant/documents` | No | Mengambil daftar dokumen perjalanan terindeks di Knowledge Base |
