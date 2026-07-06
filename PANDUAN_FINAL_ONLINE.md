# PANDUAN FINAL ONLINE RepoTA

File project ini sudah direvisi agar siap menuju versi online:

- Database: PostgreSQL online/shared
- PDF: Supabase Storage private bucket
- Backend: Node.js + Express.js
- Frontend: React + Vite
- Email: Gmail SMTP App Password

> Penting: Jangan commit `backend/.env` dan `frontend/.env` ke GitHub.

---

## 1. Yang sudah direvisi di project ini

### Backend

File yang sudah diubah/ditambahkan:

```text
backend/src/config/db.js
backend/src/config/supabase.js
backend/src/middleware/upload.js
backend/src/routes/repository.routes.js
backend/src/server.js
backend/package.json
backend/.env.example
backend/.env.railway.example
backend/scripts/migrateUploadsToSupabase.js
```

Perubahan utama:

```text
1. PostgreSQL support SSL untuk database online.
2. Backend support CORS untuk frontend online.
3. PDF tidak lagi disimpan ke backend/uploads.
4. PDF diupload ke Supabase Storage bucket repota-documents.
5. Download PDF memakai signed URL dari backend.
6. Delete repository ikut menghapus PDF di Supabase Storage.
7. Tersedia script migrasi PDF lama dari backend/uploads ke Supabase Storage.
```

### Frontend

File yang sudah diubah/ditambahkan:

```text
frontend/.env.example
frontend/.env.vercel.example
```

Frontend tetap memanggil backend lewat:

```env
VITE_API_URL=https://URL_BACKEND_ONLINE/api
```

---

## 2. Buat Supabase Storage Bucket

Di Supabase Dashboard:

```text
Project → Storage → Create bucket
```

Buat bucket:

```text
repota-documents
```

Pilih:

```text
Private bucket
```

---

## 3. Buat file backend/.env untuk testing lokal

Copy:

```powershell
copy backend\.env.example backend\.env
```

Lalu isi `backend/.env` seperti ini:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

DB_HOST=db.emdobixgbxuycfgvogdu.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=ISI_PASSWORD_DATABASE_SUPABASE_KAMU
DB_SSL=true
DB_POOL_MAX=10

JWT_SECRET=repota_jwt_secret_dev_2026_yang_panjang_dan_aman
JWT_EXPIRES_IN=1d

UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=repository.ta.uad@gmail.com
SMTP_PASS=APP_PASSWORD_GMAIL_BARU_TANPA_SPASI
MAIL_FROM=RepoTA <repository.ta.uad@gmail.com>

