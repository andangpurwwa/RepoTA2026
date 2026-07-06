import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../auth';
import { getErrorMessage } from '../../utils/helpers';

const emptyOtp = { code: '', new_password: '', confirm: '', sent: false };
const emptyManual = { current_password: '', new_password: '', confirm: '' };

export default function ProfileMahasiswa() {
  const { user } = useAuth();
  const [mode, setMode] = useState('otp');
  const [otp, setOtp] = useState(emptyOtp);
  const [manual, setManual] = useState(emptyManual);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function sendOtp() {
    try {
      setLoading(true);
      setError('');
      setMessage('');
      const res = await api.post('/auth/password/request-otp', { identifier: user?.email });
      setOtp((f) => ({ ...f, sent: true }));
      setMessage(res.message || 'Kode OTP sudah dikirim ke email kamu.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function changeByOtp(e) {
    e.preventDefault();
    if (!otp.code || !otp.new_password || !otp.confirm) {
      setError('Kode OTP, password baru, dan konfirmasi password wajib diisi.');
      return;
    }
    if (otp.new_password !== otp.confirm) {
      setError('Konfirmasi password baru belum sama.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setMessage('');
      const res = await api.post('/auth/password/reset', { identifier: user?.email, code: otp.code, new_password: otp.new_password });
      setMessage(res.message || 'Password berhasil diubah.');
      setOtp(emptyOtp);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function changeManual(e) {
    e.preventDefault();
    if (!manual.current_password || !manual.new_password || !manual.confirm) {
      setError('Password lama, password baru, dan konfirmasi password wajib diisi.');
      return;
    }
    if (manual.new_password !== manual.confirm) {
      setError('Konfirmasi password baru belum sama.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setMessage('');
      const res = await api.post('/auth/change-password', {
        current_password: manual.current_password,
        new_password: manual.new_password,
      });
      setMessage(res.message || 'Password berhasil diubah.');
      setManual(emptyManual);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-16 lg:pb-0">
      <section className="card p-6 rounded-3xl overflow-hidden relative">
        <div className="absolute -right-14 -top-14 w-44 h-44 rounded-full bg-primary/5 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><span className="material-symbols-rounded text-[34px]">account_circle</span></div>
          <div className="min-w-0">
            <h2 className="text-2xl font-extrabold truncate">{user?.name || 'Mahasiswa SI'}</h2>
            <p className="text-sm text-gray-500">Mahasiswa Program Studi Sistem Informasi</p>
            <p className="text-xs text-gray-400 mt-1 break-all">{user?.email}</p>
          </div>
          <Link to="/mahasiswa/upload" className="btn-primary sm:ml-auto justify-center"><span className="material-symbols-rounded text-[18px]">upload_file</span>Upload Tugas Akhir</Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <Info label="Email" value={user?.email || '-'} />
          <Info label="NIM" value={user?.nim || '-'} />
          <Info label="Role" value="Mahasiswa" />
          <Info label="Prodi" value="Sistem Informasi" />
        </div>
      </section>

      <section className="card p-5 rounded-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="font-extrabold text-lg">Ubah Password</h3>
            <p className="text-sm text-gray-500 mt-1">Ganti sandi melalui OTP yang dikirim ke email akun atau memakai password lama.</p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-2xl text-sm font-bold">
            <button type="button" onClick={() => { setMode('otp'); setError(''); setMessage(''); }} className={`px-3 py-2 rounded-xl ${mode === 'otp' ? 'bg-white text-primary shadow-card' : 'text-gray-500'}`}>OTP Email</button>
            <button type="button" onClick={() => { setMode('manual'); setError(''); setMessage(''); }} className={`px-3 py-2 rounded-xl ${mode === 'manual' ? 'bg-white text-primary shadow-card' : 'text-gray-500'}`}>Password Lama</button>
          </div>
        </div>

        {error && <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex gap-2"><span className="material-symbols-rounded text-[18px]">error</span>{error}</div>}
        {message && <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 flex gap-2"><span className="material-symbols-rounded text-[18px]">check_circle</span>{message}</div>}

        {mode === 'otp' ? (
          <form onSubmit={changeByOtp} className="space-y-4">
            <div className="rounded-2xl bg-gray-50 border border-outline/40 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-bold">Kirim OTP ke email akun</p>
                <p className="text-sm text-gray-500 break-all">{user?.email}</p>
              </div>
              <button type="button" onClick={sendOtp} disabled={loading} className="btn-secondary justify-center"><span className="material-symbols-rounded text-[18px]">mail</span>{otp.sent ? 'Kirim Ulang OTP' : 'Kirim OTP'}</button>
            </div>
            {otp.sent && <div className="rounded-2xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">Kode OTP sudah dikirim ke email akun. Cek inbox atau folder spam.</div>}
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Kode OTP <span className="text-red-500">*</span></label>
                <input className="input tracking-[0.45em] font-bold" value={otp.code} onChange={(e) => setOtp((f) => ({ ...f, code: e.target.value }))} maxLength={6} placeholder="123456" />
              </div>
              <div>
                <label className="label">Password Baru <span className="text-red-500">*</span></label>
                <input type="password" className="input" value={otp.new_password} onChange={(e) => setOtp((f) => ({ ...f, new_password: e.target.value }))} placeholder="Minimal 6 karakter" />
              </div>
              <div>
                <label className="label">Konfirmasi <span className="text-red-500">*</span></label>
                <input type="password" className="input" value={otp.confirm} onChange={(e) => setOtp((f) => ({ ...f, confirm: e.target.value }))} placeholder="Ulangi password" />
              </div>
            </div>
            <button disabled={loading || !otp.sent} className="btn-primary justify-center"><span className="material-symbols-rounded text-[18px]">lock_reset</span>Ubah Password dengan OTP</button>
          </form>
        ) : (
          <form onSubmit={changeManual} className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Password Lama <span className="text-red-500">*</span></label>
                <input type="password" className="input" value={manual.current_password} onChange={(e) => setManual((f) => ({ ...f, current_password: e.target.value }))} />
              </div>
              <div>
                <label className="label">Password Baru <span className="text-red-500">*</span></label>
                <input type="password" className="input" value={manual.new_password} onChange={(e) => setManual((f) => ({ ...f, new_password: e.target.value }))} />
              </div>
              <div>
                <label className="label">Konfirmasi <span className="text-red-500">*</span></label>
                <input type="password" className="input" value={manual.confirm} onChange={(e) => setManual((f) => ({ ...f, confirm: e.target.value }))} />
              </div>
            </div>
            <button disabled={loading} className="btn-primary justify-center"><span className="material-symbols-rounded text-[18px]">lock</span>Simpan Password Baru</button>
          </form>
        )}
      </section>

      <section className="card p-5 rounded-3xl">
        <h3 className="font-extrabold">Bantuan Akun</h3>
        <p className="text-sm text-gray-500 mt-2 leading-6">Jika email tidak menerima OTP, cek folder spam atau hubungi admin Program Studi Sistem Informasi melalui menu kontak di halaman guest.</p>
      </section>
    </div>
  );
}
function Info({ label, value }) { return <div className="rounded-2xl bg-gray-50 border border-outline/40 p-4 min-w-0"><p className="text-xs text-gray-500">{label}</p><p className="font-bold mt-1 break-words">{value}</p></div>; }
