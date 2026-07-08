import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/State';
import { formatDate, statusClass, statusLabel } from '../utils/helpers';

export default function RepositoryDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const isGuestPage = location.pathname.startsWith('/guest');
  const isGuestView = isGuestPage || !user;

  async function load() {
    try {
      setLoading(true);
      setError('');

      const res = isGuestPage
        ? await api.getPublic(`/repositories/${id}`)
        : await api.get(`/repositories/${id}`);

      setRepo(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function cancelUpload() {
    const ok = window.confirm(
      'Batalkan upload Tugas Akhir ini? Data dan dokumen akan dihapus permanen.'
    );

    if (!ok) return;

    try {
      setDeleting(true);

      await api.delete(`/repositories/${id}`);

      alert('Upload Tugas Akhir berhasil dibatalkan.');
      navigate('/mahasiswa/history');
    } catch (err) {
      alert(err.message || 'Gagal membatalkan upload.');
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    load();
  }, [id, isGuestPage]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <EmptyState />
      </div>
    );
  }

  const backTo =
    user?.role === 'admin' && !isGuestPage
      ? '/admin/repository'
      : user?.role === 'mahasiswa' && !isGuestPage
        ? '/mahasiswa/repository'
        : '/guest';

  const downloadUrl = repo.file_path ? api.fileUrl(repo.file_path) : null;

  const canCancelUpload =
    user?.role === 'mahasiswa' &&
    !isGuestView &&
    ['draft', 'pending', 'revision', 'rejected'].includes(repo.status);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-primary"
      >
        <span className="material-symbols-rounded text-[18px]">arrow_back</span>
        Kembali
      </Link>

      <article className="card p-6 sm:p-8 rounded-3xl">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <span className="badge-info">{repo.category_name || 'Tanpa Kategori'}</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight mt-4">
              {repo.title}
            </h1>
          </div>

          {repo.status && (
            <span className={statusClass(repo.status)}>
              {statusLabel(repo.status)}
            </span>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-6">
          <Info
            label="Mahasiswa"
            value={repo.author_name || repo.submitter_name || 'Mahasiswa SI'}
            icon="person"
          />
          <Info
            label="Tanggal Tugas Akhir"
            value={formatDate(repo.research_date)}
            icon="event"
          />
        </div>

        {!isGuestView && (
          <div className="grid md:grid-cols-2 gap-3 mt-3">
            <Info
              label="Dosen Pembimbing"
              value={repo.advisor || '-'}
              icon="supervisor_account"
            />
            <Info
              label="Pengunggah"
              value={repo.submitter_name || '-'}
              icon="upload_file"
            />
          </div>
        )}

        <section className="mt-7">
          <h2 className="font-bold text-on-surface mb-2">Abstrak</h2>

          {isGuestView ? (
            <p className="text-sm leading-7 text-gray-600">
              Login sebagai mahasiswa atau admin untuk melihat abstrak.
            </p>
          ) : (
            <p className="text-sm leading-7 text-gray-600 whitespace-pre-line">
              {repo.abstract || 'Abstrak belum tersedia.'}
            </p>
          )}
        </section>

        <section className="mt-7 rounded-2xl border border-outline/50 bg-gray-50 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-bold text-on-surface">Dokumen Tugas Akhir</h3>
              <p className="text-sm text-gray-500 mt-1">
                {isGuestView
                  ? 'Login sebagai mahasiswa atau admin untuk membuka dokumen lengkap.'
                  : repo.file_name || 'Belum ada dokumen yang diunggah.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {downloadUrl && !isGuestView ? (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                >
                  <span className="material-symbols-rounded text-[18px]">download</span>
                  Buka Dokumen
                </a>
              ) : isGuestView ? (
                <Link to="/login" className="btn-secondary">
                  <span className="material-symbols-rounded text-[18px]">lock</span>
                  Login
                </Link>
              ) : null}

              {canCancelUpload && (
                <button
                  type="button"
                  onClick={cancelUpload}
                  disabled={deleting}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="material-symbols-rounded text-[18px]">delete</span>
                  {deleting ? 'Membatalkan...' : 'Batalkan Upload'}
                </button>
              )}
            </div>
          </div>
        </section>

        {repo.rejection_note && !isGuestView && (
          <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            <b>Catatan Admin:</b> {repo.rejection_note}
          </section>
        )}
      </article>
    </div>
  );
}

function Info({ label, value, icon }) {
  return (
    <div className="rounded-2xl bg-gray-50 border border-outline/40 p-4">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="material-symbols-rounded text-[18px] text-primary">
          {icon}
        </span>
        {label}
      </div>
      <p className="mt-1 font-semibold text-on-surface">{value || '-'}</p>
    </div>
  );
}