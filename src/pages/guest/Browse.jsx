import { useState } from 'react';
import { repoList, kategoriList } from '../../utils/dummyData';
import { truncate, similarityColor } from '../../utils/helpers';

export default function GuestBrowse() {
  const [search, setSearch] = useState('');
  const [kat, setKat]       = useState('Semua');

  const filtered = repoList.filter(r => {
    const matchSearch = r.judul.toLowerCase().includes(search.toLowerCase());
    const matchKat    = kat === 'Semua' || r.kategori === kat;
    return matchSearch && matchKat && r.status === 'Terverifikasi';
  });

  const kats = ['Semua', ...kategoriList.map(k => k.nama)];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Repositori Tugas Akhir</h1>
        <p className="text-sm text-gray-400 mt-1">
          Jelajahi koleksi tugas akhir yang telah terverifikasi
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-lg">
        <span className="material-symbols-rounded absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-gray-400">search</span>
        <input className="input pl-11 py-3 text-sm" placeholder="Cari judul tugas akhir..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {kats.slice(0, 6).map((k) => (
          <button key={k} onClick={() => setKat(k)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
              kat === k ? 'bg-primary text-white' : 'bg-white text-gray-500 border border-outline/50 hover:border-primary/50 hover:text-primary'
            }`}>
            {k}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-3 text-center py-16 text-gray-400">
            <span className="material-symbols-rounded text-[48px] mb-2 block">search_off</span>
            Tidak ada repositori yang ditemukan
          </div>
        ) : filtered.map((r) => (
          <div key={r.id} className="card hover:shadow-md transition cursor-pointer group">
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className="badge badge-info">{r.kategori}</span>
              <span className="text-xs text-gray-400">{r.tahun}</span>
            </div>
            <h3 className="text-sm font-semibold text-on-surface group-hover:text-primary transition leading-snug mb-2">
              {truncate(r.judul, 65)}
            </h3>
            <div className="flex items-center gap-2 mt-auto pt-3 border-t border-outline/30">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-rounded text-primary text-[13px]">person</span>
              </div>
              <p className="text-xs text-gray-400 truncate flex-1">{r.nama}</p>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${similarityColor(r.similarity)}`}>
                {r.similarity}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
