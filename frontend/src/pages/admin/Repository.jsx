import { useEffect, useState } from 'react';
import { api } from '../../api';
import Modal from '../../components/ui/Modal';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/State';
import { formatDate, statusClass, statusLabel, truncate } from '../../utils/helpers';

export default function ManajemenRepo() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    category_id: ''
  });

  const [selected, setSelected] = useState(null);
  const [edit, setEdit] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');

      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
      ).toString();

      const [res, cat] = await Promise.all([
        api.get(`/repositories?${query}`),
        api.get('/categories')
      ]);

      setItems(res.data || []);
      setCategories(cat.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [filters.search, filters.status, filters.category_id]);

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      await api.delete(`/repositories/${deleteTarget.id}`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      alert(err.message || 'Gagal menghapus repository.');
    } finally {
      setDeleteLoading(false);
    }
  }

  async function saveEdit(e) {
    e.preventDefault();

    try {
      await api.put(`/repositories/${edit.id}`, edit);
      setEdit(null);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-5">
      <div className="card grid lg:grid-cols-[1.3fr_0.7fr_0.7fr] gap-3">
        <input
          className="input"
          placeholder="Cari judul, abstrak, atau mahasiswa"
          value={filters.search}
          onChange={(e) =>
            setFilters((f) => ({ ...f, search: e.target.value }))
          }
        />

        <select
          className="input"
          value={filters.status}
          onChange={(e) =>
            setFilters((f) => ({ ...f, status: e.target.value }))
          }
        >
          <option value="all">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="pending">Menunggu</option>
          <option value="approved">Terverifikasi</option>
          <option value="revision">Revisi</option>
          <option value="rejected">Ditolak</option>
        </select>

        <select
          className="input"
          value={filters.category_id}
          onChange={(e) =>
            setFilters((f) => ({ ...f, category_id: e.target.value }))
          }
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {loading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState icon="folder_off" title="Repository tidak ditemukan" />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Judul</th>
                  <th className="table-th">Mahasiswa</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Tanggal</th>
                  <th className="table-th text-right">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {items.map((repo) => (
                  <tr key={repo.id} className="table-row">
                    <td className="table-td font-semibold max-w-[380px]">
                      {truncate(repo.title, 75)}
                      <p className="text-xs text-gray-400 mt-1">
                        {repo.category_name || '-'}
                      </p>
                    </td>

                    <td className="table-td text-gray-500">
                      {repo.author_name || repo.submitter_name || '-'}
                    </td>

                    <td className="table-td">
                      <span className={statusClass(repo.status)}>
                        {statusLabel(repo.status)}
                      </span>
                    </td>

                    <td className="table-td text-gray-500">
                      {formatDate(repo.research_date || repo.created_at)}
                    </td>

                    <td className="table-td">
                      <div className="flex justify-end gap-2">
                        <button
                          className="btn-secondary py-1.5 text-xs"
                          onClick={() => setSelected(repo)}
                        >
                          Detail
                        </button>

                        <button
                          className="btn-secondary py-1.5 text-xs"
                          onClick={() => setEdit(repo)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn-danger py-1.5 text-xs"
                          onClick={() => setDeleteTarget(repo)}
                        >
                          Hapus
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
        <Modal wide title="Detail Repository" onClose={() => setSelected(null)}>
          <RepoDetail repo={selected} />
        </Modal>
      )}

      {edit && (
        <Modal title="Edit Repository" onClose={() => setEdit(null)}>
          <form onSubmit={saveEdit} className="space-y-3">
            <label className="label">Judul</label>
            <input
              className="input"
              value={edit.title || ''}
              onChange={(e) => setEdit({ ...edit, title: e.target.value })}
            />

            <label className="label">Tanggal Tugas Akhir</label>
            <input
              className="input"
              type="date"
              value={(edit.research_date || '').slice(0, 10)}
              onChange={(e) =>
                setEdit({ ...edit, research_date: e.target.value })
              }
            />

            <label className="label">Status</label>
            <select
              className="input"
              value={edit.status}
              onChange={(e) => setEdit({ ...edit, status: e.target.value })}
            >
              <option value="draft">Draft</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Terverifikasi</option>
              <option value="revision">Revisi</option>
              <option value="rejected">Ditolak</option>
            </select>

            <label className="label">Kategori</label>
            <select
              className="input"
              value={edit.category_id || ''}
              onChange={(e) =>
                setEdit({ ...edit, category_id: e.target.value })
              }
            >
              <option value="">Tanpa Kategori</option>
              {categories.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <label className="label">Abstrak</label>
            <textarea
              className="input min-h-28"
              value={edit.abstract || ''}
              onChange={(e) => setEdit({ ...edit, abstract: e.target.value })}
            />

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setEdit(null)}
              >
                Batal
              </button>

              <button className="btn-primary">Simpan</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal
          title="Hapus Repository"
          onClose={() => {
            if (!deleteLoading) setDeleteTarget(null);
          }}
        >
          <div className="space-y-4">
            <p className="text-sm leading-6 text-gray-600">
              Apakah kamu yakin ingin menghapus repository ini? Data yang sudah
              dihapus tidak dapat dikembalikan.
            </p>

            <div className="rounded-2xl border border-outline/40 bg-gray-50 p-4">
              <p className="text-sm font-bold text-gray-900">
                {deleteTarget.title}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {deleteTarget.author_name || deleteTarget.submitter_name || '-'}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                className="btn-secondary"
                disabled={deleteLoading}
                onClick={() => setDeleteTarget(null)}
              >
                Batal
              </button>

              <button
                type="button"
                className="btn-danger"
                disabled={deleteLoading}
                onClick={confirmDelete}
              >
                {deleteLoading ? 'Menghapus...' : 'Hapus Repository'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function RepoDetail({ repo }) {
  const url = repo.file_path ? api.fileUrl(repo.file_path) : null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-extrabold">{repo.title}</h3>

      <div className="grid sm:grid-cols-2 gap-3">
        <Info label="Mahasiswa" value={repo.author_name || repo.submitter_name || '-'} />
        <Info label="Dosen Pembimbing" value={repo.advisor || '-'} />
        <Info label="Tanggal" value={formatDate(repo.research_date)} />
        <Info label="Status" value={statusLabel(repo.status)} />
      </div>

      <p className="text-sm leading-7 text-gray-600 whitespace-pre-line">
        {repo.abstract || '-'}
      </p>

      <div className="rounded-2xl bg-gray-50 border border-outline/40 p-4 flex justify-between items-center">
        <div>
          <p className="font-bold">Dokumen</p>
          <p className="text-sm text-gray-500">
            {repo.file_name || 'Belum ada file'}
          </p>
        </div>

        {url && (
          <a className="btn-primary" href={url} target="_blank" rel="noreferrer">
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
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold mt-1">{value}</p>
    </div>
  );
}