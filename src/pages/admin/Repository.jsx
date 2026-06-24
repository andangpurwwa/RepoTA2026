import { useState } from 'react';
import { repoList } from '../../utils/dummyData';
import { statusBadge, similarityColor, truncate } from '../../utils/helpers';

export default function ManajemenRepo() {
  const [search, setSearch] = useState('');

  const filtered = repoList.filter(r =>
    r.judul.toLowerCase().includes(search.toLowerCase()) ||
    r.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Search + actions */}
      <div className="card flex gap-3 items-center">
        <div className="relative flex-1">
          <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">search</span>
          <input className="input pl-9" placeholder="Cari repositori, nama, NIM..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="btn-secondary shrink-0">
          <span className="material-symbols-rounded text-[16px]">filter_list</span> Filter
        </button>
        <button className="btn-primary shrink-0">
          <span className="material-symbols-rounded text-[16px]">download</span> Ekspor
        </button>
      </div>

      {/* Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold">Semua Repositori</p>
          <span className="badge badge-info">{filtered.length} item</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">#</th>
                <th className="table-th">Judul</th>
                <th className="table-th">Mahasiswa</th>
                <th className="table-th">Tahun</th>
                <th className="table-th">Similaritas</th>
                <th className="table-th">Status</th>
                <th className="table-th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} className="table-row">
                  <td className="table-td text-xs text-gray-400">{i+1}</td>
                  <td className="table-td max-w-[200px]">
                    <p className="font-medium text-sm">{truncate(r.judul, 42)}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{r.kategori}</p>
                  </td>
                  <td className="table-td">
                    <p className="text-xs font-medium">{r.nama}</p>
                    <p className="text-[10px] text-gray-400">{r.nim}</p>
                  </td>
                  <td className="table-td text-xs">{r.tahun}</td>
                  <td className="table-td">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${similarityColor(r.similarity)}`}>
                      {r.similarity}%
                    </span>
                  </td>
                  <td className="table-td"><span className={statusBadge(r.status)}>{r.status}</span></td>
                  <td className="table-td">
                    <div className="flex gap-1.5">
                      <button className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center" title="Lihat">
                        <span className="material-symbols-rounded text-blue-600 text-[16px]">visibility</span>
                      </button>
                      <button className="w-7 h-7 rounded-lg bg-yellow-50 hover:bg-yellow-100 flex items-center justify-center" title="Edit">
                        <span className="material-symbols-rounded text-yellow-600 text-[16px]">edit</span>
                      </button>
                      <button className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center" title="Hapus">
                        <span className="material-symbols-rounded text-red-600 text-[16px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
