const express = require('express');

const router = express.Router();

const endpoints = [
  { method: 'GET', path: '/api/health', auth: 'public', description: 'Cek status API.' },
  { method: 'GET', path: '/api/docs', auth: 'public', description: 'Daftar endpoint API.' },
  { method: 'POST', path: '/api/auth/login', auth: 'public', description: 'Login admin/mahasiswa dengan email atau NIM.' },
  { method: 'POST', path: '/api/auth/register', auth: 'public', description: 'Registrasi akun mahasiswa memakai email webmail UAD.' },
  { method: 'GET', path: '/api/auth/me', auth: 'mahasiswa/admin', description: 'Mengambil profil user aktif.' },
  { method: 'POST', path: '/api/auth/password/request-otp', auth: 'public', description: 'Meminta OTP reset password.' },
  { method: 'POST', path: '/api/auth/password/reset', auth: 'public', description: 'Reset password memakai OTP.' },
  { method: 'POST', path: '/api/auth/change-password', auth: 'mahasiswa/admin', description: 'Mengubah password memakai password lama.' },
  { method: 'GET', path: '/api/users/me', auth: 'mahasiswa/admin', description: 'Mengambil profil user aktif.' },
  { method: 'PUT', path: '/api/users/me', auth: 'mahasiswa/admin', description: 'Memperbarui nama profil.' },
  { method: 'POST', path: '/api/users/me/photo', auth: 'mahasiswa/admin', description: 'Mengunggah foto profil ke Supabase Storage.' },
  { method: 'DELETE', path: '/api/users/me/photo', auth: 'mahasiswa/admin', description: 'Menghapus foto profil dari Supabase Storage.' },
  { method: 'GET', path: '/api/users/students', auth: 'admin', description: 'Daftar mahasiswa untuk admin.' },
  { method: 'GET', path: '/api/repositories', auth: 'public/mahasiswa/admin', description: 'Daftar repository dengan filter dan pagination.' },
  { method: 'GET', path: '/api/repositories/:id', auth: 'public/mahasiswa/admin', description: 'Detail repository sesuai hak akses.' },
  { method: 'POST', path: '/api/repositories', auth: 'mahasiswa/admin', description: 'Upload repository dan PDF tugas akhir.' },
  { method: 'PUT', path: '/api/repositories/:id/resubmit', auth: 'mahasiswa', description: 'Mengirim ulang perbaikan repository.' },
  { method: 'PATCH', path: '/api/repositories/:id/verify', auth: 'admin', description: 'Approve, reject, atau revision.' },
  { method: 'GET', path: '/api/repositories/:id/audit-logs', auth: 'admin', description: 'Riwayat verifikasi repository.' },
  { method: 'DELETE', path: '/api/repositories/:id', auth: 'mahasiswa/admin', description: 'Membatalkan atau menghapus repository.' },
  { method: 'POST', path: '/api/similarity/check', auth: 'mahasiswa/admin', description: 'Cek kemiripan judul.' },
  { method: 'GET', path: '/api/categories', auth: 'public', description: 'Daftar kategori repository.' },
  { method: 'POST', path: '/api/categories', auth: 'admin', description: 'Tambah kategori.' },
  { method: 'GET', path: '/api/keywords', auth: 'admin', description: 'Daftar keyword kategori.' },
  { method: 'POST', path: '/api/keywords', auth: 'admin', description: 'Tambah keyword kategori.' },
  { method: 'GET', path: '/api/stats/overview', auth: 'admin', description: 'Ringkasan statistik admin.' },
];

router.get('/', (req, res) => {
  res.json({
    app: 'RepoTA API',
    version: '1.1.0',
    endpoints,
  });
});

module.exports = router;
