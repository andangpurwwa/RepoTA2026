import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/mahasiswa/dashboard',  icon: 'dashboard',       label: 'Dashboard' },
  { to: '/mahasiswa/upload',     icon: 'upload_file',     label: 'Upload Repositori' },
  { to: '/mahasiswa/similarity', icon: 'manage_search',   label: 'Cek Similaritas' },
  { to: '/mahasiswa/history',    icon: 'history',         label: 'Riwayat' },
  { to: '/mahasiswa/profile',    icon: 'account_circle',  label: 'Profil Saya' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-outline/50 flex flex-col shadow-sm shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-outline/40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow">
            <span className="material-symbols-rounded icon-filled text-white text-[20px]">
              auto_stories
            </span>
          </div>
          <div>
            <p className="text-base font-bold text-primary leading-none">RepoTA</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Repositori Tugas Akhir</p>
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
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-150 group
               ${isActive
                 ? 'nav-link-active'
                 : 'text-gray-500 hover:bg-primary/5 hover:text-primary'
               }`
            }
          >
            <span className="material-symbols-rounded text-[20px] shrink-0">{icon}</span>
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
        >
          <span className="material-symbols-rounded text-[20px]">logout</span>
          <span className="font-medium">Keluar</span>
        </button>
      </div>
    </aside>
  );
}
