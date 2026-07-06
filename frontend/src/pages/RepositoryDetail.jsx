import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/State';
import { formatDate, statusClass, statusLabel } from '../utils/helpers';

export default function RepositoryDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/repositories/${id}`);
      setRepo(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  if (loading) return <div className="max-w-5xl mx-auto p-4 sm:p-6"><LoadingState /></div>;
  if (error) return <div className="max-w-5xl mx-auto p-4 sm:p-6"><ErrorState message={error} onRetry={load} /></div>;
  if (!repo) return <div className="max-w-5xl mx-auto p-4 sm:p-6"><EmptyState /></div>;

  const isGuest = !user;
  const backTo = user?.role === 'admin' ? '/admin/repository' : user?.role === 'mahasiswa' ? '/mahasiswa/repository' : '/guest';
  const downloadUrl = repo.file_path ? api.fileUrl(repo.file_path) : null;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
      <Link to={backTo} className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-primary"><span className="material-symbols-rounded text-[18px]">arrow_back</span>Kembali</Link>
      <article className="card p-6 sm:p-8 rounded-3xl">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <span className="badge-info">{repo.category_name || 'Tanpa Kategori'}</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight mt-4">{repo.title}</h1>
          </div>
          <span className={statusClass(repo.status)}>{statusLabel(repo.status)}</span>
        </div>
        <div className="grid md:grid-cols-2 gap-3 mt-6">
          <Info label="Mahasiswa" value={repo.author_name || repo.submitter_name || 'Mahasiswa SI'} icon="person" />
          <Info label="Tanggal Tugas Akhir" value={formatDate(repo.research_date)} icon="event" />
        </div>
        {!isGuest && <div className="grid md:grid-cols-2 gap-3 mt-3"><Info label="Dosen Pembimbing" value={repo.advisor || '-'} icon="supervisor_account" /><Info label="Pengunggah" value={repo.submitter_name || '-'} icon="upload_file" /></div>}
        <section className="mt-7">
          <h2 className="font-bold text-on-surface mb-2">Abstrak</h2>
          <p className="text-sm leading-7 text-gray-600 whitespace-pre-line">{repo.abstract || 'Abstrak belum tersedia.'}</p>
        </section>
        <section className="mt-7 rounded-2xl border border-outline/50 bg-gray-50 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-bold text-on-surface">Dokumen Tugas Akhir</h3>
              <p className="text-sm text-gray-500 mt-1">{isGuest ? 'Login sebagai mahasiswa atau admin untuk membuka dokumen lengkap.' : (repo.file_name || 'Belum ada dokumen yang diunggah.')}</p>
            </div>
            {downloadUrl && !isGuest ? <a href={downloadUrl} target="_blank" rel="noreferrer" className="btn-primary"><span className="material-symbols-rounded text-[18px]">download</span>Buka Dokumen</a> : isGuest ? <Link to="/login" className="btn-secondary"><span className="material-symbols-rounded text-[18px]">lock</span>Login</Link> : null}
          </div>
        </section>
        {repo.rejection_note && <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700"><b>Catatan Admin:</b> {repo.rejection_note}</section>}
      </article>
    </div>
  );
}

function Info({ label, value, icon }) {
  return <div className="rounded-2xl bg-gray-50 border border-outline/40 p-4"><div className="flex items-center gap-2 text-xs text-gray-500"><span className="material-symbols-rounded text-[18px] text-primary">{icon}</span>{label}</div><p className="mt-1 font-semibold text-on-surface">{value}</p></div>;
}
