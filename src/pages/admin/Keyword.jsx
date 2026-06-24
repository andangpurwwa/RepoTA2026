import { useState } from 'react';
import { keywordList } from '../../utils/dummyData';

export default function Keyword() {
  const [items, setItems]   = useState(keywordList);
  const [newKw, setNewKw]   = useState('');
  const [showForm, setForm] = useState(false);

  function handleAdd() {
    if (!newKw.trim()) return;
    setItems([...items, { id: Date.now(), kata: newKw, frekuensi: 0 }]);
    setNewKw(''); setForm(false);
  }

  const sorted = [...items].sort((a, b) => b.frekuensi - a.frekuensi);
  const maxFreq = Math.max(...items.map(k => k.frekuensi));

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">Total: {items.length} keyword</p>
        <button onClick={() => setForm(true)} className="btn-primary">
          <span className="material-symbols-rounded text-[16px]">add</span> Tambah Keyword
        </button>
      </div>

      {showForm && (
        <div className="card border border-primary/20">
          <p className="text-sm font-semibold mb-3">Keyword Baru</p>
          <div className="flex gap-2">
            <input className="input flex-1" placeholder="Kata kunci..." value={newKw}
              onChange={(e) => setNewKw(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
            <button onClick={handleAdd} className="btn-primary px-5">Simpan</button>
            <button onClick={() => { setForm(false); setNewKw(''); }} className="btn-ghost">Batal</button>
          </div>
        </div>
      )}

      {/* Keyword cards dengan bar frekuensi */}
      <div className="card">
        <p className="text-sm font-semibold mb-4">Keyword Populer</p>
        <div className="space-y-3">
          {sorted.map((k) => (
            <div key={k.id} className="flex items-center gap-3 group">
              <div className="w-32 shrink-0">
                <p className="text-xs font-medium truncate">{k.kata}</p>
              </div>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(k.frekuensi / maxFreq) * 100}%` }} />
              </div>
              <span className="text-xs font-semibold text-primary w-10 text-right shrink-0">
                {k.frekuensi}
              </span>
              <button onClick={() => setItems(items.filter(i => i.id !== k.id))}
                className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md bg-red-50 hover:bg-red-100 flex items-center justify-center transition">
                <span className="material-symbols-rounded text-red-500 text-[14px]">close</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tag cloud */}
      <div className="card">
        <p className="text-sm font-semibold mb-3">Tag Cloud</p>
        <div className="flex flex-wrap gap-2">
          {items.map((k) => (
            <span key={k.id}
              style={{ fontSize: `${Math.max(10, Math.min(18, 10 + (k.frekuensi / maxFreq) * 8))}px` }}
              className="px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium cursor-default hover:bg-primary hover:text-white transition">
              {k.kata}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
