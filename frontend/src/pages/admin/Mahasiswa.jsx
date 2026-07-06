import { useEffect, useState } from 'react';
import { api } from '../../api';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/State';
import { formatDate } from '../../utils/helpers';

export default function MahasiswaAdmin() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function load() { try { setLoading(true); setError(''); const query = search ? `?search=${encodeURIComponent(search)}` : ''; const res = await api.get(`/users/students${query}`); setStudents(res.data || []); } catch (err) { setError(err.message); } finally { setLoading(false); } }
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [search]);
  return <div className="space-y-5"><div className="card"><div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"><div><h2 className="font-extrabold text-lg">Tabel Mahasiswa</h2><p className="text-sm text-gray-500">Menampilkan data mahasiswa dan status upload Tugas Akhir.</p></div><div className="relative md:w-80"><span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span><input className="input pl-10" placeholder="Cari nama, email, atau NIM" value={search} onChange={(e) => setSearch(e.target.value)} /></div></div></div>{error && <ErrorState message={error} onRetry={load} />}{loading ? <LoadingState /> : students.length === 0 ? <EmptyState icon="groups" title="Mahasiswa tidak ditemukan" /> : <div className="card p-0 overflow-hidden"><div className="overflow-x-auto"><table className="w-full"><thead><tr><th className="table-th">Mahasiswa</th><th className="table-th">Email</th><th className="table-th">Total Upload</th><th className="table-th">Pending</th><th className="table-th">Terverifikasi</th><th className="table-th">Upload Terakhir</th></tr></thead><tbody>{students.map((s) => <tr key={s.id} className="table-row"><td className="table-td"><p className="font-bold">{s.name}</p><p className="text-xs text-gray-400">{s.nim || '-'}</p></td><td className="table-td text-gray-500">{s.email}</td><td className="table-td font-bold">{s.total_upload}</td><td className="table-td">{s.total_pending}</td><td className="table-td">{s.total_approved}</td><td className="table-td text-gray-500">{formatDate(s.last_upload_at)}</td></tr>)}</tbody></table></div></div>}</div>;
}
