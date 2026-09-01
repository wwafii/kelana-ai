# 📑 Laporan Evaluasi & Perbandingan Sesi 09: RAG vs Base-Model

## 🌟 Ringkasan Eksekutif (Executive Summary)
Pada Sesi 09 (*Teaching KelanaAI to Read Knowledge*), arsitektur KelanaAI dievolusikan dari model AI generatif umum menjadi **Enterprise-Ready AI Travel Assistant** yang ditenagai oleh **Retrieval-Augmented Generation (RAG)** dan **Amazon Bedrock Knowledge Bases**.

Dokumen ini mencatat pengujian sistem secara komprehensif menggunakan 5 pertanyaan baru yang spesifik terhadap dokumen panduan perjalanan terpercaya yang diunggah ke Basis Pengetahuan (Knowledge Base).

---

## 📂 1. Dokumen Pengetahuan Terverifikasi (Knowledge Base Documents)

Sebanyak 4 dokumen panduan perjalanan komprehensif telah ditambahkan dan disinkronisasi ke dalam sistem:
1. **`knowledge-docs/south-korea-travel-guide.md`**: Regulasi K-ETA, kartu T-Money, nomor darurat 112/119/1330, threshold *instant tax refund* (15,000 KRW), dan aturan bea cukai.
2. **`knowledge-docs/singapore-travel-guide.md`**: Persyaratan digital SG Arrival Card (SGAC) 3 hari sebelum kedatangan, pembayaran transit SimplyGo, larangan permen karet (denda SGD 1,000), larangan rokok elektrik, dan *eTRS GST refund*.
3. **`knowledge-docs/japan-travel-insurance-and-customs.md`**: Ketentuan Visit Japan Web QR, aturan obat-obatan & sertifikat *Yakkan Shoumei*, regulasi bagasi berlebih Shinkansen (160–250 cm, denda 1,000 JPY), dan asuransi medis *cashless*.
4. **`knowledge-docs/vietnam-travel-guide.md`**: Aturan 90-Day e-Visa (biaya 25 USD / 50 USD melalui portal resmi `evisa.xuatnhapcanh.gov.vn`), taksi terpercaya (Mai Linh & Vinasun), dan regulasi lingkungan Ha Long Bay.

---

## 📊 2. Perbandingan Hasil Uji: 5 Pertanyaan (Base-Model vs RAG)

Berikut adalah rekaman perbandingan jawaban aktual antara **Base-Model (Pure LLM tanpa Knowledge Base)** dengan **Grounded RAG (KelanaAI dengan Amazon Bedrock Knowledge Base)**:

---

### 🔹 Pertanyaan 1: Persyaratan & Jangka Waktu Deklarasi Masuk Singapura
> **Pertanyaan**: *"What is the mandatory entry requirement and timeframe for digital health declaration when traveling to Singapore?"*  
> **Topik**: Singapore Entry & SG Arrival Card (SGAC)  
> **Dokumen Sumber**: `knowledge-docs/singapore-travel-guide.md`

| Parameter | Base-Model (Tanpa Knowledge Base) | Grounded RAG (Dengan Knowledge Base) |
| :--- | :--- | :--- |
| **Jawaban** | *"When traveling to Singapore, it is mandatory for all travelers, including Singapore citizens and permanent residents, to submit a digital health declaration via the SG Arrival Card (SGAC) e-Service prior to their arrival... within three days... Please note that specific requirements may change..."* | *"The mandatory entry requirement for traveling to Singapore is the digital SG Arrival Card (SGAC) with an electronic health declaration. All inbound travelers, including citizens and tourists, must submit the SGAC online within 3 days prior to arrival. This submission is free of charge and can be done via the official Singapore Immigration & Checkpoints Authority (ICA) portal."* |
| **Sitasi Dokumen** | ❌ *Tidak ada sitasi* | ✅ `knowledge-docs/singapore-travel-guide.md` |
| **Analisis** | Jawaban bersifat umum dan menyertakan *disclaimer* ketidakpastian. | Jawaban presisi, menegaskan bahwa layanan gratis via portal resmi ICA, dan menyertakan sitasi sumber terverifikasi. |

---

### 🔹 Pertanyaan 2: Batas Minimum Belanja Instant Tax Refund di Korea Selatan
> **Pertanyaan**: *"What is the exact minimum purchase threshold per receipt for foreign tourists to claim instant tax refunds in South Korea?"*  
> **Topik**: South Korea Tax Refund Policy  
> **Dokumen Sumber**: `knowledge-docs/south-korea-travel-guide.md`

| Parameter | Base-Model (Tanpa Knowledge Base) | Grounded RAG (Dengan Knowledge Base) |
| :--- | :--- | :--- |
| **Jawaban** | *"In South Korea, foreign tourists can claim instant tax refunds... the exact minimum purchase threshold per receipt is 300,000 South Korean Won (KRW)..."* ⚠️ *(Halusinasi / Salah)* | *"Foreign visitors in South Korea are eligible for instant tax refunds on purchases of 15,000 KRW or more per receipt at certified Tax-Free stores, with a single transaction limit of 1,000,000 KRW."* ✅ *(Akurat)* |
| **Sitasi Dokumen** | ❌ *Tidak ada sitasi* | ✅ `knowledge-docs/south-korea-travel-guide.md` |
| **Analisis** | **Terjadi Halusinasi Fatal**: Base Model menebak angka `300,000 KRW` (salah 20 kali lipat dari batas resmi `15,000 KRW`). | **100% Akurat**: RAG mengambil angka pasti `15,000 KRW` per struk dan batas transaksi `1,000,000 KRW` dari dokumen panduan resmi. |

---

