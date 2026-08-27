# KelanaAI - Frontend Web Application

Antarmuka web interaktif asisten perjalanan cerdas KelanaAI yang dibangun menggunakan **Next.js 15 (App Router)**, **React 19**, **TypeScript**, dan **Tailwind CSS**.

---

## 🧭 Halaman & Rute Aplikasi

* **`/` (Home & AI Generator)**: Halaman utama generator rencana perjalanan dengan formulir interaktif, estimasi alokasi bujet harian langsung, *preview tier*, dan showcase destinasi populer.
* **`/trips` (Trip History Dashboard)**: Halaman dashboard riwayat perjalanan yang terhubung langsung ke database PostgreSQL via FastAPI, dilengkapi fitur pencarian instan (*search*), filter kategori & gaya perjalanan, pengurutan dinamis (*sorting*), ringkasan statistik, serta paginasi.
* **`/trips/[id]` (Dynamic Trip Details)**: Halaman rincian rencana perjalanan spesifik yang menampilkan jadwal aktivitas harian (*Morning*, *Afternoon*, *Evening*), rekomendasi kuliner lokal, tips cerdas, serta fitur *Copy* dan *Print*.

---

## 🛠️ Cara Menjalankan

1. Pastikan server backend FastAPI telah berjalan di `http://localhost:8000`.
2. Install dependensi:
```bash
npm install
```
3. Jalankan development server:
```bash
npm run dev
```
4. Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 🧪 Build & Type Check

Untuk menguji build produksi dan pengecekan tipe TypeScript:
```bash
npm run build
```