SUPABASE_URL=https://emdobixgbxuycfgvogdu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SECRET_KEY_SUPABASE_BARU_KAMU
SUPABASE_STORAGE_BUCKET=repota-documents
```

Yang wajib diganti:

```text
DB_PASSWORD
SMTP_PASS
SUPABASE_SERVICE_ROLE_KEY
```

Jika Supabase service key atau Gmail App Password pernah terkirim ke chat, buat key/password baru.

---

## 4. Buat file frontend/.env untuk testing lokal

Copy:

```powershell
copy frontend\.env.example frontend\.env
```

Isi:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 5. Install backend

```powershell
cd backend
npm install
```

Kalau `@supabase/supabase-js` belum terinstall, jalankan:

```powershell
npm install @supabase/supabase-js
```

---

## 6. Test koneksi database

Dari folder `backend`:

```powershell
node -e "require('dotenv').config(); const pool=require('./src/config/db'); pool.query('SELECT current_database(), current_user, now()').then(r=>console.log(r.rows[0])).catch(e=>console.error('ERROR:', e.message)).finally(()=>pool.end())"
```

Kalau berhasil, lanjut.

---

## 7. Setup database

Cukup dijalankan oleh satu orang/PM:

```powershell
npm run db:setup
npm run db:seed
node scripts/importExcel.js
```

Cek user:

```powershell
node -e "require('dotenv').config(); const pool=require('./src/config/db'); pool.query('SELECT id, name, email, nim, role FROM users ORDER BY id').then(r=>console.table(r.rows)).catch(e=>console.error(e.message)).finally(()=>pool.end())"
```

---

## 8. Test SMTP Gmail

Dari folder `backend`:

```powershell
node -e "require('dotenv').config(); const nodemailer=require('nodemailer'); const transporter=nodemailer.createTransport({host:process.env.SMTP_HOST, port:Number(process.env.SMTP_PORT), secure:process.env.SMTP_SECURE==='true', auth:{user:process.env.SMTP_USER, pass:process.env.SMTP_PASS}}); transporter.sendMail({from:process.env.MAIL_FROM,to:process.env.SMTP_USER,subject:'Test SMTP RepoTA',text:'SMTP RepoTA berhasil.'}).then(info=>console.log('Email terkirim:', info.messageId)).catch(err=>console.error('ERROR:', err.message));"
```

---

## 9. Jalankan lokal

Terminal backend:

```powershell
cd backend
npm run dev
```

Terminal frontend:

```powershell
cd frontend
npm install
npm run dev
```

Buka:

```text
http://localhost:5173
```

---

## 10. Test upload PDF

1. Login sebagai mahasiswa/admin.
2. Upload repository + file PDF.
3. Buka Supabase:
   ```text
   Storage → repota-documents → repositories
   ```
4. File PDF harus muncul di folder `repositories`.
5. Cek database:
   ```powershell
   cd backend
   node -e "require('dotenv').config(); const pool=require('./src/config/db'); pool.query('SELECT id, title, file_name, file_path, status FROM repositories ORDER BY id DESC LIMIT 10').then(r=>console.table(r.rows)).catch(e=>console.error(e.message)).finally(()=>pool.end())"
   ```
6. `file_path` harus berbentuk:
   ```text
   repositories/...
   ```

---

## 11. Migrasi PDF lama dari backend/uploads ke Supabase Storage

Jika sudah ada PDF lama di `backend/uploads`, jalankan:

```powershell
cd backend
npm run migrate:uploads
```

Atau:

```powershell
node scripts/migrateUploadsToSupabase.js
```

---

## 12. Deploy backend ke Railway

1. Push project ke GitHub.
2. Buka Railway.
3. New Project.
4. Deploy from GitHub repo.
5. Pilih repo RepoTA.
6. Set Root Directory:
   ```text
   backend
   ```
7. Start Command:
   ```text
   npm start
   ```
8. Isi Variables dari file:
   ```text
   backend/.env.railway.example
   ```

Untuk sementara, sebelum frontend online, `CLIENT_URL` boleh sementara diisi:

```env
CLIENT_URL=http://localhost:5173
```

Setelah frontend Vercel jadi, ganti menjadi URL Vercel.

Test backend:

```text
https://URL_BACKEND_RAILWAY/api/health
```

---

## 13. Deploy frontend ke Vercel

1. Buka Vercel.
2. Add New Project.
3. Import repo GitHub RepoTA.
4. Root Directory:
   ```text
   frontend
   ```
5. Framework:
   ```text
   Vite
   ```
6. Build Command:
   ```text
   npm run build
   ```
7. Output Directory:
   ```text
   dist
   ```
8. Environment Variables:
   ```env
   VITE_API_URL=https://URL_BACKEND_RAILWAY/api
   ```

Deploy.

---

## 14. Update CLIENT_URL backend

Setelah Vercel memberi URL frontend, contoh:

```text
https://repota.vercel.app
```

Balik ke Railway backend Variables.

Ubah:

```env
CLIENT_URL=https://repota.vercel.app
```

Redeploy/restart backend.

---

## 15. Final env online

### Backend Railway

```env
NODE_ENV=production
CLIENT_URL=https://URL_FRONTEND_VERCEL

DB_HOST=db.emdobixgbxuycfgvogdu.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=PASSWORD_DATABASE_SUPABASE
DB_SSL=true
DB_POOL_MAX=10

JWT_SECRET=SECRET_PRODUCTION_YANG_PANJANG
JWT_EXPIRES_IN=1d

UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=repository.ta.uad@gmail.com
SMTP_PASS=APP_PASSWORD_GMAIL_BARU_TANPA_SPASI
MAIL_FROM=RepoTA <repository.ta.uad@gmail.com>

SUPABASE_URL=https://emdobixgbxuycfgvogdu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SECRET_KEY_SUPABASE_BARU
SUPABASE_STORAGE_BUCKET=repota-documents
```

### Frontend Vercel

```env
VITE_API_URL=https://URL_BACKEND_RAILWAY/api
```

---

## 16. Test final dari internet

Buka URL Vercel dari laptop/HP teman:

```text
https://URL_FRONTEND_VERCEL
```

Test:

```text
1. Guest bisa lihat daftar judul.
2. Admin bisa login.
3. Mahasiswa bisa login.
4. Upload repository + PDF.
5. PDF muncul di Supabase Storage.
6. PDF bisa dibuka dari perangkat lain.
7. Similarity check jalan.
8. Dashboard statistik jalan.
9. OTP email jalan.
```

---

## 17. Troubleshooting

### CORS error

Pastikan `CLIENT_URL` di Railway sama persis dengan URL frontend Vercel.

### Failed to fetch

Pastikan `VITE_API_URL` di Vercel mengarah ke URL backend Railway dengan `/api`.

### PDF tidak muncul di Supabase

Cek:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET
bucket repota-documents sudah ada
```

### PDF lama tidak bisa dibuka

Jalankan migrasi:

```powershell
cd backend
npm run migrate:uploads
```

### Login error setelah pindah backend

Di browser:

```js
localStorage.clear();
location.reload();
```

---

## 18. Catatan keamanan

Jangan commit file berikut:

```text
backend/.env
frontend/.env
```

Jangan pernah taruh ini di GitHub:

```text
DB_PASSWORD
JWT_SECRET
SMTP_PASS
SUPABASE_SERVICE_ROLE_KEY
```

