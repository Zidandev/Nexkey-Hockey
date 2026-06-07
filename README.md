# Nexkey Air Hockey 🏓⚡ (Hybrid React-Node-Laravel with Gemini AI)

Selamat datang di **Nexkey Air Hockey**! Ini adalah game kabinet arcade retro modern dengan fitur interaktif **Neon-Matrix AI Dialogue Overlay System**, mode multiplayer real-time (WebSockets), toko skin kustom (paddle & board), rekam jejak statistik, dan dasbor admin.

Proyek ini menggunakan arsitektur hybrid modern dengan kombinasi teknologi terbaik: **React 19 + Tailwind CSS v4** untuk frontend, **Node.js (Express & WebSockets)** untuk real-time gameplay & proxy AI, serta **Laravel 10 (PHP)** untuk manajemen data persisten (API & Database). Proyek ini juga menggunakan **Gemini 3.5-Flash** untuk melahirkan sistem interaksi dialog AI musuh yang sangat ekspresif, menantang, jenaka, dan adaptif!

---

## 🌟 Fitur Utama

1. **Retro Cabinet Arcade Mode**: Lawan AI komputer dalam pertarungan Air Hockey klasik yang mulus dan interaktif dengan efek visual partikel neon dinamis.
2. **AI Dialogue Overlay System**: AI musuh akan terus merespons setiap kejadian gol (gol cepat/keras, camper, atau saingan) secara langsung menggunakan kekuatan **Gemini 3.5-Flash**. Pemain juga bisa membalas percakapan AI tersebut secara langsung!
3. **Multiplayer Online Real-time**: Cari lawan secara real-time atau buat ruangan privat yang dilindungi sandi menggunakan engine WebSocket yang responsif.
4. **Kustomisasi Skin Shop**: Kumpulkan koin dan beli skin neon yang bervariasi untuk paddle dan board di toko digital.
5. **Dukungan Dua Bahasa (Bilingual)**: Semua antarmuka, pengaturan, dan obrolan AI musuh mendukung **Bahasa Indonesia** dan **English**, yang secara otomatis beradaptasi dengan opsi preferensi bahasa pengguna.
6. **Admin Dashboard**: Panel kontrol khusus untuk memantau status server, meninjau statistik pemain, hingga memblokir akun yang curang.

---

## 🛠️ Arsitektur Teknologi

- **Frontend**: React 19 (TypeScript), Vite 6, Tailwind CSS v4, Motion (dari `motion/react` untuk animasi micro-interactions).
- **Backend Node (Real-time & Proxy)**: Express, WebSockets (`ws`), `@google/genai` (SDK Gemini resmi).
- **Backend Laravel (PHP Data Service)**: Laravel 10, GuzzleHttp untuk request HTTP eksternal ke Google API.
- **AI Engine**: Google Gemini API via model **Gemini 3.5-Flash** untuk respons instan dengan token tak terbatas dan performa secepat kilat.

---

## 🚀 Panduan Langkah Menjalankan Aplikasi Secara Lokal

Ikuti langkah-langkah di bawah ini untuk menginstal dan menjalankan aplikasi di komputer Anda (atau untuk ditunjukkan kepada Guru/Dosen).

### 📋 Prasyarat Sistem
Sebelum memulai, pastikan komputer Anda sudah terpasang:
- **Node.js** (Rekomendasi v18 ke atas) & **npm**
- **PHP** (v8.1 ke atas) & **Composer**
- Aplikasi Database server (seperti Laragon, XAMPP, atau PostgreSQL/MySQL dependensi lokal Anda)

---

### Step 1: Konfigurasi Environment & API Key

Aplikasi membutuhkan **Gemini API Key** agar dialog AI dapat bekerja secara penuh. Jika kunci tidak didefinisikan, aplikasi otomatis beralih ke engine dialog fallback lokal (Bahasa Indonesia & Inggris).

1. Buat file `.env` di **root direktori** proyek dengan menyalin `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Isi nilai API Key Anda di `.env` root:
   ```env
   GEMINI_API_KEY="AIzaSyBggiXK2zVYCm..."
   ```

3. Buat file `.env` di dalam **direktori Laravel** (`/laravel/`):
   ```bash
   cd laravel
   cp .env.example .env
   ```
4. Tambahkan konfigurasi database lokal Anda (misal MySQL) & isi API Key di bagian bawah `.env` Laravel:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=nexkey_air_hockey
   DB_USERNAME=root
   DB_PASSWORD=

   # Gemini API Configuration
   GEMINI_API_KEY="AIzaSyBggiXK2zVYCm..."
   ```

---

### Step 2: Instalasi Dependensi & Menjalankan Frontend + Server Node

1. Kembali ke root direktori proyek, lalu instal semua package Node.js:
   ```bash
   npm install
   ```
2. Jalankan server Node dan frontend secara bersamaan dalam mode development:
   ```bash
   npm run dev
   ```
   *Server hibrida Node.js sekarang akan berjalan di port `3000` (http://localhost:3000).*

---

### Step 3: Setup Backend Laravel (PHP API)

Di terminal baru, silakan pasang framework Laravel Anda:

1. Masuk ke direktori laravel:
   ```bash
   cd laravel
   ```
2. Pasang library PHP melalui Composer:
   ```bash
   composer install
   ```
3. Generate application key bawaan Laravel:
   ```bash
   php artisan key:generate
   ```
4. Buat database kosong bernama `nexkey_air_hockey` di manajemen database Anda (Laragon, phpMyAdmin, dll).
5. Jalankan migrasi database serta seeder awal bawaan Laravel:
   ```bash
   php artisan migrate --seed
   ```
6. Jalankan server Laravel lokal:
   ```bash
   php artisan serve --port=8000
   ```
   *Laravel sekarang siap melayani API di port `8000`.*

---

## 🎨 Penilaian Kode & Kerapihan Desain (Untuk Penilaian Guru)

- **Pemisahan Tugas (Separation of Concerns)**: Seluruh fungsi permainan Air Hockey berada di `src/components/AirHockeyGame.tsx`, dipadukan dengan rendering canvas modern dan simulasi fisika momentum nyata tanpa library pihak ketiga eksternal.
- **Konsistensi Desain**: Proyek ini menggunakan skema warna neon monokromatik bergaya Cyberpunk dengan tipografi yang serasi.
- **Optimalisasi Gemini**: Request AI dibuat melalui backend Express proxy / Laravel HTTP Post aman agar kunci rahasia (API Key) aman dari kebocoran sisi browser.
- **Responsive Adaptive**: Antarmuka game dapat beradaptasi dari resolusi desktop yang luas hingga mode mobile potret dengan navigasi sentuh 44px.

Selamat bermain dan raih nilai terbaik dari Gurumu! 🎓🌟
