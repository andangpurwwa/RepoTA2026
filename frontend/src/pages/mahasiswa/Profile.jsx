import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../auth';
import Avatar from '../../components/ui/Avatar';
import Toast from '../../components/ui/Toast';
import { getErrorMessage } from '../../utils/helpers';

function createEmptyOtp() {
  return {
    code: '',
    new_password: '',
    confirm: '',
    sent: false,
  };
}

function createEmptyManual() {
  return {
    current_password: '',
    new_password: '',
    confirm: '',
  };
}

export default function ProfileMahasiswa() {
  const { user, saveUser } = useAuth();

  const [mode, setMode] = useState('otp');
  const [profileForm, setProfileForm] = useState({ name: '' });
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [otp, setOtp] = useState(createEmptyOtp);
  const [manual, setManual] = useState(createEmptyManual);

  // Setiap fitur memiliki loading sendiri agar tidak saling memengaruhi.
  const [profileLoading, setProfileLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
    });
  }, [user]);

  useEffect(() => {
    const clearAutofillTimer = window.setTimeout(() => {
      setOtp(createEmptyOtp());
      setManual(createEmptyManual());
    }, 150);

    return () => {
      window.clearTimeout(clearAutofillTimer);
    };
  }, []);

  function clearNotification() {
    setError('');
    setMessage('');
  }

  function resetPasswordForms(nextMode = mode) {
    setOtp(createEmptyOtp());
    setManual(createEmptyManual());
    setMode(nextMode);
    clearNotification();
  }

  function validatePhoto(file) {
    if (!file) {
      return 'Pilih foto profil terlebih dahulu.';
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return 'Foto profil harus berformat JPG, PNG, atau WEBP.';
    }

    if (file.size > 2 * 1024 * 1024) {
      return 'Ukuran foto maksimal 2 MB.';
    }

    return '';
  }

  async function updateProfile(event) {
    event.preventDefault();

    if (profileLoading) return;

    const name = profileForm.name.trim();

    if (!name) {
      setError('Nama wajib diisi.');
      return;
    }

    if (name.length < 3) {
      setError('Nama minimal 3 karakter.');
      return;
    }

    if (name.length > 120) {
      setError('Nama maksimal 120 karakter.');
      return;
    }

    try {
      setProfileLoading(true);
      clearNotification();

      const response = await api.put('/users/me', { name });

      saveUser(response.user);
      setMessage(response.message || 'Profil berhasil diperbarui.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setProfileLoading(false);
    }
  }

  async function uploadPhoto(event) {
    event.preventDefault();

    if (photoLoading) return;

    const photoError = validatePhoto(selectedPhoto);

    if (photoError) {
      setError(photoError);
      return;
    }

    const formData = new FormData();
    formData.append('photo', selectedPhoto);

    try {
      setPhotoLoading(true);
      clearNotification();

      const response = await api.post('/users/me/photo', formData);

      saveUser(response.user);
      setSelectedPhoto(null);

      const photoInput = document.getElementById('profile-photo');
      if (photoInput) photoInput.value = '';

      setMessage(response.message || 'Foto profil berhasil diunggah.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPhotoLoading(false);
    }
  }

  async function deletePhoto() {
    if (photoLoading) return;

    try {
      setPhotoLoading(true);
      clearNotification();

      const response = await api.delete('/users/me/photo');

      saveUser(response.user);
      setSelectedPhoto(null);

      const photoInput = document.getElementById('profile-photo');
      if (photoInput) photoInput.value = '';

      setMessage(response.message || 'Foto profil berhasil dihapus.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPhotoLoading(false);
    }
  }

  async function sendOtp() {
    if (otpSending) return;

    if (!user?.email) {
      setError('Email akun tidak ditemukan.');
      return;
    }

    try {
      setOtpSending(true);
      clearNotification();

      setOtp({
        code: '',
        new_password: '',
        confirm: '',
        sent: false,
      });

      const response = await api.post('/auth/password/request-otp', {
        identifier: user.email,
      });

      setOtp({
        code: '',
        new_password: '',
        confirm: '',
        sent: true,
      });

      setMessage(
        response.message || 'Kode OTP sudah dikirim ke email akun.'
      );
    } catch (err) {
      setOtp(createEmptyOtp());
      setError(getErrorMessage(err));
    } finally {
      setOtpSending(false);
    }
  }

  async function changeByOtp(event) {
    event.preventDefault();

    if (passwordLoading) return;

    const cleanCode = otp.code.replace(/\D/g, '');

    if (!cleanCode) {
      setError('Kode OTP wajib diisi.');
      return;
    }

    if (cleanCode.length !== 6) {
      setError('Kode OTP harus terdiri dari 6 angka.');
      return;
    }

    if (!otp.new_password) {
      setError('Password baru wajib diisi.');
      return;
    }

    if (otp.new_password.length < 8) {
      setError('Password baru minimal 8 karakter.');
      return;
    }

    if (!otp.confirm) {
      setError('Konfirmasi password wajib diisi.');
      return;
    }

    if (otp.new_password !== otp.confirm) {
      setError('Konfirmasi password baru belum sama.');
      return;
    }

    try {
      setPasswordLoading(true);
      clearNotification();

      const response = await api.post('/auth/password/reset', {
        identifier: user?.email,
        code: cleanCode,
        new_password: otp.new_password,
      });

      setOtp(createEmptyOtp());
      setMessage(response.message || 'Password berhasil diubah.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPasswordLoading(false);
    }
  }

  async function changeManual(event) {
    event.preventDefault();

    if (passwordLoading) return;

    if (!manual.current_password) {
      setError('Password lama wajib diisi.');
      return;
    }

    if (!manual.new_password) {
      setError('Password baru wajib diisi.');
      return;
    }

    if (manual.new_password.length < 8) {
      setError('Password baru minimal 8 karakter.');
      return;
    }

    if (!manual.confirm) {
      setError('Konfirmasi password wajib diisi.');
      return;
    }

    if (manual.new_password !== manual.confirm) {
      setError('Konfirmasi password baru belum sama.');
      return;
    }

    if (manual.current_password === manual.new_password) {
      setError('Password baru tidak boleh sama dengan password lama.');
      return;
    }

    try {
      setPasswordLoading(true);
      clearNotification();

      const response = await api.post('/auth/change-password', {
        current_password: manual.current_password,
        new_password: manual.new_password,
      });

      setManual(createEmptyManual());
      setMessage(response.message || 'Password berhasil diubah.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-16 lg:pb-0">
      <section className="card relative overflow-hidden rounded-3xl p-6">
        <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-primary/5" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar user={user} size="lg" className="shrink-0" />

          <div className="min-w-0">
            <h2 className="truncate text-2xl font-extrabold">
              {user?.name || 'Mahasiswa SI'}
            </h2>
            <p className="text-sm text-gray-500">
              Mahasiswa Program Studi Sistem Informasi
            </p>
            <p className="mt-1 break-all text-xs text-gray-400">
              {user?.email || '-'}
            </p>
          </div>

          <Link
            to="/mahasiswa/upload"
            className="btn-primary justify-center sm:ml-auto"
          >
            <span className="material-symbols-rounded text-[18px]">
              upload_file
            </span>
            Upload Tugas Akhir
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Info label="Email" value={user?.email || '-'} />
          <Info label="NIM" value={user?.nim || '-'} />
          <Info label="Prodi" value="Sistem Informasi" />
        </div>
      </section>

      {error && (
        <Toast type="error" message={error} onClose={() => setError('')} />
      )}

      {message && (
        <Toast message={message} onClose={() => setMessage('')} />
      )}

      <section className="card rounded-3xl p-5">
        <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
          <form
            onSubmit={uploadPhoto}
            className="space-y-4 rounded-3xl border border-outline/40 bg-gray-50 p-5"
            encType="multipart/form-data"
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <Avatar user={user} size="xl" />
              <div>
                <h3 className="font-extrabold">Foto Profil</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Upload foto profil dengan format JPG, PNG, atau WEBP maksimal
                  2 MB.
                </p>
              </div>
            </div>

            <input
              id="profile-photo"
              name="profile_photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="input file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white"
              onChange={(event) => {
                setSelectedPhoto(event.target.files?.[0] || null);
                clearNotification();
              }}
            />

            {selectedPhoto && (
              <p className="break-all text-xs text-gray-500">
                Dipilih: {selectedPhoto.name}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={photoLoading || !selectedPhoto}
                className="btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-60"
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
                  type="button"
                  disabled={photoLoading}
                  className="btn-secondary justify-center disabled:cursor-not-allowed disabled:opacity-60"
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

          <form
            onSubmit={updateProfile}
            className="space-y-4"
            autoComplete="off"
          >
            <div>
              <h3 className="text-lg font-extrabold">Edit Profil</h3>
              <p className="mt-1 text-sm text-gray-500">
                Email dan NIM dikunci agar data upload tetap sesuai akun
                mahasiswa.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="profile-name" className="label">
                  Nama Lengkap
                </label>
                <input
                  id="profile-name"
                  name="profile_name"
                  type="text"
                  className="input"
                  autoComplete="name"
                  value={profileForm.name}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label htmlFor="profile-study-program" className="label">
                  Prodi
                </label>
                <input
                  id="profile-study-program"
                  name="profile_study_program"
                  type="text"
                  className="input bg-gray-50 text-gray-500"
                  value="Sistem Informasi"
                  autoComplete="off"
                  readOnly
                />
              </div>

              <div>
                <label htmlFor="profile-email" className="label">
                  Email
                </label>
                <input
                  id="profile-email"
                  name="profile_email"
                  type="email"
                  className="input bg-gray-50 text-gray-500"
                  value={user?.email || ''}
                  autoComplete="email"
                  readOnly
                />
              </div>

              <div>
                <label htmlFor="profile-nim" className="label">
                  NIM
                </label>
                <input
                  id="profile-nim"
                  name="profile_nim"
                  type="text"
                  className="input bg-gray-50 text-gray-500"
                  value={user?.nim || ''}
                  autoComplete="off"
                  readOnly
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span
                className={`material-symbols-rounded text-[18px] ${
                  profileLoading ? 'animate-spin' : ''
                }`}
              >
                {profileLoading ? 'refresh' : 'save'}
              </span>
              {profileLoading ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </form>
        </div>
      </section>

      <section className="card rounded-3xl p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-extrabold">Ubah Password</h3>
            <p className="mt-1 text-sm text-gray-500">
              Ganti sandi melalui OTP email atau password lama.
            </p>
          </div>

          <div className="flex rounded-2xl bg-gray-100 p-1 text-sm font-bold">
            <button
              type="button"
              onClick={() => resetPasswordForms('otp')}
              className={`rounded-xl px-3 py-2 ${
                mode === 'otp'
                  ? 'bg-white text-primary shadow-card'
                  : 'text-gray-500'
              }`}
            >
              OTP Email
            </button>

            <button
              type="button"
              onClick={() => resetPasswordForms('manual')}
              className={`rounded-xl px-3 py-2 ${
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
          <form
            onSubmit={changeByOtp}
            className="space-y-4"
            autoComplete="off"
          >
            <input
              type="text"
              name="repota_otp_account_identifier"
              value={user?.email || ''}
              autoComplete="username"
              readOnly
              tabIndex={-1}
              aria-hidden="true"
              className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
            />

            <div className="flex flex-col gap-3 rounded-2xl border border-outline/40 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold">Kirim OTP ke email akun</p>
                <p className="break-all text-sm text-gray-500">
                  {user?.email || '-'}
                </p>
              </div>

              <button
                type="button"
                onClick={sendOtp}
                disabled={otpSending}
                className="btn-secondary justify-center disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span
                  className={`material-symbols-rounded text-[18px] ${
                    otpSending ? 'animate-spin' : ''
                  }`}
                >
                  {otpSending ? 'refresh' : 'mail'}
                </span>
                {otpSending
                  ? 'Mengirim...'
                  : otp.sent
                    ? 'Kirim Ulang OTP'
                    : 'Kirim OTP'}
              </button>
            </div>

            {otp.sent && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                Kode OTP sudah dikirim ke email akun. Cek inbox atau folder
                spam.
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                id="repota-otp-code"
                name="repota_otp_verification_code"
                label="Kode OTP"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                value={otp.code}
                onChange={(value) => {
                  const numericValue = value.replace(/\D/g, '').slice(0, 6);
                  setOtp((current) => ({
                    ...current,
                    code: numericValue,
                  }));
                }}
                placeholder="Masukkan 6 digit"
                maxLength={6}
                className="font-bold tracking-[0.45em]"
              />

              <Field
                id="repota-otp-new-password"
                name="repota_otp_new_password"
                type="password"
                label="Password Baru"
                autoComplete="new-password"
                value={otp.new_password}
                onChange={(value) =>
                  setOtp((current) => ({
                    ...current,
                    new_password: value,
                  }))
                }
                placeholder="Minimal 8 karakter"
                minLength={8}
              />

              <Field
                id="repota-otp-confirm-password"
                name="repota_otp_confirm_password"
                type="password"
                label="Konfirmasi"
                autoComplete="new-password"
                value={otp.confirm}
                onChange={(value) =>
                  setOtp((current) => ({
                    ...current,
                    confirm: value,
                  }))
                }
                placeholder="Ulangi password"
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading || !otp.sent}
              className="btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span
                className={`material-symbols-rounded text-[18px] ${
                  passwordLoading ? 'animate-spin' : ''
                }`}
              >
                {passwordLoading ? 'refresh' : 'lock_reset'}
              </span>
              {passwordLoading
                ? 'Memproses...'
                : 'Ubah Password dengan OTP'}
            </button>
          </form>
        ) : (
          <form
            onSubmit={changeManual}
            className="space-y-4"
            autoComplete="off"
          >
            <input
              type="text"
              name="repota_manual_account_identifier"
              value={user?.email || ''}
              autoComplete="username"
              readOnly
              tabIndex={-1}
              aria-hidden="true"
              className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                id="repota-current-password"
                name="repota_current_password_manual"
                type="password"
                label="Password Lama"
                autoComplete="off"
                value={manual.current_password}
                onChange={(value) =>
                  setManual((current) => ({
                    ...current,
                    current_password: value,
                  }))
                }
                placeholder="Masukkan password lama"
              />

              <Field
                id="repota-manual-new-password"
                name="repota_manual_new_password"
                type="password"
                label="Password Baru"
                autoComplete="new-password"
                value={manual.new_password}
                onChange={(value) =>
                  setManual((current) => ({
                    ...current,
                    new_password: value,
                  }))
                }
                placeholder="Minimal 8 karakter"
                minLength={8}
              />

              <Field
                id="repota-manual-confirm-password"
                name="repota_manual_confirm_password"
                type="password"
                label="Konfirmasi"
                autoComplete="new-password"
                value={manual.confirm}
                onChange={(value) =>
                  setManual((current) => ({
                    ...current,
                    confirm: value,
                  }))
                }
                placeholder="Ulangi password"
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span
                className={`material-symbols-rounded text-[18px] ${
                  passwordLoading ? 'animate-spin' : ''
                }`}
              >
                {passwordLoading ? 'refresh' : 'lock'}
              </span>
              {passwordLoading ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-outline/40 bg-gray-50 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 break-words font-bold">{value}</p>
    </div>
  );
}

function Field({
  id,
  name,
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  maxLength,
  minLength,
  inputMode,
  pattern,
  autoComplete = 'off',
  className = '',
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label} <span className="text-red-500">*</span>
      </label>

      <input
        id={id}
        name={name}
        type={type}
        className={`input ${className}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        minLength={minLength}
        inputMode={inputMode}
        pattern={pattern}
        autoComplete={autoComplete}
        autoCapitalize="none"
        spellCheck={false}
        data-lpignore="true"
        data-1p-ignore="true"
        required
      />
    </div>
  );
}