### 🔹 Pertanyaan 3: Aturan Membawa Obat-obatan ke Jepang & Sertifikat Yakkan Shoumei
> **Pertanyaan**: *"What are the rules and certificate requirements (Yakkan Shoumei) for bringing prescription medication into Japan?"*  
> **Topik**: Japan Medication Import & Yakkan Shoumei  
> **Dokumen Sumber**: `knowledge-docs/japan-travel-insurance-and-customs.md`

| Parameter | Base-Model (Tanpa Knowledge Base) | Grounded RAG (Dengan Knowledge Base) |
| :--- | :--- | :--- |
| **Jawaban** | Memberikan saran umum yang tidak terstruktur: *"Typically not more than a three-month supply... prescription in Japanese or accompanied by translation..."* (Rancu) | Memberikan aturan hukum yang sangat jelas: <br>1. Batas umum: 1 bulan obat resep / 2 bulan obat non-resep tanpa izin khusus.<br>2. Zat terlarang: Pseudoephedrine (Sudafed), codeine, amphetamine dilarang keras.<br>3. Yakkan Shoumei wajib diajukan online minimal 3 minggu sebelumnya untuk >1 bulan pasokan atau jarum suntik insulin. |
| **Sitasi Dokumen** | ❌ *Tidak ada sitasi* | ✅ `knowledge-docs/japan-travel-insurance-and-customs.md` |
| **Analisis** | Base model salah menyebutkan batas 3 bulan (batas resmi tanpa izin adalah 1 bulan). | RAG memberikan batasan kuota pasti, daftar obat terlarang, dan batas waktu pengajuan sertifikat kementerian. |

---

### 🔹 Pertanyaan 4: Dimensi Bagasi & Denda Bagasi Berlebih Kereta Cepat Shinkansen Jepang
> **Pertanyaan**: *"What are the luggage dimension limits and penalty fees for bringing oversized baggage onto Japan's Shinkansen trains without reservation?"*  
> **Topik**: Shinkansen Oversized Baggage Regulations  
> **Dokumen Sumber**: `knowledge-docs/japan-travel-insurance-and-customs.md`

| Parameter | Base-Model (Tanpa Knowledge Base) | Grounded RAG (Dengan Knowledge Base) |
| :--- | :--- | :--- |
| **Jawaban** | *"Dimensions for carry-on luggage are approximately 160 cm... penalty fees can vary, typically range from ¥1,000 to ¥3,000 or more depending on train operator..."* | *"- Dimensions Requirement: Total dimensions (L+W+H) between 160 cm and 250 cm requires advance seat reservation on Tokaido, Sanyo, and Kyushu lines.<br>- Penalty Fee: 1,000 JPY penalty fee if boarding without reservation.<br>- Over 250 cm: Strictly not permitted."* |
| **Sitasi Dokumen** | ❌ *Tidak ada sitasi* | ✅ `knowledge-docs/japan-travel-insurance-and-customs.md` |
| **Analisis** | Base model menebak kisaran denda secara tidak pasti (`¥1,000 to ¥3,000`). | RAG memberikan rincian tarif pasti (`1,000 JPY`), batas atas dimensi (`250 cm`), dan jalur kereta yang memberlakukan aturan. |

---

### 🔹 Pertanyaan 5: Masa Berlaku, Waktu Proses & Biaya e-Visa Turis Vietnam
> **Pertanyaan**: *"What are the validity period, processing time, and official portal fee for Vietnam's tourist e-Visa?"*  
> **Topik**: Vietnam 90-Day e-Visa Regulations  
> **Dokumen Sumber**: `knowledge-docs/vietnam-travel-guide.md`

| Parameter | Base-Model (Tanpa Knowledge Base) | Grounded RAG (Dengan Knowledge Base) |
| :--- | :--- | :--- |
| **Jawaban** | *"For Vietnam's tourist e-Visa, the validity period is typically 30 days... fee can vary depending on nationality and service fees charged by portal..."* ⚠️ *(Data Lama / Outdated)* | *"For Vietnam's tourist e-Visa, the validity period is 90 days. The processing time is 3 working days, and the official portal for applying is evisa.xuatnhapcanh.gov.vn. The fee for a single entry is 25 USD, and for a multiple entry, it is 50 USD."* ✅ *(Data Baru 2025/2026)* |
| **Sitasi Dokumen** | ❌ *Tidak ada sitasi* | ✅ `knowledge-docs/vietnam-travel-guide.md` |
| **Analisis** | **Data Usang (Knowledge Cutoff)**: Menyebutkan visa berlaku 30 hari dan biaya bervariasi. | **Data Terkini (Up-to-date)**: Menyebutkan regulasi baru e-Visa 90 hari, URL portal resmi imigrasi, dan tarif pasti ($25 single / $50 multi). |

---

## 🏆 3. Kesimpulan Evaluasi: Mengapa RAG Jauh Lebih Unggul

1. **Eliminasi Halusinasi**: Base model berisiko mengarang angka (seperti salah menebak batas refund 300.000 KRW), sedangkan RAG menjamin keakuratan berbasis data faktual dari dokumen.
2. **Data Terkini (Overcoming Knowledge Cutoff)**: Kebijakan visa dan regulasi negara sering diperbarui (seperti e-Visa 90 hari Vietnam). Cukup dengan memperbarui file di Basis Pengetahuan (S3 sync), AI langsung memberikan jawaban terbaru tanpa perlu fine-tuning atau retraining model yang mahal.
3. **Sitasi Sumber Terverifikasi (*Citable & Auditable*)**: RAG selalu menyertakan nama dokumen sumber sehingga pengguna dan tim operasional dapat mengaudit kebenaran jawaban secara transparan.
