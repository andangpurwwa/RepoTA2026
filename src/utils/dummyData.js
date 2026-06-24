// ── Repositori dummy ─────────────────────────────────────────────
export const repoList = [
  {
    id: 1,
    judul: 'Sistem Informasi Manajemen Perpustakaan Berbasis Web',
    nim: '20210001',
    nama: 'Ahmad Fauzi',
    tahun: 2024,
    kategori: 'Sistem Informasi',
    status: 'Terverifikasi',
    similarity: 12,
    tanggal: '12 Jan 2025',
  },
  {
    id: 2,
    judul: 'Deteksi Objek Real-Time Menggunakan YOLOv8',
    nim: '20210042',
    nama: 'Siti Rahayu',
    tahun: 2024,
    kategori: 'Kecerdasan Buatan',
    status: 'Menunggu',
    similarity: 8,
    tanggal: '15 Jan 2025',
  },
  {
    id: 3,
    judul: 'Aplikasi Pemantauan Kesehatan IoT dengan Arduino',
    nim: '20210078',
    nama: 'Budi Santoso',
    tahun: 2024,
    kategori: 'Internet of Things',
    status: 'Revisi',
    similarity: 22,
    tanggal: '18 Jan 2025',
  },
  {
    id: 4,
    judul: 'Analisis Sentimen Media Sosial Menggunakan BERT',
    nim: '20210112',
    nama: 'Dewi Lestari',
    tahun: 2024,
    kategori: 'Data Science',
    status: 'Terverifikasi',
    similarity: 5,
    tanggal: '20 Jan 2025',
  },
  {
    id: 5,
    judul: 'Pengembangan Aplikasi Mobile E-Commerce React Native',
    nim: '20210055',
    nama: 'Rizky Pratama',
    tahun: 2025,
    kategori: 'Mobile Development',
    status: 'Menunggu',
    similarity: 15,
    tanggal: '22 Jan 2025',
  },
];

// ── Kategori dummy ────────────────────────────────────────────────
export const kategoriList = [
  { id: 1, nama: 'Sistem Informasi',    jumlah: 145 },
  { id: 2, nama: 'Kecerdasan Buatan',   jumlah: 98 },
  { id: 3, nama: 'Internet of Things',  jumlah: 76 },
  { id: 4, nama: 'Data Science',        jumlah: 112 },
  { id: 5, nama: 'Mobile Development',  jumlah: 89 },
  { id: 6, nama: 'Keamanan Siber',      jumlah: 54 },
  { id: 7, nama: 'Cloud Computing',     jumlah: 67 },
  { id: 8, nama: 'Game Development',    jumlah: 43 },
];

// ── Keyword dummy ─────────────────────────────────────────────────
export const keywordList = [
  { id: 1, kata: 'Machine Learning',  frekuensi: 312 },
  { id: 2, kata: 'Deep Learning',     frekuensi: 278 },
  { id: 3, kata: 'React.js',          frekuensi: 201 },
  { id: 4, kata: 'IoT',               frekuensi: 187 },
  { id: 5, kata: 'Flutter',           frekuensi: 156 },
  { id: 6, kata: 'PostgreSQL',        frekuensi: 143 },
  { id: 7, kata: 'Python',            frekuensi: 389 },
  { id: 8, kata: 'Laravel',           frekuensi: 267 },
];

// ── Chart data ────────────────────────────────────────────────────
export const uploadPerBulan = [
  { bulan: 'Jul',  jumlah: 12 },
  { bulan: 'Agu',  jumlah: 19 },
  { bulan: 'Sep',  jumlah: 24 },
  { bulan: 'Okt',  jumlah: 31 },
  { bulan: 'Nov',  jumlah: 28 },
  { bulan: 'Des',  jumlah: 22 },
  { bulan: 'Jan',  jumlah: 38 },
];

export const distribusiKategori = [
  { name: 'Sistem Informasi',  value: 145 },
  { name: 'Kecerdasan Buatan', value: 98 },
  { name: 'Data Science',      value: 112 },
  { name: 'Mobile Dev',        value: 89 },
  { name: 'Lainnya',           value: 240 },
];

// ── Metric cards ──────────────────────────────────────────────────
export const statsAdmin = [
  { label: 'Total Repositori', value: '1.284',  icon: 'folder_open',       color: 'bg-blue-50 text-blue-600',   trend: '+12%' },
  { label: 'Menunggu Verif.',  value: '24',      icon: 'hourglass_top',     color: 'bg-yellow-50 text-yellow-600', trend: '+5' },
  { label: 'Terverifikasi',    value: '1.241',  icon: 'task_alt',           color: 'bg-green-50 text-green-600',  trend: '+8%' },
  { label: 'Ditolak',          value: '19',      icon: 'cancel',            color: 'bg-red-50 text-red-600',      trend: '-3' },
];

export const statsMahasiswa = [
  { label: 'Pengajuan Saya',   value: '3',  icon: 'description',   color: 'bg-blue-50 text-blue-600' },
  { label: 'Terverifikasi',    value: '2',  icon: 'task_alt',      color: 'bg-green-50 text-green-600' },
  { label: 'Menunggu',         value: '1',  icon: 'pending',       color: 'bg-yellow-50 text-yellow-600' },
  { label: 'Perlu Revisi',     value: '0',  icon: 'edit_note',     color: 'bg-orange-50 text-orange-600' },
];
