# Nexkey Air Hockey 🏓⚡ (Hybrid React-Express-Laravel with Gemini AI)

Selamat datang di **Nexkey Air Hockey**! Ini adalah game kabinet arcade retro modern dengan fitur interaktif **Neon-Matrix AI Dialogue Overlay System**, mode multiplayer real-time (WebSockets), toko skin kustom (paddle & board), rekam jejak statistik, dan dasbor admin.

Proyek ini menggunakan arsitektur hybrid modern yang dirancang untuk performa tinggi dan skalabilitas penuh: **React 18/19 + Vite** (sisi Frontend), **Node.js (Express & WS)** (sisi real-time server & proxy AI), serta **Laravel 10** (sisi Restful API & database MySQL lokal) yang memudahkan pengelolaan data persisten lewat **phpMyAdmin / MariaDB**. Proyek ini diotaki oleh **Gemini 3.5-Flash** untuk melahirkan sistem interaksi dialog AI musuh yang sangat ekspresif, menantang, jenaka, dan adaptif!

---

## 🌟 Fitur Utama (Core Features)

1. **Retro Cabinet Arcade Mode**: Lawan AI komputer dalam pertarungan Air Hockey klasik yang mulus dan interaktif dengan efek visual partikel neon dinamis yang dirender menggunakan HTML5 Canvas performa tinggi.
2. **AI Dialogue Overlay System (Powered by Gemini)**: AI musuh akan terus merespons secara real-time setiap kejadian gol (gol cepat/keras, camper, atau saingan) menggunakan kekuatan **Gemini 3.5-Flash**. Pemain juga bisa membalas percakapan AI tersebut secara langsung!
3. **Multiplayer Online Real-time**: Cari lawan secara real-time atau buat ruangan privat yang dilindungi sandi menggunakan engine WebSocket yang responsif.
4. **Kustomisasi Skin Shop**: Kumpulkan koin dan beli skin neon yang bervariasi untuk paddle dan board di toko digital.
5. **Dukungan Dua Bahasa (Bilingual)**: Semua antarmuka, pengaturan, dan obrolan AI musuh mendukung **Bahasa Indonesia** dan **English**, yang secara otomatis beradaptasi dengan opsi preferensi bahasa pengguna.
6. **Admin Dashboard**: Panel kontrol khusus untuk memantau status server, meninjau statistik pemain, hingga memblokir akun yang curang.

---

## 🛠️ Arsitektur Teknologi (Architectural Tech Stack)

- **Frontend**: React 18/19 (TypeScript), Vite, Tailwind CSS v4, Motion (dari `motion/react` untuk animasi micro-interactions).
- **Backend Node (Real-time & Proxy)**: Express, WebSockets (`ws`), `@google/genai` (SDK Gemini resmi).
- **Backend Laravel (PHP Data Service & phpMyAdmin Sync)**: Laravel 10, GuzzleHttp untuk request HTTP eksternal ke Google API, Eloquent ORM.
- **Database Engine**: MySQL / MariaDB (Terbaca dan terkelola secara realtime melalui **phpMyAdmin**).
- **AI Engine**: Google Gemini API via model **Gemini 3.5-Flash** untuk respons instan dengan token tak terbatas dan performa secepat kilat.

---

## 🚀 Panduan Lengkap Menjalankan Aplikasi Secara Lokal (Local Setup Guide)

Ikuti langkah-langkah di bawah ini untuk melakukan instalasi dan menjalankan aplikasi lokal Anda dari awal di laptop/komputer Anda (sangat ramah untuk demo tugas kuliah/sekolah Anda!).

---

### 📋 1. Prasyarat Sistem (System Prerequisites)
Sebelum memulai instalasi, pastikan sistem komputer Anda sudah memasang aplikasi berikut:
* **Node.js** (Rekomendasi v18.x atau yang lebih baru) & **npm** (Bawaan Node.js)
* **PHP** (v8.1 atau v8.2)
* **Composer** (Dependency manager untuk ekosistem PHP)
* **Database Server** (Laragon, XAMPP, atau MAMP yang memiliki server MySQL dan **phpMyAdmin**)

