import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../api';
import Modal from '../../components/ui/Modal';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../components/ui/State';
import {
  formatDate,
  getErrorMessage,
  truncate,
} from '../../utils/helpers';

const MIN_ADMIN_NOTE = 5;
const MAX_ADMIN_NOTE = 1000;

const STATUS_CONFIG = {
  revision: {
    fallbackMessage: 'Pengajuan dikirim ke mahasiswa untuk diperbaiki.',
  },
  rejected: {
    fallbackMessage: 'Pengajuan berhasil ditolak.',
  },
  approved: {
    fallbackMessage: 'Pengajuan berhasil disetujui.',
  },
};

function normalizeListResponse(response) {
  const payload = response?.data ?? response;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;

  return [];
}

function getResponseMessage(response, fallback) {
  return (
    response?.data?.message ||
    response?.message ||
    fallback
  );
}

export default function Verifikasi() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [pageError, setPageError] = useState('');
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);

  const noteRef = useRef(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setPageError('');

      const response = await api.get('/repositories/pending');
      setItems(normalizeListResponse(response));
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [toast]);

  function openDetail(repository) {
    setSelected(repository);
    setNote('');
    setFormError('');
  }

  function closeDetail() {
    if (processing) return;

    setSelected(null);
    setNote('');
    setFormError('');
  }

  async function verify(id, status) {
    const trimmedNote = note.trim();
    const requiresNote = status === 'revision' || status === 'rejected';

    if (!STATUS_CONFIG[status]) {
      setFormError('Status verifikasi tidak valid.');
      return;
    }

    if (requiresNote && trimmedNote.length < MIN_ADMIN_NOTE) {
      setFormError(
        `Catatan wajib diisi minimal ${MIN_ADMIN_NOTE} karakter untuk status Revisi atau Tolak.`
      );
      noteRef.current?.focus();
      return;
    }

    try {
      setProcessing(true);
      setFormError('');
      setToast(null);

      const response = await api.patch(`/repositories/${id}/verify`, {
        status,
        rejection_note: requiresNote ? trimmedNote : '',
      });

      setItems((currentItems) =>
        currentItems.filter((item) => item.id !== id)
      );

      setSelected(null);
      setNote('');

      setToast({
        type: 'success',
        message: getResponseMessage(
          response,
          STATUS_CONFIG[status].fallbackMessage
        ),
      });
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setProcessing(false);
    }
  }

  const noteLength = note.trim().length;
  const noteIsValid = noteLength >= MIN_ADMIN_NOTE;

  return (
    <div className="space-y-5">
      {toast && (
        <ToastNotice
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {pageError && (
        <ErrorState
          message={pageError}
          onRetry={load}
        />
      )}

      {loading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState
          icon="fact_check"
          title="Tidak ada pengajuan"
          description="Semua repository sudah diproses."
        />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Judul</th>
                  <th className="table-th">Mahasiswa</th>
                  <th className="table-th">Kategori</th>
                  <th className="table-th">Tanggal</th>
                  <th className="table-th text-right">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {items.map((repository) => (
                  <tr
                    className="table-row"
                    key={repository.id}
                  >
                    <td className="table-td max-w-[420px] font-semibold">
                      {truncate(repository.title || '-', 80)}
                    </td>

                    <td className="table-td">
                      <p className="font-semibold">
                        {repository.submitter_name ||
                          repository.author_name ||
                          '-'}
                      </p>

                      <p className="text-xs text-gray-400">
                        {repository.submitter_nim ||
                          repository.nim ||
                          '-'}
                      </p>

                      <p className="text-xs text-gray-400">
                        {repository.submitter_email ||
                          repository.email_uad ||
                          '-'}
                      </p>
                    </td>

                    <td className="table-td text-gray-500">
                      {repository.category_name || '-'}
                    </td>

                    <td className="table-td text-gray-500">
                      {formatDate(
                        repository.research_date ||
                          repository.created_at
                      )}
                    </td>

                    <td className="table-td">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="btn-primary py-1.5 text-xs"
                          onClick={() => openDetail(repository)}
                        >
                          <span className="material-symbols-rounded text-[16px]">
                            visibility
                          </span>
                          Detail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <Modal
          wide
          title="Detail Verifikasi Repository"
          onClose={closeDetail}
        >
          <Detail repository={selected} />

          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <label
              className="label"
              htmlFor="admin-verification-note"
            >
              Catatan Admin untuk Revisi/Tolak{' '}
              <span className="text-red-500">*</span>
            </label>

            <textarea
              id="admin-verification-note"
              ref={noteRef}
              className={`input min-h-24 ${
                formError
                  ? 'border-red-400 focus:border-red-500'
                  : ''
              }`}
              value={note}
              disabled={processing}
              maxLength={MAX_ADMIN_NOTE}
              placeholder="Contoh: Perbaiki abstrak agar minimal 100 kata dan unggah kembali PDF yang benar."
              onChange={(event) => {
                const value = event.target.value;
                setNote(value);

                if (value.trim().length >= MIN_ADMIN_NOTE) {
                  setFormError('');
                }
              }}
            />

            <div className="mt-2 flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between">
              <p
                className={
                  formError
                    ? 'font-semibold text-red-600'
                    : 'text-amber-800'
                }
              >
                {formError ||
                  'Catatan wajib diisi saat memilih Revisi atau Tolak agar mahasiswa mengetahui bagian yang harus diperbaiki.'}
              </p>

              <p
                className={`shrink-0 font-bold ${
                  noteIsValid
                    ? 'text-emerald-600'
                    : 'text-amber-700'
                }`}
              >
                {noteLength}/{MIN_ADMIN_NOTE} karakter minimum
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col justify-end gap-2 sm:flex-row">
            <button
              type="button"
              className="btn-secondary justify-center disabled:cursor-not-allowed disabled:opacity-60"
              disabled={processing}
              title={
                noteIsValid
                  ? 'Kirim kembali kepada mahasiswa untuk diperbaiki'
                  : `Isi catatan minimal ${MIN_ADMIN_NOTE} karakter`
              }
              onClick={() => verify(selected.id, 'revision')}
            >
              <span className="material-symbols-rounded text-[18px]">
                edit_note
              </span>
              {processing ? 'Memproses...' : 'Revisi'}
            </button>

            <button
              type="button"
              className="btn-danger justify-center disabled:cursor-not-allowed disabled:opacity-60"
              disabled={processing}
              title={
                noteIsValid
                  ? 'Tolak pengajuan dengan catatan'
                  : `Isi catatan minimal ${MIN_ADMIN_NOTE} karakter`
              }
              onClick={() => verify(selected.id, 'rejected')}
            >
              <span className="material-symbols-rounded text-[18px]">
                cancel
              </span>
              {processing ? 'Memproses...' : 'Tolak'}
            </button>

            <button
              type="button"
              className="btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-60"
              disabled={processing}
              onClick={() => verify(selected.id, 'approved')}
            >
              <span className="material-symbols-rounded text-[18px]">
                check_circle
              </span>
              {processing ? 'Memproses...' : 'Setujui'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Detail({ repository }) {
  const documentUrl = repository.file_path
    ? api.fileUrl(repository.file_path)
    : null;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-gray-500">Judul</p>
        <h3 className="text-xl font-extrabold">
          {repository.title || '-'}
        </h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Info
          label="Mahasiswa"
          value={
            repository.author_name ||
            repository.submitter_name ||
            '-'
          }
        />

        <Info
          label="NIM"
          value={
            repository.nim ||
            repository.submitter_nim ||
            '-'
          }
        />

        <Info
          label="Email UAD"
          value={
            repository.email_uad ||
            repository.submitter_email ||
            '-'
          }
        />

        <Info
          label="Dosen Pembimbing"
          value={repository.advisor || '-'}
        />

        <Info
          label="Tanggal Tugas Akhir"
          value={formatDate(
            repository.research_date ||
              repository.created_at
          )}
        />

        <Info
          label="Kategori"
          value={
            repository.category_name ||
            'Otomatis setelah disetujui'
          }
        />
      </div>

      <div>
        <p className="text-xs text-gray-500">Abstrak</p>
        <p className="mt-1 whitespace-pre-line text-sm leading-7 text-gray-600">
          {repository.abstract || '-'}
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-outline/40 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-bold">Dokumen PDF</p>
          <p className="truncate text-sm text-gray-500">
            {repository.file_name || 'Tidak ada file'}
          </p>
        </div>

        {documentUrl ? (
          <a
            className="btn-secondary justify-center"
            href={documentUrl}
            target="_blank"
            rel="noreferrer"
          >
            <span className="material-symbols-rounded text-[18px]">
              open_in_new
            </span>
            Buka Dokumen
          </a>
        ) : (
          <span className="text-sm font-semibold text-gray-400">
            Dokumen tidak tersedia
          </span>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-outline/40 bg-gray-50 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 break-words font-semibold">{value}</p>
    </div>
  );
}

function ToastNotice({ message, type = 'success', onClose }) {
  const isSuccess = type === 'success';

  return (
    <div
      role="status"
      className={`flex items-start justify-between gap-3 rounded-2xl border p-4 shadow-sm ${
        isSuccess
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-red-200 bg-red-50 text-red-700'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="material-symbols-rounded text-[22px]">
          {isSuccess ? 'check_circle' : 'error'}
        </span>

        <p className="font-semibold">{message}</p>
      </div>

      <button
        type="button"
        className="rounded-lg p-1 transition hover:bg-black/5"
        aria-label="Tutup notifikasi"
        onClick={onClose}
      >
        <span className="material-symbols-rounded text-[20px]">
          close
        </span>
      </button>
    </div>
  );
}