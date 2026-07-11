import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../auth';
import Avatar from '../../components/ui/Avatar';
import Toast from '../../components/ui/Toast';
import { getErrorMessage } from '../../utils/helpers';

const emptyOtp = {
  code: '',
  new_password: '',
  confirm: '',
  sent: false,
};

const emptyManual = {
  current_password: '',
  new_password: '',
  confirm: '',
};

export default function ProfileMahasiswa() {
  const { user, saveUser } = useAuth();

  const [mode, setMode] = useState('otp');
  const [profileForm, setProfileForm] = useState({ name: '' });
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [otp, setOtp] = useState(emptyOtp);
  const [manual, setManual] = useState(emptyManual);
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
    });
  }, [user]);

  function validatePhoto(file) {
    if (!file) return 'Pilih foto profil terlebih dahulu.';

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return 'Foto profil harus JPG, PNG, atau WEBP.';
    }

    if (file.size > 2 * 1024 * 1024) {
      return 'Ukuran foto maksimal 2 MB.';
    }

    return '';
  }

  async function updateProfile(e) {
    e.preventDefault();

    if (!profileForm.name.trim()) {
      setError('Nama wajib diisi.');
      return;
    }

    if (profileForm.name.trim().length < 3) {
      setError('Nama minimal 3 karakter.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const res = await api.put('/users/me', {
        name: profileForm.name.trim(),
        phone: '',
      });

      saveUser(res.user);
      setMessage(res.message || 'Profil berhasil diperbarui.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function uploadPhoto(e) {
    e.preventDefault();

    const photoError = validatePhoto(selectedPhoto);

    if (photoError) {
      setError(photoError);
      return;
    }

    const formData = new FormData();
    formData.append('photo', selectedPhoto);

    try {
      setPhotoLoading(true);
      setError('');
      setMessage('');

      const res = await api.post('/users/me/photo', formData);

      saveUser(res.user);
      setSelectedPhoto(null);

      const input = document.getElementById('profile-photo');

      if (input) {
        input.value = '';
      }

      setMessage(res.message || 'Foto profil berhasil diunggah.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPhotoLoading(false);
    }
  }

  async function deletePhoto() {
    try {
      setPhotoLoading(true);
      setError('');
      setMessage('');

      const res = await api.delete('/users/me/photo');

      saveUser(res.user);
      setSelectedPhoto(null);
      setMessage(res.message || 'Foto profil berhasil dihapus.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPhotoLoading(false);
    }
  }

  async function sendOtp() {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      const res = await api.post('/auth/password/request-otp', {
        identifier: user?.email,
      });

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

    if (otp.new_password.length < 8) {
      setError('Password baru minimal 8 karakter.');
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

      const res = await api.post('/auth/password/reset', {
        identifier: user?.email,
        code: otp.code,
        new_password: otp.new_password,
      });

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

    if (manual.new_password.length < 8) {
      setError('Password baru minimal 8 karakter.');
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
          <Avatar user={user} size="lg" className="shrink-0" />

          <div className="min-w-0">
            <h2 className="text-2xl font-extrabold truncate">
              {user?.name || 'Mahasiswa SI'}
            </h2>

            <p className="text-sm text-gray-500">
              Mahasiswa Program Studi Sistem Informasi
            </p>

            <p className="text-xs text-gray-400 mt-1 break-all">
              {user?.email}
            </p>
          </div>

          <Link
            to="/mahasiswa/upload"
            className="btn-primary sm:ml-auto justify-center"
          >
            <span className="material-symbols-rounded text-[18px]">
              upload_file
            </span>
            Upload Tugas Akhir
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          <Info label="Email" value={user?.email || '-'} />
          <Info label="NIM" value={user?.nim || '-'} />
          <Info label="Prodi" value="Sistem Informasi" />
        </div>
      </section>

      {error && (
        <Toast
          type="error"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {message && (
        <Toast
          message={message}
          onClose={() => setMessage('')}
        />
      )}

      <section className="card p-5 rounded-3xl">
        <div className="grid lg:grid-cols-[260px,1fr] gap-6">
          <form
            onSubmit={uploadPhoto}
            className="rounded-3xl bg-gray-50 border border-outline/40 p-5 space-y-4"
          >
            <div className="flex flex-col items-center text-center gap-3">
              <Avatar user={user} size="xl" />

              <div>
                <h3 className="font-extrabold">Foto Profil</h3>

                <p className="text-xs text-gray-500 mt-1">
                  Upload foto profil dengan format JPG, PNG, atau WEBP maksimal
                  2 MB.
                </p>
              </div>
            </div>

            <input
              id="profile-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="input file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white"
              onChange={(e) => setSelectedPhoto(e.target.files?.[0] || null)}
            />

            {selectedPhoto && (
              <p className="text-xs text-gray-500 break-all">
                Dipilih: {selectedPhoto.name}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <button
                disabled={photoLoading}
                className="btn-primary justify-center"
                type="submit"
              >
                <span
                  className={`material-symbols-rounded text-[18px] ${
                    photoLoading ? 'animate-spin' : ''
                  }`}
                >
                  {photoLoading ? 'refresh' : 'cloud_upload'}
                </span>
                {photoLoading ? 'Mengupload...' : 'Upload Foto'}
              </button>

              {user?.profile_photo_url && (
                <button
                  disabled={photoLoading}
                  className="btn-secondary justify-center"
                  type="button"
                  onClick={deletePhoto}
                >
                  <span className="material-symbols-rounded text-[18px]">
                    delete
                  </span>
                  Hapus Foto
                </button>
              )}
            </div>
          </form>

          <form onSubmit={updateProfile} className="space-y-4">
            <div>
              <h3 className="font-extrabold text-lg">Edit Profil</h3>

              <p className="text-sm text-gray-500 mt-1">
                Email dan NIM dikunci agar data upload tetap sesuai akun
                mahasiswa.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nama Lengkap</label>

                <input
                  className="input"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm((f) => ({
                      ...f,
                      name: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="label">Prodi</label>

                <input
                  className="input bg-gray-50 text-gray-500"
                  value="Sistem Informasi"
                  readOnly
                />
              </div>

              <div>
                <label className="label">Email</label>

                <input
                  className="input bg-gray-50 text-gray-500"
                  value={user?.email || ''}
                  readOnly
                />
              </div>

              <div>
                <label className="label">NIM</label>

                <input
                  className="input bg-gray-50 text-gray-500"
                  value={user?.nim || ''}
                  readOnly
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="btn-primary justify-center"
            >
              <span className="material-symbols-rounded text-[18px]">
                save
              </span>
              Simpan Profil
            </button>
          </form>
        </div>
      </section>

      <section className="card p-5 rounded-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="font-extrabold text-lg">Ubah Password</h3>

            <p className="text-sm text-gray-500 mt-1">
              Ganti sandi melalui OTP email atau password lama.
            </p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-2xl text-sm font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('otp');
                setError('');
                setMessage('');
              }}
              className={`px-3 py-2 rounded-xl ${
                mode === 'otp'
                  ? 'bg-white text-primary shadow-card'
                  : 'text-gray-500'
              }`}
            >
              OTP Email
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('manual');
                setError('');
                setMessage('');
              }}
              className={`px-3 py-2 rounded-xl ${
                mode === 'manual'
                  ? 'bg-white text-primary shadow-card'
                  : 'text-gray-500'
              }`}
            >
              Password Lama
            </button>
          </div>
        </div>

        {mode === 'otp' ? (
          <form onSubmit={changeByOtp} className="space-y-4">
            <div className="rounded-2xl bg-gray-50 border border-outline/40 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-bold">Kirim OTP ke email akun</p>

                <p className="text-sm text-gray-500 break-all">
                  {user?.email}
                </p>
              </div>

              <button
                type="button"
                onClick={sendOtp}
                disabled={loading}
                className="btn-secondary justify-center"
              >
                <span className="material-symbols-rounded text-[18px]">
                  mail
                </span>
                {otp.sent ? 'Kirim Ulang OTP' : 'Kirim OTP'}
              </button>
            </div>

            {otp.sent && (
              <div className="rounded-2xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
                Kode OTP sudah dikirim ke email akun. Cek inbox atau folder
                spam.
              </div>
            )}

            <div className="grid sm:grid-cols-3 gap-4">
              <Field
                label="Kode OTP"
                value={otp.code}
                onChange={(value) =>
                  setOtp((f) => ({ ...f, code: value }))
                }
                placeholder="123456"
                maxLength={6}
                className="tracking-[0.45em] font-bold"
              />

              <Field
                type="password"
                label="Password Baru"
                value={otp.new_password}
                onChange={(value) =>
                  setOtp((f) => ({ ...f, new_password: value }))
                }
                placeholder="Minimal 8 karakter"
              />

              <Field
                type="password"
                label="Konfirmasi"
                value={otp.confirm}
                onChange={(value) =>
                  setOtp((f) => ({ ...f, confirm: value }))
                }
                placeholder="Ulangi password"
              />
            </div>

            <button
              disabled={loading || !otp.sent}
              className="btn-primary justify-center"
            >
              <span className="material-symbols-rounded text-[18px]">
                lock_reset
              </span>
              Ubah Password dengan OTP
            </button>
          </form>
        ) : (
          <form onSubmit={changeManual} className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <Field
                type="password"
                label="Password Lama"
                value={manual.current_password}
                onChange={(value) =>
                  setManual((f) => ({ ...f, current_password: value }))
                }
              />

              <Field
                type="password"
                label="Password Baru"
                value={manual.new_password}
                onChange={(value) =>
                  setManual((f) => ({ ...f, new_password: value }))
                }
                placeholder="Minimal 8 karakter"
              />

              <Field
                type="password"
                label="Konfirmasi"
                value={manual.confirm}
                onChange={(value) =>
                  setManual((f) => ({ ...f, confirm: value }))
                }
              />
            </div>

            <button
              disabled={loading}
              className="btn-primary justify-center"
            >
              <span className="material-symbols-rounded text-[18px]">
                lock
              </span>
              Simpan Password Baru
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-gray-50 border border-outline/40 p-4 min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-bold mt-1 break-words">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  maxLength,
  className = '',
}) {
  return (
    <div>
      <label className="label">
        {label} <span className="text-red-500">*</span>
      </label>

      <input
        type={type}
        className={`input ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
      />
    </div>
  );
}