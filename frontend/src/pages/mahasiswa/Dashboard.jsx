import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../auth';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/State';
import { formatDate, statusClass, statusLabel, truncate } from '../../utils/helpers';

export default function DashboardMahasiswa() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [latest, setLatest] = useState([]);
  const [mine, setMine] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');
      const [repoRes, mineRes] = await Promise.all([api.get('/repositories'), api.get('/repositories/mine')]);
      setLatest((repoRes.data || []).slice(0, 5));
      setMine((mineRes.data || []).slice(0, 6));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const filtered = latest.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()));
  const goSearch = (e) => {
    e?.preventDefault();
    navigate(`/mahasiswa/repository${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''}`);
  };

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <section className="rounded-3xl bg-gradient-to-br from-primary to-tertiary-700 text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -right-14 -top-14 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />
        <div className="relative z-10 grid lg:grid-cols-[1fr_0.75fr] gap-6 items-center">
          <div>
            <p className="text-white/65 text-sm font-semibold">Halo, {user?.name || 'Mahasiswa SI'}</p>
            <h1 className="text-2xl sm:text-4xl font-extrabold mt-2">Cari referensi dan ajukan Tugas Akhir dengan lebih terstruktur.</h1>
            <p className="text-white/70 mt-3 leading-7">Dashboard ini fokus pada pencarian repository, similarity check judul, dan riwayat upload Tugas Akhir kamu.</p>
          </div>
          <form onSubmit={goSearch} className="relative z-20 rounded-3xl bg-white/10 border border-white/10 p-4">
            <label className="text-xs font-semibold text-white/70">Cari Judul Tugas Akhir</label>
            <div className="relative mt-2">
              <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">search</span>
              <input className="input pl-10 bg-white text-slate-950 placeholder:text-slate-800 placeholder:font-semibold font-semibold" placeholder="Ketik judul, topik, atau kata kunci Tugas Akhir..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button type="submit" className="btn bg-white text-primary hover:bg-white/90 mt-3 w-full justify-center"><span className="material-symbols-rounded text-[18px]">manage_search</span>Buka Pencarian Lengkap</button>
          </form>
        </div>
      </section>
      {error && <ErrorState message={error} onRetry={load} />}
      {loading ? <LoadingState /> : (
        <div className="grid xl:grid-cols-[1fr_0.95fr] gap-6">
          <section className="card">
            <div className="flex items-center justify-between mb-4"><div><h2 className="font-extrabold text-lg">Judul Tugas Akhir Terbaru</h2><p className="text-sm text-gray-500">Repository terverifikasi sebagai referensi penelitian.</p></div><Link className="text-sm font-semibold text-primary" to="/mahasiswa/repository">Lihat semua</Link></div>
            {filtered.length === 0 ? <EmptyState icon="search_off" title="Judul tidak ditemukan" /> : <div className="space-y-3">{filtered.map((repo) => <Link to={`/mahasiswa/repository/${repo.id}`} key={repo.id} className="block rounded-2xl border border-outline/50 p-4 hover:border-primary/40 hover:bg-primary/[0.02]"><div className="flex items-start justify-between gap-3"><h3 className="font-bold leading-snug">{repo.title}</h3><span className="badge-info shrink-0">{repo.category_name || 'Kategori'}</span></div><p className="text-sm text-gray-500 mt-2">{truncate(repo.abstract, 110)}</p><p className="text-xs text-gray-400 mt-3">{formatDate(repo.research_date)} · {repo.author_name || 'Mahasiswa SI'}</p></Link>)}</div>}
          </section>
          <section className="card">
            <div className="flex items-center justify-between mb-4"><div><h2 className="font-extrabold text-lg">Riwayat Upload Tugas Akhir</h2><p className="text-sm text-gray-500">Status upload milik kamu.</p></div><Link className="text-sm font-semibold text-primary" to="/mahasiswa/history">Riwayat</Link></div>
            {mine.length === 0 ? <EmptyState icon="upload_file" title="Belum ada upload" description="Kirim Tugas Akhir kamu agar dapat diverifikasi oleh admin prodi." /> : <div className="overflow-x-auto"><table className="w-full"><thead><tr><th className="table-th rounded-tl-xl">Judul</th><th className="table-th">Status</th><th className="table-th rounded-tr-xl">Tanggal</th></tr></thead><tbody>{mine.map((repo) => <tr className="table-row" key={repo.id}><td className="table-td font-semibold max-w-[260px]">{truncate(repo.title, 60)}</td><td className="table-td"><span className={statusClass(repo.status)}>{statusLabel(repo.status)}</span></td><td className="table-td text-gray-500">{formatDate(repo.research_date || repo.created_at)}</td></tr>)}</tbody></table></div>}
          </section>
        </div>
      )}
    </div>
  );
}
