# RepoTA - Repository & Analisis Tugas Akhir SI

Aplikasi fullstack untuk pengelolaan repository Tugas Akhir Program Studi Sistem Informasi.

## Teknologi

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express.js
- Database: PostgreSQL online/shared
- Auth: JWT + bcrypt
- Upload dokumen: Supabase Storage private bucket
- Reset password: OTP email via SMTP/nodemailer
- Analisis: Rule-based text processing dan similarity check

## Revisi Final Online

Project ini sudah direvisi agar siap dipakai online:

```text
Frontend online  → Vercel
Backend online   → Railway
Database online  → Supabase PostgreSQL
PDF online       → Supabase Storage
Email real       → Gmail SMTP App Password
```

Panduan lengkap ada di:

```text
PANDUAN_FINAL_ONLINE.md
```

## File penting yang sudah direvisi

```text
backend/src/config/db.js
backend/src/config/supabase.js
backend/src/middleware/upload.js
backend/src/routes/repository.routes.js
backend/src/server.js
backend/scripts/migrateUploadsToSupabase.js
backend/.env.example
backend/.env.railway.example
frontend/.env.example
frontend/.env.vercel.example
```

## Setup lokal cepat

Buat env:

```powershell
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Isi `backend/.env` dengan database Supabase, Supabase Storage, dan SMTP Gmail.

Install dan jalankan backend:

```powershell
cd backend
npm install
npm run db:setup
npm run db:seed
node scripts/importExcel.js
npm run dev
```

Jalankan frontend:

```powershell
cd frontend
npm install
npm run dev
```

Buka:

```text
http://localhost:5173
```

## Akun demo

Admin:

```text
admin.repota.prodi@gmail.com
admin123
```

Mahasiswa:

```text
2300016106@webmail.uad.ac.id
mhs123
```

## Catatan keamanan

Jangan commit:

```text
backend/.env
frontend/.env
```

Jangan masukkan password/key asli ke GitHub:

```text
DB_PASSWORD
JWT_SECRET
SMTP_PASS
SUPABASE_SERVICE_ROLE_KEY
```
