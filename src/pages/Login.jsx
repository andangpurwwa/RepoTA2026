import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TABS = [
  { key: 'mahasiswa', label: 'Mahasiswa',  icon: 'school' },
  { key: 'admin',     label: 'Admin',      icon: 'admin_panel_settings' },
  { key: 'tamu',      label: 'Tamu',       icon: 'person_search' },
];

export default function Login() {
  const navigate  = useNavigate();
  const [tab, setTab]         = useState('mahasiswa');
  const [nim, setNim]         = useState('');
  const [password, setPass]   = useState('');
  const [showPass, setShow]   = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (tab === 'admin')     navigate('/admin/dashboard');
      else if (tab === 'tamu') navigate('/guest');
      else                     navigate('/mahasiswa/dashboard');
    }, 900);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-surface to-white flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-primary p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="material-symbols-rounded icon-filled text-white text-[22px]">auto_stories</span>
          </div>
          <span className="text-xl font-bold text-white">RepoTA</span>
        </div>
        <div>
          <h2 className="text-4xl font-bold text-white leading-tight">
            Repositori<br />Tugas Akhir<br />Digital
          </h2>
          <p className="mt-4 text-white/70 text-sm leading-relaxed max-w-xs">
            Platform pengelolaan tugas akhir yang efisien, transparan, dan mudah diakses.
          </p>
          {/* Stats */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { val: '1.2K+', lbl: 'Repositori' },
              { val: '98%',   lbl: 'Terverifikasi' },
              { val: '4.8★',  lbl: 'Rating' },
            ].map(({ val, lbl }) => (
              <div key={lbl} className="bg-white/10 rounded-2xl p-4">
                <p className="text-2xl font-bold text-white">{val}</p>
                <p className="text-xs text-white/60 mt-1">{lbl}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/40 text-xs">© 2025 RepoTA · Universitas</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <span className="material-symbols-rounded icon-filled text-white text-[18px]">auto_stories</span>
            </div>
            <span className="font-bold text-primary">RepoTA</span>
          </div>

          <h1 className="text-2xl font-bold text-on-surface mb-1">Selamat Datang</h1>
          <p className="text-sm text-gray-400 mb-6">Masuk sebagai siapa?</p>

          {/* Tab selector */}
          <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl mb-6">
            {TABS.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all
                  ${tab === key ? 'bg-white text-primary shadow-card' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <span className="material-symbols-rounded text-[16px]">{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab !== 'tamu' && (
              <>
                <div>
                  <label className="label">
                    {tab === 'admin' ? 'Username' : 'NIM / Email'}
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder={tab === 'admin' ? 'admin@univ.ac.id' : '2021xxxxx'}
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="input pr-10"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPass(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <span className="material-symbols-rounded text-[18px]">
                        {showPass ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  {tab === 'mahasiswa' && (
                    <div className="flex justify-end mt-1">
                      <a href="#" className="text-xs text-primary hover:underline">Lupa password?</a>
                    </div>
                  )}
                </div>
              </>
            )}

            {tab === 'tamu' && (
              <div className="py-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-rounded icon-filled text-primary text-[32px]">search</span>
                </div>
                <p className="text-sm text-gray-500">
                  Akses sebagai tamu untuk menelusuri repositori publik tanpa login.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 text-sm"
            >
              {loading
                ? <span className="material-symbols-rounded text-[18px] animate-spin">refresh</span>
                : <span className="material-symbols-rounded text-[18px]">
                    {tab === 'tamu' ? 'search' : 'login'}
                  </span>
              }
              {loading ? 'Memproses...' : tab === 'tamu' ? 'Jelajahi Repositori' : 'Masuk'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
