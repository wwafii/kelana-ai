# KelanaAI

KelanaAI adalah aplikasi asisten perjalanan cerdas yang dirancang untuk membantu pengguna merencanakan perjalanan mereka.

## 📁 Struktur Proyek

```text
KelanaAi/
├── README.md
├── backend/
│   └── main.py
└── frontend/
    └── .gitkeep
```

## 🚀 Fitur Sesi 1: Trip Summary Generator

Fitur awal berbasis konsol (CLI) menggunakan Python untuk menghasilkan ringkasan rencana perjalanan.

### Variabel Input:
- **Destination** (`str`): Kota atau tempat tujuan
- **Country** (`str`): Negara tujuan
- **Days** (`int`): Durasi perjalanan dalam hari
- **Budget** (`float`): Anggaran perjalanan
- **Currency** (`str`): Mata uang yang digunakan (contoh: `USD`, `IDR`)
- **Travel Month** (`str`): Bulan keberangkatan

## 🛠️ Cara Menjalankan

1. Pastikan Python 3 sudah terpasang di sistem Anda.
2. Jalankan aplikasi melalui terminal:

```bash
python3 backend/main.py
```

### Contoh Penggunaan

```text
=== Welcome to KelanaAI Trip Summary Generator ===

Enter destination: Japan
Enter country: Japan
Enter duration (days): 5
Enter budget: 1500
Enter currency (e.g. USD, IDR): USD
Enter travel month: December

========================
KelanaAI
========================
Destination  : Japan
Country      : Japan
Days         : 5
Budget       : 1500 USD
Currency     : USD
Travel Month : December
```
