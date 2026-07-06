import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';

const navItems = [
  { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/admin/verifikasi', icon: 'fact_check', label: 'Verifikasi' },
  { to: '/admin/repository', icon: 'folder_open', label: 'Repository' },
  { to: '/admin/mahasiswa', icon: 'groups', label: 'Mahasiswa' },
  { to: '/admin/kategori', icon: 'category', label: 'Kategori' },
  { to: '/admin/keyword', icon: 'label', label: 'Keyword' },
  { to: '/admin/laporan', icon: 'monitoring', label: 'Laporan' },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  return (
    <aside className="hidden lg:flex w-64 min-h-screen bg-tertiary-700 flex-col shrink-0">
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
            <span className="material-symbols-rounded icon-filled text-white text-[22px]">auto_stories</span>
          </div>
          <div>
            <p className="text-lg font-extrabold text-white leading-none">RepoTA</p>
            <p className="text-[11px] text-white/55 mt-1">Admin Prodi SI</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${isActive ? 'admin-nav-link-active' : 'text-white/65 hover:bg-white/10 hover:text-white'}`}>
            <span className="material-symbols-rounded text-[20px] shrink-0">{icon}</span>
            <span className="font-semibold">{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-3 pb-5 border-t border-white/10 pt-4">
        <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-white/10">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-rounded text-white text-[18px]">person</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'Admin RepoTA'}</p>
            <p className="text-[10px] text-white/55 truncate">{user?.email || 'admin.repota.prodi@gmail.com'}</p>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-white/65 hover:bg-white/10 hover:text-white transition-all">
          <span className="material-symbols-rounded text-[20px]">logout</span>
          <span className="font-semibold">Keluar</span>
        </button>
      </div>
    </aside>
  );
}
