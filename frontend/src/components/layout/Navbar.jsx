import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';

export default function Navbar({ title = 'Dashboard', subtitle = '' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const profilePath = user?.role === 'admin' ? '/admin/dashboard' : '/mahasiswa/profile';
  return (
    <header className="h-16 bg-white/95 backdrop-blur border-b border-outline/40 px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-sm">
      <div className="min-w-0">
        <h1 className="text-base sm:text-lg font-bold text-on-surface truncate">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[60vw] sm:max-w-none">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <Link to={profilePath} className="flex items-center gap-3 rounded-2xl px-2 py-1 hover:bg-primary/5 transition">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-on-surface">{user?.name || 'Pengguna'}</p>
            <p className="text-[11px] text-gray-400">{user?.role === 'admin' ? 'Administrator' : 'Mahasiswa SI'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-card">
            <span className="material-symbols-rounded icon-filled text-[18px]">person</span>
          </div>
        </Link>
        <button onClick={() => { logout(); navigate('/login'); }} className="lg:hidden btn-ghost px-2" title="Keluar"><span className="material-symbols-rounded">logout</span></button>
      </div>
    </header>
  );
}
