# Cara Menjalankan RepoTA Revisi

Folder yang harus dibuka di VS Code:

```text
C:\Kuliah\Semester 6\CP\REPOTA-\dashboard-repository-tugas-akhir
```

## 1. Jalankan Docker database

Buka Docker Desktop dulu, lalu di terminal VS Code:

```bash
docker compose up -d
docker ps
```

## 2. Jalankan backend

```bash
cd backend
npm install
npm run dev
```

Backend berhasil kalau muncul:

```text
RepoTA API berjalan di http://0.0.0.0:5000
```

Tes backend di browser:

```text
http://localhost:5000/api/repositories?sort=latest
```

## 3. Jalankan frontend

Buka terminal baru:

```bash
cd frontend
npm install
npm run dev
```

Buka link yang muncul, misalnya:

```text
http://localhost:5173/
```

atau:

```text
http://localhost:5174/
```

## Kalau muncul EADDRINUSE port 5000

Artinya backend sudah jalan atau proses node masih nyangkut.

```bash
taskkill //F //IM node.exe
```

Lalu jalankan ulang backend dan frontend.

## Yang sudah direvisi

1. Guest tidak melihat isi abstrak.
2. Guest juga tidak mengambil data lengkap dari API walaupun masih ada token login di browser.
3. Halaman mahasiswa/admin tetap bisa melihat abstrak.
4. CORS backend dibuat aman untuk localhost 5173, 5174, dan 5175 supaya tidak mudah `Failed to fetch`.
5. Error koneksi frontend dibuat lebih jelas.
6. Data publik guest tetap menampilkan judul, kategori, mahasiswa, tanggal, dan status, tetapi tidak menampilkan abstrak, dosen pembimbing, pengunggah, dan file PDF.

## File yang diubah

```text
backend/src/server.js
backend/src/routes/repository.routes.js
frontend/src/api.js
frontend/src/pages/RepositoryDetail.jsx
frontend/src/pages/guest/Browse.jsx
```