---

### 🌐 2. Struktur Direktori Proyek (Directory Structure)
Sangat penting bagi Anda untuk memahami di mana letak kedua bagian kode utama Anda:
* `/` (Root directory) — Server Node.js (Express), WebSocket Gateway, dan Frontend SPA React.
* `/laravel/` — Restful Backend API PHP, Migrasi Skema Database, Seeders, dan Model Eloquent.

---

### 🛠️ 3. Langkah-Langkah Konfigurasi & Cara Menjalankan

#### **BAGIAN A: Konfigurasi Database phpMyAdmin**
1. Buka control panel database Anda (seperti **Laragon** atau **XAMPP**).
2. Jalankan service **Apache** dan **MySQL**.
3. Buka browser Anda dan navigasikan ke `http://localhost/phpmyadmin/`.
4. Buat database baru bernama: `nexkey_air_hockey` dengan collation default (`utf8mb4_general_ci`).

---

#### **BAGIAN B: Setup & Konfigurasi Backend Laravel**
Buka terminal baru di folder proyek Anda dan ikuti perintah berikut:

1. **Masuk ke folder laravel:**
   ```bash
   cd laravel
   ```

2. **Pasang semua paket dependency PHP menggunakan Composer:**
   ```bash
   composer install
   ```

3. **Duplikat file konfigurasi environment `.env`:**
   ```bash
   # Di Command Prompt (Windows)
   copy .env.example .env

   # Di Git Bash / macOS / Linux
   cp .env.example .env
   ```

4. **Konfigurasikan file `.env` Laravel Anda:**
   Buka file `/laravel/.env` menggunakan text editor (VS Code, Notepad, dll) dan sesuaikan konfigurasi database berikut agar terhubung ke phpMyAdmin Anda:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=nexkey_air_hockey
   DB_USERNAME=root
   DB_PASSWORD=

   # Masukkan Gemini API Key agar respons Gemini dari sisi Laravel juga dapat beroperasi
   GEMINI_API_KEY="ISI_DENGAN_GEMINI_API_KEY_ANDA_YANG_ASLI"
   ```

5. **Generate Kunci Aplikasi Keamanan Laravel:**
   ```bash
   php artisan key:generate
   ```

6. **Jalankan Migrasi Database dan Seeders:**
   Perintah ini akan otomatis membuat tabel-tabel database (Users, PlayerStats, ShopItems, MatchHistories, dll.) dan memasukkan data admin serta skin awal ke database phpMyAdmin Anda:
   ```bash
   php artisan migrate --seed
   ```
   *Catatan:* Seeder akan mendaftarkan akun admin default secara otomatis:
   * **Email Admin:** `admin@nexkey.com`
   * **Password:** `password123`

7. **Jalankan Server Laravel Lokal:**
   ```bash
   php artisan serve --port=8000
   ```
   *Backend Laravel Anda sekarang aktif melayani request di alamat `http://127.0.0.1:8000`.*

---

#### **BAGIAN C: Setup & Konfigurasi Server Node (Express & WebSockets) + React Client**
Buka terminal baru (biarkan terminal Laravel tetap menyala) pada root direktori proyek:

1. **Pastikan Anda berada di direktori root aplikasi (bukan dalam subfolder laravel):**
   ```bash
   cd ..
   ```

2. **Instal seluruh paket dependency Node.js:**
   ```bash
   npm install
   ```

3. **Duplikat file konfigurasi environment `.env` di root:**
   ```bash
   # Di Command Prompt (Windows)
   copy .env.example .env

   # Di Git Bash / macOS / Linux
   cp .env.example .env
   ```

4. **Konfigurasikan file `.env` di root:**
   Buka file `.env` di root folder dan masukkan Gemini API Key Anda:
   ```env
   GEMINI_API_KEY="ISI_DENGAN_GEMINI_API_KEY_ANDA_YANG_ASLI"
   ```

