import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';

const navItems = [
  { to: '/mahasiswa/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/mahasiswa/repository', icon: 'search', label: 'Cari Tugas Akhir' },
  { to: '/mahasiswa/upload', icon: 'upload_file', label: 'Upload Tugas Akhir' },
  { to: '/mahasiswa/similarity', icon: 'manage_search', label: 'Cek Similarity' },
  { to: '/mahasiswa/history', icon: 'history', label: 'Riwayat Upload' },
  { to: '/mahasiswa/profile', icon: 'account_circle', label: 'Profil Saya' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  return (
    <aside className="hidden lg:flex w-64 min-h-screen bg-white border-r border-outline/50 flex-col shadow-sm shrink-0">
      <div className="px-6 py-5 border-b border-outline/40">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-card">
            <span className="material-symbols-rounded icon-filled text-white text-[22px]">auto_stories</span>
          </div>
          <div>
            <p className="text-lg font-extrabold text-primary leading-none">RepoTA</p>
            <p className="text-[11px] text-gray-400 mt-1">Prodi Sistem Informasi</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${isActive ? 'nav-link-active' : 'text-gray-500 hover:bg-primary/5 hover:text-primary'}`}>
            <span className="material-symbols-rounded text-[20px] shrink-0">{icon}</span>
            <span className="font-semibold">{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-3 pb-5">
        <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all">
          <span className="material-symbols-rounded text-[20px]">logout</span>
          <span className="font-semibold">Keluar</span>
        </button>
      </div>
    </aside>
  );
}
