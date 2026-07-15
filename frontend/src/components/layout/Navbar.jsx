import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';
import Avatar from '../ui/Avatar';

export default function Navbar({ title = 'Dashboard', subtitle = '' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const profilePath =
    user?.role === 'admin' ? '/admin/dashboard' : '/mahasiswa/profile';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-outline/40 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6">
      <div className="min-w-0">
        <h1 className="truncate text-base font-bold text-on-surface sm:text-lg">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 max-w-[60vw] truncate text-xs text-gray-500 sm:max-w-none">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to={profilePath}
          className="flex items-center gap-3 rounded-2xl px-2 py-1 transition hover:bg-primary/5"
          aria-label="Buka profil pengguna"
        >
          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold text-on-surface">
              {user?.name || 'Pengguna'}
            </p>
            <p className="text-[11px] text-gray-400">
              {user?.role === 'admin' ? 'Administrator' : 'Mahasiswa SI'}
            </p>
          </div>
          <Avatar user={user} size="md" />
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="btn-ghost px-2 lg:hidden"
          title="Keluar"
          aria-label="Keluar dari akun"
        >
          <span className="material-symbols-rounded">logout</span>
        </button>
      </div>
    </header>
  );
}
