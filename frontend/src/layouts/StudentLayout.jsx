import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

const pageTitles = {
  '/mahasiswa/dashboard': { title: 'Dashboard Mahasiswa', subtitle: 'Pencarian, upload, dan riwayat Tugas Akhir' },
  '/mahasiswa/repository': { title: 'Cari Tugas Akhir', subtitle: 'Temukan referensi repository yang sudah terverifikasi' },
  '/mahasiswa/upload': { title: 'Upload Tugas Akhir', subtitle: 'Kirim dokumen untuk verifikasi admin' },
  '/mahasiswa/similarity': { title: 'Cek Similarity Judul', subtitle: 'Bandingkan usulan judul dengan repository terdahulu' },
  '/mahasiswa/history': { title: 'Riwayat Upload', subtitle: 'Pantau status upload Tugas Akhir kamu' },
  '/mahasiswa/profile': { title: 'Profil Saya', subtitle: 'Informasi akun mahasiswa Sistem Informasi' },
};

const mobileItems = [
  { to: '/mahasiswa/dashboard', icon: 'dashboard', label: 'Home' },
  { to: '/mahasiswa/repository', icon: 'search', label: 'Cari' },
  { to: '/mahasiswa/upload', icon: 'upload_file', label: 'Upload' },
  { to: '/mahasiswa/similarity', icon: 'manage_search', label: 'Cek' },
  { to: '/mahasiswa/profile', icon: 'person', label: 'Profil' },
];

export default function StudentLayout() {
  const { pathname } = useLocation();
  const meta = pageTitles[pathname] || { title: 'RepoTA Mahasiswa', subtitle: 'Repository Tugas Akhir Sistem Informasi' };
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 p-4 sm:p-6 overflow-auto pb-24 lg:pb-6"><Outlet /></main>
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-outline/50 px-2 py-2 grid grid-cols-5 shadow-modal">
          {mobileItems.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl text-[10px] font-bold ${isActive ? 'text-primary bg-primary/10' : 'text-gray-500'}`}><span className="material-symbols-rounded text-[20px]">{item.icon}</span>{item.label}</NavLink>)}
        </nav>
      </div>
    </div>
  );
}
