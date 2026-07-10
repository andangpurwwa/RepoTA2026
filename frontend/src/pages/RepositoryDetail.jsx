import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import ConfirmModal from '../components/ui/ConfirmModal';
import Toast from '../components/ui/Toast';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState('');
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

  async function deleteRepository() {
    try {
      setDeleting(true);
      setError('');
      setToast('');

      await api.delete(`/repositories/${id}`);

      const isAdmin = user?.role === 'admin';
      setToast(
        isAdmin
          ? 'Repository berhasil dihapus.'
          : 'Upload Tugas Akhir berhasil dibatalkan.'
      );
      setShowDeleteConfirm(false);
      setTimeout(
        () => navigate(isAdmin ? '/admin/repository' : '/mahasiswa/history'),
        700
      );
    } catch (err) {
      setError(
        err.message ||
          (user?.role === 'admin'
            ? 'Gagal menghapus repository.'
            : 'Gagal membatalkan upload.')
      );
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

  const isAdmin = user?.role === 'admin' && !isGuestView;

  const canStudentCancel =
    user?.role === 'mahasiswa' &&
    !isGuestView &&
    ['draft', 'pending', 'revision', 'rejected'].includes(repo.status);

  const canDeleteRepository = isAdmin || canStudentCancel;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-primary"
      >
        <span className="material-symbols-rounded text-[18px]">arrow_back</span>
        Kembali
      </Link>

      <article className="card p-6 sm:p-8 rounded-3xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <span className="badge-info inline-block max-w-full truncate">
              {repo.category_name || 'Tanpa Kategori'}
            </span>

            <h1
              className="text-2xl sm:text-3xl font-extrabold leading-tight mt-4 break-words overflow-hidden"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                overflowWrap: 'anywhere',
              }}
            >
              {repo.title}
            </h1>
          </div>

          {repo.status && (
            <span className={`${statusClass(repo.status)} shrink-0`}>
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
            <p className="text-sm leading-7 text-gray-600 whitespace-pre-line break-words">
              {repo.abstract || 'Abstrak belum tersedia.'}
            </p>
          )}
        </section>

        <section className="mt-7 rounded-2xl border border-outline/50 bg-gray-50 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-bold text-on-surface">Dokumen Tugas Akhir</h3>

              <p
                className="text-sm text-gray-500 mt-1 break-words overflow-hidden"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflowWrap: 'anywhere',
                }}
              >
                {isGuestView
                  ? 'Login sebagai mahasiswa atau admin untuk membuka dokumen lengkap.'
                  : repo.file_name || 'Belum ada dokumen yang diunggah.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              {downloadUrl && !isGuestView ? (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                >
                  <span className="material-symbols-rounded text-[18px]">
                    download
                  </span>
                  Buka Dokumen
                </a>
              ) : isGuestView ? (
                <Link to="/login" className="btn-secondary">
                  <span className="material-symbols-rounded text-[18px]">
                    lock
                  </span>
                  Login
                </Link>
              ) : null}

              {canDeleteRepository && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleting}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="material-symbols-rounded text-[18px]">
                    delete
                  </span>
                  {deleting
                    ? isAdmin
                      ? 'Menghapus...'
                      : 'Membatalkan...'
                    : isAdmin
                      ? 'Hapus Repository'
                      : 'Batalkan Upload'}
                </button>
              )}
            </div>
          </div>
        </section>

        {repo.rejection_note && !isGuestView && (
          <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 break-words">
            <b>Catatan Admin:</b> {repo.rejection_note}
          </section>
        )}
      </article>

      <ConfirmModal
        open={showDeleteConfirm}
        title={isAdmin ? 'Hapus Repository' : 'Batalkan Upload'}
        message={
          isAdmin
            ? 'Hapus repository ini secara permanen? Data repository dan dokumen PDF akan dihapus.'
            : 'Batalkan upload Tugas Akhir ini? Data dan dokumen akan dihapus permanen.'
        }
        confirmText={isAdmin ? 'Hapus Permanen' : 'Batalkan Upload'}
        danger
        loading={deleting}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={deleteRepository}
      />
    </div>
  );
}

function Info({ label, value, icon }) {
  return (
    <div className="rounded-2xl bg-gray-50 border border-outline/40 p-4 min-w-0">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="material-symbols-rounded text-[18px] text-primary shrink-0">
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </div>

      <p
        className="mt-1 font-semibold text-on-surface break-words overflow-hidden"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflowWrap: 'anywhere',
        }}
      >
        {value || '-'}
      </p>
    </div>
  );
}
