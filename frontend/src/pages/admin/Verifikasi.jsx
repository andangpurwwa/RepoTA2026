import { useEffect, useRef, useState } from 'react';
import { api } from '../../api';
import Modal from '../../components/ui/Modal';
import Toast from '../../components/ui/Toast';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/State';
import { formatDate, truncate, getErrorMessage } from '../../utils/helpers';

const MIN_ADMIN_NOTE = 5;

export default function Verifikasi() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [pageError, setPageError] = useState('');
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState('');
  const noteRef = useRef(null);

  async function load() {
    try {
      setLoading(true);
      setPageError('');

      const res = await api.get('/repositories/pending');

      setItems(res.data || []);
    } catch (err) {
      setPageError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function verify(id, status) {
    const trimmedNote = note.trim();
    const requiresNote = ['revision', 'rejected'].includes(status);

    if (requiresNote && trimmedNote.length < MIN_ADMIN_NOTE) {
      setFormError(
        `Tuliskan catatan yang jelas minimal ${MIN_ADMIN_NOTE} karakter sebelum memilih Revisi atau Tolak.`
      );
      noteRef.current?.focus();
      return;
    }

    try {
      setProcessing(true);
      setFormError('');
      setToast('');

      const res = await api.patch(`/repositories/${id}/verify`, {
        status,
        rejection_note: requiresNote ? trimmedNote : '',
      });

      setItems((previous) => previous.filter((item) => item.id !== id));
      setSelected(null);
      setNote('');
      setToast(
        res.message ||
          (status === 'revision'
            ? 'Pengajuan dikirim ke mahasiswa untuk diperbaiki.'
            : status === 'rejected'
              ? 'Pengajuan berhasil ditolak.'
              : 'Pengajuan berhasil disetujui.')
      );
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-5">
      {toast && (
        <Toast
          message={toast}
          onClose={() => setToast('')}
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
                {items.map((repo) => (
                  <tr
                    className="table-row"
                    key={repo.id}
                  >
                    <td className="table-td font-semibold max-w-[420px]">
                      {truncate(repo.title, 80)}
                    </td>

                    <td className="table-td">
                      <p className="font-semibold">
                        {repo.submitter_name || repo.author_name || '-'}
                      </p>

                      <p className="text-xs text-gray-400">
                        {repo.submitter_nim || repo.nim || '-'}
                      </p>

                      <p className="text-xs text-gray-400">
                        {repo.submitter_email || repo.email_uad || '-'}
                      </p>
                    </td>

                    <td className="table-td text-gray-500">
                      {repo.category_name || '-'}
                    </td>

                    <td className="table-td text-gray-500">
                      {formatDate(repo.research_date || repo.created_at)}
                    </td>

                    <td className="table-td">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(repo);
                            setFormError('');
                            setNote('');
                          }}
                          className="btn-primary py-1.5 text-xs"
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
          onClose={() => {
            setSelected(null);
            setNote('');
            setFormError('');
          }}
        >
          <Detail repo={selected} />

          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <label className="label">
              Catatan Admin untuk Revisi/Tolak <span className="text-red-500">*</span>
            </label>

            <textarea
              ref={noteRef}
              className={`input min-h-24 ${formError ? 'border-red-400 focus:border-red-500' : ''}`}
              value={note}
              onChange={(event) => {
                const value = event.target.value;
                setNote(value);
                if (value.trim().length >= MIN_ADMIN_NOTE) setFormError('');
              }}
              placeholder="Contoh: Perbaiki abstrak agar minimal 100 kata dan unggah kembali PDF yang benar."
              maxLength={1000}
            />

            <div className="mt-2 flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between">
              <p className={formError ? 'font-semibold text-red-600' : 'text-amber-800'}>
                {formError || 'Catatan wajib diisi saat memilih Revisi atau Tolak agar mahasiswa mengetahui bagian yang harus diperbaiki.'}
              </p>
              <p className={`shrink-0 font-bold ${note.trim().length >= MIN_ADMIN_NOTE ? 'text-emerald-600' : 'text-amber-700'}`}>
                {note.trim().length}/{MIN_ADMIN_NOTE} karakter minimum
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-5">
            <button
              type="button"
              disabled={processing}
              className="btn-secondary justify-center"
              title={note.trim().length < MIN_ADMIN_NOTE ? `Isi catatan minimal ${MIN_ADMIN_NOTE} karakter` : 'Kirim kembali kepada mahasiswa untuk diperbaiki'}
              onClick={() => verify(selected.id, 'revision')}
            >
              <span className="material-symbols-rounded text-[18px]">
                edit_note
              </span>
              Revisi
            </button>

            <button
              type="button"
              disabled={processing}
              className="btn-danger justify-center"
              title={note.trim().length < MIN_ADMIN_NOTE ? `Isi catatan minimal ${MIN_ADMIN_NOTE} karakter` : 'Tolak pengajuan dengan catatan'}
              onClick={() => verify(selected.id, 'rejected')}
            >
              <span className="material-symbols-rounded text-[18px]">
                cancel
              </span>
              Tolak
            </button>

            <button
              type="button"
              disabled={processing}
              className="btn-primary justify-center"
              onClick={() => verify(selected.id, 'approved')}
            >
              <span className="material-symbols-rounded text-[18px]">
                check_circle
              </span>
              Setujui
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Detail({ repo }) {
  const url = repo.file_path ? api.fileUrl(repo.file_path) : null;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-gray-500">Judul</p>

        <h3 className="font-extrabold text-xl">
          {repo.title || '-'}
        </h3>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Info
          label="Mahasiswa"
          value={repo.author_name || repo.submitter_name || '-'}
        />

        <Info
          label="NIM"
          value={repo.nim || repo.submitter_nim || '-'}
        />

        <Info
          label="Email UAD"
          value={repo.email_uad || repo.submitter_email || '-'}
        />

        <Info
          label="Dosen Pembimbing"
          value={repo.advisor || '-'}
        />

        <Info
          label="Tanggal Tugas Akhir"
          value={formatDate(repo.research_date)}
        />

        <Info
          label="Kategori"
          value={repo.category_name || 'Otomatis setelah disetujui'}
        />
      </div>

      <div>
        <p className="text-xs text-gray-500">Abstrak</p>

        <p className="text-sm text-gray-600 leading-7 mt-1 whitespace-pre-line">
          {repo.abstract || '-'}
        </p>
      </div>

      <div className="rounded-2xl bg-gray-50 border border-outline/40 p-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-bold">Dokumen PDF</p>

          <p className="text-sm text-gray-500">
            {repo.file_name || 'Tidak ada file'}
          </p>
        </div>

        {url && (
          <a
            className="btn-secondary"
            target="_blank"
            rel="noreferrer"
            href={url}
          >
            <span className="material-symbols-rounded text-[18px]">
              open_in_new
            </span>
            Buka Dokumen
          </a>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-gray-50 border border-outline/40 p-3">
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="font-semibold mt-1 break-words">
        {value}
      </p>
    </div>
  );
}