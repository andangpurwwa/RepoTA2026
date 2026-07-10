const express = require('express');

const router = express.Router();

const endpoints = [
  { method: 'GET', path: '/api/health', auth: 'public', description: 'Cek status API.' },
  { method: 'POST', path: '/api/auth/login', auth: 'public', description: 'Login admin/mahasiswa dengan email atau NIM.' },
  { method: 'POST', path: '/api/auth/register', auth: 'public', description: 'Registrasi akun mahasiswa memakai email webmail UAD.' },
  { method: 'GET', path: '/api/auth/me', auth: 'mahasiswa/admin', description: 'Mengambil profil user aktif.' },
  { method: 'POST', path: '/api/auth/password/request-otp', auth: 'public', description: 'Meminta OTP reset password.' },
  { method: 'POST', path: '/api/auth/password/reset', auth: 'public', description: 'Reset password memakai OTP.' },
  { method: 'POST', path: '/api/auth/change-password', auth: 'mahasiswa/admin', description: 'Mengubah password memakai password lama.' },
  { method: 'GET', path: '/api/repositories', auth: 'public/mahasiswa/admin', description: 'List repository dengan filter, search, sort, pagination, dan jump page.' },
  { method: 'GET', path: '/api/repositories/:id', auth: 'public/mahasiswa/admin', description: 'Detail repository sesuai hak akses.' },
  { method: 'POST', path: '/api/repositories', auth: 'mahasiswa/admin', description: 'Upload repository dan PDF tugas akhir.' },
  { method: 'PUT', path: '/api/repositories/:id/resubmit', auth: 'mahasiswa', description: 'Mengirim ulang perbaikan repository berstatus revisi atau ditolak.' },
  { method: 'PATCH', path: '/api/repositories/:id/status', auth: 'admin', description: 'Verifikasi repository: approve, reject, atau revision.' },
  { method: 'GET', path: '/api/repositories/:id/audit-logs', auth: 'admin', description: 'Melihat riwayat aksi admin pada repository.' },
  { method: 'POST', path: '/api/similarity/check', auth: 'mahasiswa/admin', description: 'Cek kemiripan judul dengan cosine similarity berbasis rule-based text processing.' },
  { method: 'PUT', path: '/api/users/me', auth: 'mahasiswa/admin', description: 'Update nama dan nomor telepon profil.' },
  { method: 'POST', path: '/api/users/me/photo', auth: 'mahasiswa/admin', description: 'Upload foto profil ke Supabase Storage.' },
  { method: 'DELETE', path: '/api/users/me/photo', auth: 'mahasiswa/admin', description: 'Hapus foto profil dari Supabase Storage.' },
  { method: 'GET', path: '/api/users/students', auth: 'admin', description: 'List mahasiswa untuk admin.' },
  { method: 'GET', path: '/api/categories', auth: 'public', description: 'List kategori repository.' },
  { method: 'POST', path: '/api/categories', auth: 'admin', description: 'Tambah kategori.' },
  { method: 'GET', path: '/api/keywords', auth: 'admin', description: 'List keyword kategori.' },
  { method: 'POST', path: '/api/keywords', auth: 'admin', description: 'Tambah keyword kategori.' },
  { method: 'GET', path: '/api/stats/*', auth: 'mahasiswa/admin', description: 'Statistik dashboard sesuai role.' },
];

router.get('/', (req, res) => {
  res.json({
    app: 'RepoTA API',
    version: '1.0.0',
    documentation_file: 'docs/API_DOCUMENTATION.md',
    postman_collection: 'docs/RepoTA.postman_collection.json',
    endpoints,
  });
});

module.exports = router;
