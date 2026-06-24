import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar  from '../components/layout/Navbar';

const pageTitles = {
  '/mahasiswa/dashboard':  { title: 'Dashboard',          subtitle: 'Selamat datang kembali' },
  '/mahasiswa/upload':     { title: 'Upload Repositori',  subtitle: 'Ajukan tugas akhir baru' },
  '/mahasiswa/similarity': { title: 'Cek Similaritas',    subtitle: 'Periksa kesamaan dokumen' },
  '/mahasiswa/history':    { title: 'Riwayat Pengajuan',  subtitle: 'Semua pengajuan kamu' },
  '/mahasiswa/profile':    { title: 'Profil Saya',        subtitle: 'Kelola informasi akun' },
};

export default function StudentLayout() {
  const { pathname } = useLocation();
  const meta = pageTitles[pathname] || { title: 'RepoTA', subtitle: '' };

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
