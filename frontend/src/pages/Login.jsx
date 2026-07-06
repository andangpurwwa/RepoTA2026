import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { getErrorMessage } from '../utils/helpers';

const ADMIN_DEMO_EMAIL = 'admin.repota.prodi@gmail.com';
const STUDENT_DEMO_EMAIL = '2300016106@webmail.uad.ac.id';

const TABS = [
  { key: 'mahasiswa', label: 'Mahasiswa', icon: 'school', hint: `${STUDENT_DEMO_EMAIL} / mhs123` },
  { key: 'admin', label: 'Admin', icon: 'admin_panel_settings', hint: `${ADMIN_DEMO_EMAIL} / admin123` },
];

const emptyRegister = { name: '', email: '', nim: '', password: '', confirmPassword: '' };
const emptyReset = { identifier: '', code: '', new_password: '', confirm: '', sent: false };

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const remembered = localStorage.getItem('repota_remember_identifier');
  const [mode, setMode] = useState('login');
  const [tab, setTab] = useState('mahasiswa');
  const [identifier, setIdentifier] = useState(remembered || STUDENT_DEMO_EMAIL);
  const [password, setPassword] = useState(remembered ? '' : 'mhs123');
  const [remember, setRemember] = useState(Boolean(remembered));
  const [registerForm, setRegisterForm] = useState(emptyRegister);
  const [resetForm, setResetForm] = useState(emptyReset);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const activeHint = TABS.find((item) => item.key === tab)?.hint;
  const title = useMemo(() => {
    if (mode === 'register') return 'Daftar Akun Mahasiswa';
    if (mode === 'forgot') return resetForm.sent ? 'Ubah Password dengan OTP' : 'Lupa Password';
    return 'Masuk ke Sistem';
  }, [mode, resetForm.sent]);

  const subtitle = useMemo(() => {
    if (mode === 'register') return 'Gunakan email webmail UAD berbasis NIM, contoh 2300016106@webmail.uad.ac.id.';
    if (mode === 'forgot') return 'Kode OTP dikirim melalui Gmail pengirim resmi sistem ke email akun yang terdaftar.';
    return 'Portal Repository dan Analisis Tugas Akhir Program Studi Sistem Informasi.';
  }, [mode]);

  function changeTab(key) {
    setTab(key);
    setMode('login');
    setIdentifier(key === 'admin' ? ADMIN_DEMO_EMAIL : (remembered || STUDENT_DEMO_EMAIL));
    setPassword(key === 'admin' ? 'admin123' : (remembered ? '' : 'mhs123'));
    setError('');
    setSuccess('');
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError('');
    setSuccess('');
    if (nextMode === 'forgot') setResetForm({ ...emptyReset, identifier: identifier || '' });
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError(tab === 'admin' ? 'Email admin dan password wajib diisi.' : 'Email/NIM dan password wajib diisi.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const user = await login(identifier.trim(), password);
      if (remember) localStorage.setItem('repota_remember_identifier', identifier.trim());
      else localStorage.removeItem('repota_remember_identifier');
      const target = location.state?.from?.pathname || (user.role === 'admin' ? '/admin/dashboard' : '/mahasiswa/dashboard');
      navigate(target, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
      setError('Nama, email webmail UAD, password, dan konfirmasi password wajib diisi.');
      return;
    }
    const emailMatch = registerForm.email.trim().toLowerCase().match(/^([0-9]{8,12})@(?:student\.)?webmail\.uad\.ac\.id$/);
    if (!emailMatch) {
      setError('Email mahasiswa harus memakai NIM, contoh: 2300016106@webmail.uad.ac.id.');
      return;
    }
    if (registerForm.nim.trim() && registerForm.nim.trim() !== emailMatch[1]) {
      setError('NIM harus sama dengan angka di depan email webmail UAD.');
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Konfirmasi password belum sama.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const res = await api.post('/auth/register', {
        name: registerForm.name.trim(),
        email: registerForm.email.trim().toLowerCase(),
        nim: registerForm.nim.trim() || emailMatch[1],
        password: registerForm.password,
      });
      setSuccess('Akun mahasiswa berhasil dibuat. Silakan login memakai email webmail UAD kamu.');
      setMode('login');
      setTab('mahasiswa');
      setIdentifier(res.user?.email || registerForm.email.trim());
      setPassword('');
      setRegisterForm(emptyRegister);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function requestOtp(e) {
    e.preventDefault();
    if (!resetForm.identifier.trim()) {
      setError('Email akun wajib diisi untuk mengirim kode OTP.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const res = await api.post('/auth/password/request-otp', { identifier: resetForm.identifier.trim() });
      setResetForm((f) => ({ ...f, sent: true }));
      setSuccess(res.message || 'Kode OTP sudah dikirim ke email akun kamu.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e) {
    e.preventDefault();
    if (!resetForm.code || !resetForm.new_password || !resetForm.confirm) {
      setError('Kode OTP, password baru, dan konfirmasi password wajib diisi.');
      return;
    }
    if (resetForm.new_password !== resetForm.confirm) {
      setError('Konfirmasi password baru belum sama.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const res = await api.post('/auth/password/reset', {
        identifier: resetForm.identifier.trim(),
        code: resetForm.code.trim(),
        new_password: resetForm.new_password,
      });
      setSuccess(res.message || 'Password berhasil diubah. Silakan login.');
      setIdentifier(resetForm.identifier.trim());
      setPassword('');
      setResetForm(emptyReset);
      setMode('login');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-surface to-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl">
        <div className="text-center mb-6">
          <Link to="/guest" className="inline-flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-card">
              <span className="material-symbols-rounded icon-filled text-[28px]">auto_stories</span>
            </div>
            <div className="text-left">
              <p className="text-2xl font-extrabold text-primary leading-none">RepoTA</p>
              <p className="text-xs text-gray-500 mt-1">Repository & Analisis Tugas Akhir SI</p>
            </div>
          </Link>
        </div>

        <section className="card p-6 sm:p-8 rounded-3xl shadow-modal">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface">{title}</h2>
            <p className="text-sm text-gray-500 mt-2 leading-6">{subtitle}</p>
          </div>

          {mode === 'login' && (
            <div className="flex gap-1.5 bg-gray-100 p-1 rounded-2xl mb-5">
              {TABS.map(({ key, label, icon }) => (
                <button key={key} type="button" onClick={() => changeTab(key)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition ${tab === key ? 'bg-white text-primary shadow-card' : 'text-gray-500 hover:text-gray-700'}`}>
                  <span className="material-symbols-rounded text-[18px]">{icon}</span>{label}
                </button>
              ))}
            </div>
          )}

          {error && <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex gap-2"><span className="material-symbols-rounded text-[18px]">error</span><span>{error}</span></div>}
          {success && <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 flex gap-2"><span className="material-symbols-rounded text-[18px]">check_circle</span><span>{success}</span></div>}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label">{tab === 'admin' ? 'Email Admin' : 'Email Mahasiswa atau NIM'} <span className="text-red-500">*</span></label>
                <input className="input" placeholder={tab === 'admin' ? 'admin.prodi@gmail.com' : '2300016106@webmail.uad.ac.id atau NIM'} value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" />
              </div>
              <div>
                <label className="label">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} className="input pr-11" placeholder="Masukkan password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><span className="material-symbols-rounded text-[20px]">{showPass ? 'visibility_off' : 'visibility'}</span></button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="inline-flex items-center gap-2 text-gray-600"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-primary" />Ingat akun saya</label>
                <button type="button" onClick={() => switchMode('forgot')} className="font-bold text-primary hover:underline">Lupa password?</button>
              </div>
              <button disabled={loading} className="btn-primary w-full justify-center"><span className={`material-symbols-rounded text-[18px] ${loading ? 'animate-spin' : ''}`}>{loading ? 'refresh' : 'login'}</span>{loading ? 'Memproses...' : 'Masuk'}</button>
              <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-500">Demo: {activeHint}</div>
              {tab === 'mahasiswa' && <button type="button" onClick={() => switchMode('register')} className="btn-secondary w-full justify-center">Daftar Akun Mahasiswa UAD</button>}
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div><label className="label">Nama Lengkap <span className="text-red-500">*</span></label><input className="input" value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} placeholder="Nama mahasiswa" /></div>
              <div><label className="label">Email Webmail UAD <span className="text-red-500">*</span></label><input className="input" type="email" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} placeholder="2300016106@webmail.uad.ac.id" /></div>
              <div><label className="label">NIM</label><input className="input" value={registerForm.nim} onChange={(e) => setRegisterForm({ ...registerForm, nim: e.target.value })} placeholder="2300016106" /></div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className="label">Password <span className="text-red-500">*</span></label><input type="password" className="input" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} placeholder="Minimal 6 karakter" /></div>
                <div><label className="label">Konfirmasi <span className="text-red-500">*</span></label><input type="password" className="input" value={registerForm.confirmPassword} onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })} placeholder="Ulangi password" /></div>
              </div>
              <button disabled={loading} className="btn-primary w-full justify-center">Daftar</button>
              <button type="button" onClick={() => switchMode('login')} className="btn-secondary w-full justify-center">Kembali ke Login</button>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={resetForm.sent ? resetPassword : requestOtp} className="space-y-4">
              <div>
                <label className="label">Email Akun Terdaftar <span className="text-red-500">*</span></label>
                <input className="input" value={resetForm.identifier} onChange={(e) => setResetForm({ ...resetForm, identifier: e.target.value })} placeholder="Masukkan email akun" disabled={resetForm.sent} />
              </div>
              {resetForm.sent && (
                <>
                  <div className="rounded-2xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">Kode OTP sudah dikirim ke email akun terdaftar. Cek inbox atau spam.</div>
                  <div><label className="label">Kode OTP <span className="text-red-500">*</span></label><input className="input tracking-[0.45em] font-bold" maxLength={6} value={resetForm.code} onChange={(e) => setResetForm({ ...resetForm, code: e.target.value })} placeholder="123456" /></div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><label className="label">Password Baru <span className="text-red-500">*</span></label><input type="password" className="input" value={resetForm.new_password} onChange={(e) => setResetForm({ ...resetForm, new_password: e.target.value })} placeholder="Minimal 6 karakter" /></div>
                    <div><label className="label">Konfirmasi <span className="text-red-500">*</span></label><input type="password" className="input" value={resetForm.confirm} onChange={(e) => setResetForm({ ...resetForm, confirm: e.target.value })} placeholder="Ulangi password" /></div>
                  </div>
                </>
              )}
              <button disabled={loading} className="btn-primary w-full justify-center">{resetForm.sent ? 'Ubah Password' : 'Kirim OTP ke Email'}</button>
              <button type="button" onClick={() => switchMode('login')} className="btn-secondary w-full justify-center">Kembali ke Login</button>
            </form>
          )}
        </section>

        <div className="mt-5 flex items-center justify-center text-sm">
          <Link to="/guest" className="text-gray-500 hover:text-primary font-semibold">Jelajahi Repository sebagai Guest</Link>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">© 2026 RepoTA · Program Studi Sistem Informasi</p>
      </div>
    </div>
  );
}
