import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/admin/dashboard',   icon: 'dashboard',         label: 'Dashboard' },
  { to: '/admin/verifikasi',  icon: 'task_alt',          label: 'Verifikasi' },
  { to: '/admin/repository',  icon: 'folder_open',       label: 'Repositori' },
  { to: '/admin/kategori',    icon: 'category',          label: 'Kategori' },
  { to: '/admin/keyword',     icon: 'label',             label: 'Keyword' },
  { to: '/admin/laporan',     icon: 'bar_chart',         label: 'Laporan' },
];

export default function AdminSidebar() {
  const navigate = useNavigate();

  return (
    <aside className="w-64 min-h-screen bg-tertiary-700 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
            <span className="material-symbols-rounded icon-filled text-white text-[20px]">
              auto_stories
            </span>
          </div>
          <div>
            <p className="text-base font-bold text-white leading-none">RepoTA</p>
            <p className="text-[10px] text-white/50 mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-150
               ${isActive
                 ? 'admin-nav-link-active'
                 : 'text-white/60 hover:bg-white/10 hover:text-white'
               }`
            }
          >
            <span className="material-symbols-rounded text-[20px] shrink-0">{icon}</span>
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Admin info + logout */}
      <div className="px-3 pb-5 border-t border-white/10 pt-4">
        <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-white/10">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-rounded text-white text-[18px]">person</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">Admin RepoTA</p>
            <p className="text-[10px] text-white/50 truncate">admin@univ.ac.id</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-white/60 hover:bg-white/10 hover:text-white transition-all duration-150"
        >
          <span className="material-symbols-rounded text-[20px]">logout</span>
          <span className="font-medium">Keluar</span>
        </button>
      </div>
    </aside>
  );
}
