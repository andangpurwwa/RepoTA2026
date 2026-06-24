import { useState } from 'react';
import { repoList } from '../../utils/dummyData';
import { statusBadge, similarityColor, truncate } from '../../utils/helpers';

const statusOptions = ['Semua', 'Terverifikasi', 'Menunggu', 'Revisi'];

export default function HistoryMahasiswa() {
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('Semua');
  const [selected, setSelected] = useState(null);

  const filtered = repoList.filter((r) => {
    const matchSearch = r.judul.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === 'Semua' || r.status === status;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="card flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">search</span>
          <input className="input pl-9" placeholder="Cari judul..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {statusOptions.map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition ${
                status === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-primary/10 hover:text-primary'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold">Riwayat Pengajuan</p>
          <span className="badge badge-info">{filtered.length} dokumen</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">#</th>
                <th className="table-th">Judul</th>
                <th className="table-th">Kategori</th>
                <th className="table-th">Similaritas</th>
                <th className="table-th">Tanggal</th>
                <th className="table-th">Status</th>
                <th className="table-th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="table-td text-center text-gray-400 py-8">Tidak ada data</td></tr>
              ) : filtered.map((r, i) => (
                <tr key={r.id} className="table-row">
                  <td className="table-td text-gray-400 text-xs">{i + 1}</td>
                  <td className="table-td font-medium max-w-[200px]">{truncate(r.judul, 45)}</td>
                  <td className="table-td"><span className="badge badge-info">{r.kategori}</span></td>
                  <td className="table-td">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${similarityColor(r.similarity)}`}>
                      {r.similarity}%
                    </span>
                  </td>
                  <td className="table-td text-gray-400 text-xs">{r.tanggal}</td>
                  <td className="table-td"><span className={statusBadge(r.status)}>{r.status}</span></td>
                  <td className="table-td">
                    <button onClick={() => setSelected(r)}
                      className="text-primary hover:text-primary-600 text-xs font-medium hover:underline">
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-modal max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-sm">Detail Repositori</p>
              <button onClick={() => setSelected(null)}>
                <span className="material-symbols-rounded text-[20px] text-gray-400 hover:text-gray-600">close</span>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="label">Judul</p>
                <p className="text-sm font-medium">{selected.judul}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="label">NIM</p><p className="text-sm">{selected.nim}</p></div>
                <div><p className="label">Tahun</p><p className="text-sm">{selected.tahun}</p></div>
                <div><p className="label">Kategori</p><span className="badge badge-info text-xs">{selected.kategori}</span></div>
                <div>
                  <p className="label">Similaritas</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${similarityColor(selected.similarity)}`}>
                    {selected.similarity}%
                  </span>
                </div>
              </div>
              <div><p className="label">Status</p><span className={statusBadge(selected.status)}>{selected.status}</span></div>
            </div>
            <div className="flex gap-2 mt-5">
              <button className="btn-secondary flex-1 justify-center">
                <span className="material-symbols-rounded text-[16px]">download</span> Unduh
              </button>
              <button onClick={() => setSelected(null)} className="btn-ghost flex-1 justify-center">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
