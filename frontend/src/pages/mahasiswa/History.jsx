import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Toast from '../../components/ui/Toast';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/State';
import {
  countWords,
  formatDate,
  getErrorMessage,
  statusClass,
  statusLabel,
  truncate,
} from '../../utils/helpers';

const TITLE_MIN_WORDS = 5;
const ABSTRACT_MIN_WORDS = 100;

const emptyEditForm = {
  title: '',
  abstract: '',
  research_date: '',
  advisor: '',
  category_id: '',
  document: null,
};

function toDateInput(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

export default function HistoryUpload() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  async function load({ silent = false } = {}) {
    try {
      if (!silent) {
        setLoading(true);
        setError('');
      }

      const [repositoryResponse, categoryResponse] = await Promise.all([
        api.get('/repositories/mine'),
        api.get('/categories'),
      ]);

      setItems((repositoryResponse.data || []).filter((item) => item.status !== 'draft'));
      setCategories(categoryResponse.data || []);
    } catch (err) {
      if (!silent) setError(getErrorMessage(err));
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function cancelUpload() {
    if (!deleteTarget) return;

    try {
      setDeletingId(deleteTarget.id);
      setError('');
      setToast('');
      await api.delete(`/repositories/${deleteTarget.id}`);
      setItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setToast('Upload Tugas Akhir berhasil dibatalkan.');
      setDeleteTarget(null);

      if (editingId === deleteTarget.id) {
        setEditingId(null);
        setEditForm(emptyEditForm);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  function openEditor(item) {
    if (editingId === item.id) {
      setEditingId(null);
      setEditForm(emptyEditForm);
      return;
    }

    setEditingId(item.id);
    setEditForm({
      title: item.title || '',
      abstract: item.abstract || '',
      research_date: toDateInput(item.research_date),
      advisor: item.advisor || '',
      category_id: item.category_id ? String(item.category_id) : '',
      document: null,
    });
    setError('');
    setToast('');
  }

  function updateEdit(key, value) {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateRevision() {
    if (countWords(editForm.title) < TITLE_MIN_WORDS) {
      return `Judul Tugas Akhir minimal ${TITLE_MIN_WORDS} kata.`;
    }

    if (!editForm.research_date) {
      return 'Tanggal Tugas Akhir wajib diisi.';
    }

    if (!editForm.advisor.trim()) {
      return 'Dosen pembimbing wajib diisi.';
    }

    if (countWords(editForm.abstract) < ABSTRACT_MIN_WORDS) {
      return `Abstrak minimal ${ABSTRACT_MIN_WORDS} kata.`;
    }

    if (editForm.document && editForm.document.type !== 'application/pdf') {
      return 'Dokumen pengganti harus berformat PDF.';
    }

    if (editForm.document && editForm.document.size > 10 * 1024 * 1024) {
      return 'Ukuran dokumen pengganti maksimal 10 MB.';
    }

    return '';
  }

  async function submitRevision(event, item) {
    event.preventDefault();

    const validationError = validateRevision();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSavingId(item.id);
      setError('');
      setToast('');

      const data = new FormData();
      data.append('title', editForm.title.trim());
      data.append('abstract', editForm.abstract.trim());
      data.append('research_date', editForm.research_date);
      data.append('advisor', editForm.advisor.trim());
      data.append('category_id', editForm.category_id);

      if (editForm.document) {
        data.append('document', editForm.document);
      }

      const response = await api.put(`/repositories/${item.id}/resubmit`, data);
      const selectedCategory = categories.find(
        (category) => Number(category.id) === Number(response.data?.category_id)
      );

      setItems((prev) =>
        prev.map((current) =>
          current.id === item.id
            ? {
                ...current,
                ...response.data,
                category_name: selectedCategory?.name || current.category_name,
              }
            : current
        )
      );

      setEditingId(null);
      setEditForm(emptyEditForm);
      setToast(response.message || 'Perbaikan berhasil dikirim ulang untuk verifikasi admin.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  useEffect(() => {
    load();

    const refreshSilently = () => {
      if (document.visibilityState === 'visible') {
        load({ silent: true });
      }
    };

    window.addEventListener('focus', refreshSilently);
    document.addEventListener('visibilitychange', refreshSilently);
    const refreshInterval = window.setInterval(refreshSilently, 8000);

    return () => {
      window.removeEventListener('focus', refreshSilently);
      document.removeEventListener('visibilitychange', refreshSilently);
      window.clearInterval(refreshInterval);
    };
  }, []);

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
      {error && <ErrorState message={error} onRetry={load} />}

      {loading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState
          icon="history"
          title="Riwayat belum ada"
          description="Upload Tugas Akhir kamu akan tampil di sini setelah dikirim."
        />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Judul</th>
                  <th className="table-th">Kategori</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Tanggal</th>
                  <th className="table-th text-right">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => {
                  const canCancel = ['draft', 'pending', 'revision', 'rejected'].includes(item.status);
                  const canRevise = ['revision', 'rejected'].includes(item.status);
                  const isEditing = editingId === item.id;
                  const titleWordCount = isEditing ? countWords(editForm.title) : 0;
                  const abstractWordCount = isEditing ? countWords(editForm.abstract) : 0;

                  return (
                    <Fragment key={item.id}>
                      <tr className="table-row align-top">
                        <td className="table-td font-semibold max-w-[360px]">
                          {truncate(item.title, 75)}

                          {canRevise && (
                            <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-normal leading-5 text-amber-800">
                              <span className="font-bold">Catatan admin:</span>{' '}
                              {item.rejection_note || 'Silakan periksa dan perbaiki kembali data pengajuan.'}
                            </div>
                          )}
                        </td>

                        <td className="table-td text-gray-500">{item.category_name || '-'}</td>
                        <td className="table-td">
                          <span className={statusClass(item.status)}>{statusLabel(item.status)}</span>
                        </td>
                        <td className="table-td text-gray-500">
                          {formatDate(item.research_date || item.created_at)}
                        </td>
                        <td className="table-td">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Link
                              className="btn-secondary py-1.5 text-xs"
                              to={`/mahasiswa/repository/${item.id}`}
                            >
                              Detail
                            </Link>

                            {canRevise && (
                              <button
                                type="button"
                                onClick={() => openEditor(item)}
                                className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
                              >
                                {isEditing ? 'Tutup Form' : 'Perbaiki di Sini'}
                              </button>
                            )}

                            {canCancel && (
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(item)}
                                disabled={deletingId === item.id}
                                className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {deletingId === item.id ? 'Membatalkan...' : 'Batal'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {isEditing && (
                        <tr>
                          <td colSpan="5" className="border-b border-outline/40 bg-gray-50/80 p-4 md:p-6">
                            <form
                              onSubmit={(event) => submitRevision(event, item)}
                              className="rounded-2xl border border-primary/20 bg-white p-5 shadow-sm"
                            >
                              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                                <span className="material-symbols-rounded">edit_note</span>
                                <div>
                                  <p className="font-extrabold">Perbaiki pengajuan tanpa berpindah halaman</p>
                                  <p className="mt-1 leading-6">
                                    Catatan admin: {item.rejection_note || 'Periksa kembali seluruh data pengajuan.'}
                                  </p>
                                </div>
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="md:col-span-2">
                                  <label className="label">
                                    Judul Tugas Akhir <span className="text-red-500">*</span>
                                    <span className="ml-2 text-xs font-medium text-gray-400">
                                      minimal {TITLE_MIN_WORDS} kata
                                    </span>
                                  </label>
                                  <input
                                    className="input"
                                    value={editForm.title}
                                    maxLength={250}
                                    onChange={(event) => updateEdit('title', event.target.value)}
                                    placeholder={`Judul minimal ${TITLE_MIN_WORDS} kata`}
                                  />
                                  <div className="mt-1 text-right text-xs font-semibold">
                                    <span className={titleWordCount >= TITLE_MIN_WORDS ? 'text-emerald-600' : 'text-amber-600'}>
                                      {titleWordCount}/{TITLE_MIN_WORDS} kata
                                    </span>
                                  </div>
                                </div>

                                <div>
                                  <label className="label">
                                    Tanggal Tugas Akhir <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="date"
                                    className="input"
                                    value={editForm.research_date}
                                    onChange={(event) => updateEdit('research_date', event.target.value)}
                                  />
                                </div>

                                <div>
                                  <label className="label">Kategori</label>
                                  <select
                                    className="input"
                                    value={editForm.category_id}
                                    onChange={(event) => updateEdit('category_id', event.target.value)}
                                  >
                                    <option value="">Otomatis berdasarkan judul dan abstrak</option>
                                    {categories.map((category) => (
                                      <option key={category.id} value={category.id}>
                                        {category.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="md:col-span-2">
                                  <label className="label">
                                    Dosen Pembimbing <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    className="input"
                                    value={editForm.advisor}
                                    onChange={(event) => updateEdit('advisor', event.target.value)}
                                    placeholder="Nama dosen pembimbing"
                                  />
                                </div>

                                <div className="md:col-span-2">
                                  <label className="label">
                                    Abstrak <span className="text-red-500">*</span>
                                    <span className="ml-2 text-xs font-medium text-gray-400">
                                      minimal {ABSTRACT_MIN_WORDS} kata
                                    </span>
                                  </label>
                                  <textarea
                                    className="input min-h-40"
                                    value={editForm.abstract}
                                    onChange={(event) => updateEdit('abstract', event.target.value)}
                                    placeholder={`Abstrak minimal ${ABSTRACT_MIN_WORDS} kata`}
                                  />
                                  <div className="mt-1 text-right text-xs font-semibold">
                                    <span className={abstractWordCount >= ABSTRACT_MIN_WORDS ? 'text-emerald-600' : 'text-amber-600'}>
                                      {abstractWordCount}/{ABSTRACT_MIN_WORDS} kata
                                    </span>
                                  </div>
                                </div>

                                <div className="md:col-span-2">
                                  <label className="label">Ganti Dokumen PDF</label>
                                  <input
                                    type="file"
                                    accept="application/pdf"
                                    className="input file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white"
                                    onChange={(event) => updateEdit('document', event.target.files?.[0] || null)}
                                  />
                                  <p className="mt-1 text-xs text-gray-400">
                                    File saat ini: {item.file_name || 'Dokumen tersimpan'}. Kosongkan jika dokumen tidak perlu diganti. Maksimal 10 MB.
                                  </p>
                                </div>
                              </div>

                              <div className="mt-5 flex flex-col-reverse gap-3 border-t border-outline/40 pt-5 sm:flex-row sm:justify-end">
                                <button
                                  type="button"
                                  className="btn-secondary justify-center"
                                  onClick={() => openEditor(item)}
                                  disabled={savingId === item.id}
                                >
                                  Batal Mengedit
                                </button>
                                <button
                                  type="submit"
                                  className="btn-primary justify-center"
                                  disabled={savingId === item.id}
                                >
                                  <span className={`material-symbols-rounded text-[18px] ${savingId === item.id ? 'animate-spin' : ''}`}>
                                    {savingId === item.id ? 'refresh' : 'send'}
                                  </span>
                                  {savingId === item.id ? 'Mengirim...' : 'Kirim Ulang Perbaikan'}
                                </button>
                              </div>
                            </form>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Batalkan Upload"
        message="Batalkan upload Tugas Akhir ini? Data dan dokumen akan dihapus permanen."
        confirmText="Batalkan Upload"
        danger
        loading={Boolean(deletingId)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={cancelUpload}
      />
    </div>
  );
}
