import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/State';
import { formatDate, statusClass, statusLabel, truncate } from '../../utils/helpers';

export default function HistoryUpload() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/repositories/mine');
      setItems((res.data || []).filter((item) => item.status !== 'draft'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-5">
      {error && <ErrorState message={error} onRetry={load} />}
      {loading ? <LoadingState /> : items.length === 0 ? (
        <EmptyState icon="history" title="Riwayat belum ada" description="Upload Tugas Akhir kamu akan tampil di sini setelah dikirim." />
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
                {items.map((item) => (
                  <tr key={item.id} className="table-row">
                    <td className="table-td font-semibold max-w-[360px]">{truncate(item.title, 75)}</td>
                    <td className="table-td text-gray-500">{item.category_name || '-'}</td>
                    <td className="table-td"><span className={statusClass(item.status)}>{statusLabel(item.status)}</span></td>
                    <td className="table-td text-gray-500">{formatDate(item.research_date || item.created_at)}</td>
                    <td className="table-td"><div className="flex justify-end gap-2"><Link className="btn-secondary py-1.5 text-xs" to={`/mahasiswa/repository/${item.id}`}>Detail</Link></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
