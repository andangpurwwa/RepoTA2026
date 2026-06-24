import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/layout/AdminSidebar';

const pageTitles = {
  '/admin/dashboard':  'Dashboard Admin',
  '/admin/verifikasi': 'Verifikasi Repositori',
  '/admin/repository': 'Manajemen Repositori',
  '/admin/kategori':   'Manajemen Kategori',
  '/admin/keyword':    'Manajemen Keyword',
  '/admin/laporan':    'Laporan & Statistik',
};

export default function AdminLayout() {
  const { pathname } = useLocation();
  const title = pageTitles[pathname] || 'Admin RepoTA';

  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin topbar */}
        <header className="h-16 bg-white border-b border-outline/40 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <h1 className="text-base font-semibold">{title}</h1>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-primary/5 transition">
              <span className="material-symbols-rounded text-[22px] text-gray-500">notifications</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-tertiary-700 flex items-center justify-center ml-1">
              <span className="material-symbols-rounded icon-filled text-white text-[18px]">person</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
