# Iklanin Leads Scraper

Aplikasi scraper Google Maps (B2B Leads) berbasis Next.js dengan Prisma ORM.

## Panduan Deployment ke GitHub & Vercel

Sistem bawaan aplikasi ini menggunakan **SQLite lokal** (`dev.db`). Jika Anda menjalankan aplikasi ini langsung di komputer/laptop Anda (Localhost), semua akan berjalan normal. 

Namun ketika Anda **Upload (Deploy) ke Vercel**, lingkungan (server) Vercel tidak bisa menyimpan file lokal (Serverless Environment). Anda perlu mengganti Database-nya menjadi sistem Cloud (PostgreSQL).

**Langkah Upgrade untuk Vercel:**
1. Buat akun gratis di **[Supabase.com](https://supabase.com)** atau **Neon.tech** dan buat Database PostgreSQL.
2. Dapatkan _Connection String URL_ Anda (Berawalan `postgres://...` atau `postgresql://...`).
3. Ubah file `.env` di aplikasi ini, dan sesuaikan `DATABASE_URL` menjadi URL postgresql Anda yang baru.
4. Jalankan kembali perintah ini sekali di terminal Anda agar tabel tercipta di database online tersebut:
   ```bash
   npx prisma db push
   ```
5. Buka GitHub Desktop / Terminal, dan Commit lalu Push seluruh folder ini ke Repository GitHub Anda.
6. Pergi ke **Vercel.com**, klik "Add New Project", pilih Repository GitHub tersebut.
7. **SANGAT PENTING:** Sebelum menekan tombol Deploy di Vercel, masukkan URL Database PostgreSQL Anda ke dalam menu **Environment Variables** di layar Vercel (`KEY = DATABASE_URL`, `VALUE = postgres://...`).
8. Klik Deploy. Kini Dashboard Anda siap dinikmati 24 jam via internet!

*Catatan Tambahan: Proses ekstraksi data/Scraping (Tombol Start Scrape) tidak direkomendasikan ditekan dari web online Vercel karena batasan memori. Lakukanlah proses Scraping murni dari `localhost` laptop Anda saja.*
