# RepoTA - Repository & Analisis Tugas Akhir SI

Aplikasi fullstack untuk pengelolaan repository Tugas Akhir Program Studi Sistem Informasi.

## Teknologi

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express.js
- Database: PostgreSQL
- Auth: JWT + bcrypt
- Upload dokumen: Multer PDF
- Reset password: OTP email via SMTP/nodemailer

## Struktur Folder

```text
REPOTA/
├── backend/
├── frontend/
├── docker-compose.yml
└── README.md
```

## Fitur Utama

### Guest
- Menelusuri repository terverifikasi.
- Mencari judul Tugas Akhir.
- Filter kategori dan rentang tanggal.
- Lihat detail terbatas.
- Kontak prodi dapat diklik.

### Mahasiswa
- Login dan registrasi email webmail UAD berbasis NIM.
- Dashboard pencarian repository dan riwayat upload.
- Upload Tugas Akhir PDF.
- Kirim Tugas Akhir untuk verifikasi admin.
- Cek similarity judul realtime terhadap database RepoTA.
- Profil dan ubah password via OTP email atau password lama.

### Admin
- Dashboard statistik.
- Tabel mahasiswa.
- Data mahasiswa yang sudah upload Tugas Akhir.
- Verifikasi repository: Setujui, Tolak, Revisi.
- Lihat detail dan dokumen PDF.
- Kelola repository, kategori, dan keyword.

## Menjalankan Project dari Awal

### 1. Masuk folder project

```bash
cd "/c/Kuliah/SEM 6/CP/REPOTA"
```

### 2. Jalankan PostgreSQL Docker

Jika container lama masih ada:

```bash
docker rm -f repota_postgres
```

Lalu jalankan database:

```bash
docker compose up -d
```

Cek status:

```bash
docker compose ps
```

### 3. Jalankan Backend

```bash
cd "/c/Kuliah/SEM 6/CP/REPOTA/backend"
cp .env.example .env
npm install
npm run db:setup
npm run db:seed
npm run dev
```

Backend berjalan di:

```text
http://localhost:5000
```

### 4. Jalankan Frontend

Buka Git Bash/terminal baru:

```bash
cd "/c/Kuliah/SEM 6/CP/REPOTA/frontend"
cp .env.example .env
npm install
npm run dev
```

Frontend berjalan di:

```text
http://localhost:5173
```

## Akun Demo

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

## Konfigurasi OTP Email Gmail/SMTP

Fitur lupa password dan ubah password via OTP sudah tersedia. Agar OTP benar-benar terkirim ke Gmail/email, isi konfigurasi SMTP di `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=emailpengirim@gmail.com
SMTP_PASS=app_password_gmail
MAIL_FROM=RepoTA <emailpengirim@gmail.com>
```

Untuk Gmail, gunakan **App Password**, bukan password Gmail biasa. Jika konfigurasi SMTP kosong, fitur OTP akan menolak pengiriman agar tidak ada kode OTP palsu/tampilan development.



## Konfigurasi OTP Gmail Real

Fitur lupa password dan ubah password via OTP sudah memakai backend Node.js + Express + Nodemailer. Agar OTP benar-benar masuk ke Gmail/email mahasiswa, admin harus mengisi akun Gmail pengirim di `backend/.env`.

1. Buka akun Google/Gmail pengirim milik prodi atau tim.
2. Aktifkan 2-Step Verification.
3. Buat App Password untuk aplikasi Mail.
4. Isi `backend/.env` seperti ini:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=emailpengirim@gmail.com
SMTP_PASS=app_password_16_digit
MAIL_FROM=RepoTA <emailpengirim@gmail.com>
```

`SMTP_PASS` bukan password Gmail biasa. Gmail tidak mengizinkan aplikasi mengirim email memakai password login biasa. Wajib memakai App Password atau SMTP resmi kampus. Setelah diisi, restart backend dengan `CTRL + C` lalu `npm run dev`.

## Troubleshooting

### Port 5000 sudah dipakai

Matikan backend lama:

```bash
netstat -ano | findstr :5000
taskkill /PID NOMOR_PID /F
```

### Container repota_postgres conflict

```bash
docker rm -f repota_postgres
docker compose up -d
```

### Database password error

Pastikan `backend/.env` memakai:

```env
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=postgres
```

### Docker belum running

Buka Docker Desktop sampai statusnya running, lalu ulangi `docker compose up -d`.
