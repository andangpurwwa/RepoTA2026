import { useState } from 'react';
import { repoList } from '../../utils/dummyData';
import { statusBadge, similarityColor, truncate } from '../../utils/helpers';

export default function Verifikasi() {
  const [items, setItems] = useState(repoList);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('Semua');

  const tabs = ['Semua', 'Menunggu', 'Terverifikasi', 'Revisi'];

  const filtered = items.filter(r => activeTab === 'Semua' || r.status === activeTab);

  function handleAction(id, action) {
    const newStatus = action === 'terima' ? 'Terverifikasi' : action === 'revisi' ? 'Revisi' : 'Ditolak';
    setItems(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    setSelected(null);
  }

  return (
    <div className="space-y-5">
      {/* Tab filter */}
      <div className="card flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition ${
              activeTab === t ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-primary/10 hover:text-primary'
            }`}>
            {t}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
              activeTab === t ? 'bg-white/20 text-white' : 'bg-white text-gray-500'
            }`}>
              {t === 'Semua' ? items.length : items.filter(r => r.status === t).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">#</th>
                <th className="table-th">Judul</th>
                <th className="table-th">Mahasiswa</th>
                <th className="table-th">Similaritas</th>
                <th className="table-th">Tanggal</th>
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
                  <td className="table-td">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${similarityColor(r.similarity)}`}>
                      {r.similarity}%
                    </span>
                  </td>
                  <td className="table-td text-xs text-gray-400">{r.tanggal}</td>
                  <td className="table-td"><span className={statusBadge(r.status)}>{r.status}</span></td>
                  <td className="table-td">
                    <div className="flex gap-1.5">
                      <button onClick={() => setSelected(r)} title="Detail"
                        className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center">
                        <span className="material-symbols-rounded text-blue-600 text-[16px]">visibility</span>
                      </button>
                      {r.status === 'Menunggu' && (
                        <>
                          <button onClick={() => handleAction(r.id, 'terima')} title="Terima"
                            className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center">
                            <span className="material-symbols-rounded text-green-600 text-[16px]">check</span>
                          </button>
                          <button onClick={() => handleAction(r.id, 'revisi')} title="Minta Revisi"
                            className="w-7 h-7 rounded-lg bg-yellow-50 hover:bg-yellow-100 flex items-center justify-center">
                            <span className="material-symbols-rounded text-yellow-600 text-[16px]">edit_note</span>
                          </button>
                        </>
                      )}
                    </div>
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
                <span className="material-symbols-rounded text-[20px] text-gray-400">close</span>
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold">{selected.judul}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><p className="label">Mahasiswa</p><p className="font-medium">{selected.nama}</p></div>
                <div><p className="label">NIM</p><p>{selected.nim}</p></div>
                <div><p className="label">Kategori</p><span className="badge badge-info">{selected.kategori}</span></div>
                <div>
                  <p className="label">Similaritas</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${similarityColor(selected.similarity)}`}>
                    {selected.similarity}%
                  </span>
                </div>
              </div>
            </div>
            {selected.status === 'Menunggu' && (
              <div className="flex gap-2 mt-5">
                <button onClick={() => handleAction(selected.id, 'terima')} className="btn-primary flex-1 justify-center text-xs">
                  <span className="material-symbols-rounded text-[15px]">check_circle</span> Terima
                </button>
                <button onClick={() => handleAction(selected.id, 'revisi')} className="btn-secondary flex-1 justify-center text-xs">
                  <span className="material-symbols-rounded text-[15px]">edit_note</span> Revisi
                </button>
                <button onClick={() => handleAction(selected.id, 'tolak')} className="btn-danger flex-1 justify-center text-xs">
                  <span className="material-symbols-rounded text-[15px]">close</span> Tolak
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