5. **Jalankan Server Node dan Frontend React Client:**
   ```bash
   npm run dev
   ```
   *Server hibrida Node (Express & WebSocket) Anda sekarang berjalan di port `3000` (http://localhost:3000) dan secara dinamis menyajikan antarmuka game React!*

6. **Mainkan Game:**
   Buka browser Anda dan jalankan `http://localhost:3000` untuk mulai bermain.

---

## 🗄️ Sinkronisasi Hub API (Express 🔄 Laravel Synchronizer)

Bagaimana cara datanya tersinkronisasi dengan mulus tanpa ada lag atau bug?
Aplikasi ini menggunakan modul sinkronisasi **Express-to-Laravel Real-time Synchronizer** yang ada di `server.ts`. 

Setiap kali Anda membuat kemajuan seperti **memperoleh XP**, **naik Level**, **mendapatkan/mengurangi Koin (NEX Credits)**, **membeli skin**, atau **menyelesaikan pertandingan (Match History)**, server Node.js Express akan langsung mengirimkan data kemajuan tersebut secara asinkron lewat request HTTP POST internal ke backend API Laravel di `http://127.0.0.1:8000`. 

Proses ini memastikan bahwa database MySQL lokal Anda di phpMyAdmin selalu terisi data yang 100% valid dan up-to-date, tanpa memperlambat FPS visual gameplay Air Hockey Anda!

---

## 🧩 Panduan Skema Migrasi Database (Database Migration Reference)

Bagi mahasiswa yang ingin mencatat skema relasional tabel dalam laporan tugas akhir, berikut adalah struktur migrasi tabel utama yang didefinisikan di dalam subfolder `/laravel/database/migrations/`:

| Nama Tabel | Deskripsi Penggunaan | Kunci Utama (PK / FK) |
| :--- | :--- | :--- |
| **`users`** | Menyimpan data akun, tingkat level, XP saat ini, koordinat koin (NEX), dan status ban. | `id` (PK) |
| **`player_stats`** | Menyimpan metrik perbandingan (Total pertandingan, Total Kemenangan, Rasio Win-rate). | `id` (PK), `user_id` (FK) |
| **`shop_items`** | Daftar skin kosmetik berbayar untuk paddle dan board. | `id` (PK / String) |
| **`user_inventories`** | Relasi kepemilikan skin antara user dan item toko kustom. | `user_id` (FK), `item_id` (FK) |
| **`match_histories`** | Log riwayat pertandingan (Skor mandiri, skor lawan, XP & koin yang diperoleh). | `id` (PK / String), `user_id` (FK) |
| **`lobby_rooms`** | Kamar sirkuit lobi multiplayer online aktif. | `id` (PK / String) |

---

## 🛠️ Pemecahan Masalah (Troubleshooting Guide)

* **Pertanyaan: Mengapa data koin, level, atau XP saya NaN% atau tidak bertambah di profil?**
  * *Solusi:* Pastikan server Laravel Anda sudah berjalan di port `8000` (`php artisan serve --port=8000`) sebelum memulai game. Jika server Laravel mati, profil beralih ke local storage transient. Begitu Laravel dinyalakan, database phpMyAdmin akan langsung disinkronkan kembali saat Anda login atau menyelesaikan pertandingan baru!
* **Pertanyaan: PHP Connection Refused / Database Error di Laravel?**
  * *Solusi:* Periksa file `/laravel/.env` Anda. Pastikan `DB_CONNECTION=mysql`, `DB_PORT=3306` sesuai dengan konfigurasi di XAMPP/Laragon, dan Anda telah membuat database di phpMyAdmin bernama `nexkey_air_hockey`.
* **Pertanyaan: Dialog AI tidak merespons atau tidak ada teks obrolan?**
  * *Solusi:* Pastikan Anda telah memasukkan `GEMINI_API_KEY` di file `.env` root dan `.env` Laravel dengan benar tanpa tanda kutip ganda berlebih. Jika tidak ada internet atau API Key kosong, sistem akan beralih ke mode respon dialog statis/fallback lokal bawaan aplikasi secara aman.

---

Selamat belajar, tandingi kecerdasan robot AI Nexkey, dan raih nilai terbaik dari Gurumu! 🎓🌟🏓
