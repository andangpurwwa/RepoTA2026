import { Outlet, Link } from 'react-router-dom';

export default function GuestLayout() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Guest navbar */}
      <header className="bg-white border-b border-outline/40 px-6 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="material-symbols-rounded icon-filled text-white text-[16px]">auto_stories</span>
          </div>
          <span className="font-bold text-primary text-sm">RepoTA</span>
        </div>
        <Link to="/login" className="btn-primary text-xs py-1.5 px-3">
          <span className="material-symbols-rounded text-[16px]">login</span>
          Masuk
        </Link>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
