import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/layout/AdminSidebar';
import Navbar from '../components/layout/Navbar';

const pageTitles = {
  '/admin/dashboard': { title: 'Dashboard Admin', subtitle: 'Monitoring repository dan pengajuan Tugas Akhir' },
  '/admin/verifikasi': { title: 'Verifikasi Repository', subtitle: 'Periksa detail dokumen sebelum menyetujui' },
  '/admin/repository': { title: 'Kelola Repository', subtitle: 'Pencarian, detail, edit, dan hapus data repository' },
  '/admin/mahasiswa': { title: 'Tabel Mahasiswa', subtitle: 'Data mahasiswa dan status upload Tugas Akhir' },
  '/admin/kategori': { title: 'Kelola Kategori', subtitle: 'Atur kategori penelitian Program Studi Sistem Informasi' },
  '/admin/keyword': { title: 'Kelola Keyword', subtitle: 'Atur keyword kategorisasi otomatis' },
  '/admin/laporan': { title: 'Laporan & Statistik', subtitle: 'Rekap tren repository berdasarkan kategori dan tanggal' },
};

const mobileItems = [
  { to: '/admin/dashboard', icon: 'dashboard', label: 'Home' },
  { to: '/admin/verifikasi', icon: 'fact_check', label: 'Verif' },
  { to: '/admin/repository', icon: 'folder_open', label: 'Repo' },
  { to: '/admin/mahasiswa', icon: 'groups', label: 'Mhs' },
  { to: '/admin/kategori', icon: 'category', label: 'Master' },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const meta = pageTitles[pathname] || { title: 'Admin RepoTA', subtitle: 'Panel administrasi' };
  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 p-4 sm:p-6 overflow-auto pb-24 lg:pb-6"><Outlet /></main>
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-tertiary-700 border-t border-white/10 px-2 py-2 grid grid-cols-5 shadow-modal">
          {mobileItems.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl text-[10px] font-bold ${isActive ? 'text-white bg-white/20' : 'text-white/65'}`}><span className="material-symbols-rounded text-[20px]">{item.icon}</span>{item.label}</NavLink>)}
        </nav>
      </div>
    </div>
  );
}
