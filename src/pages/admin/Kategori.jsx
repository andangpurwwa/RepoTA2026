import { useState } from 'react';
import { kategoriList } from '../../utils/dummyData';

export default function Kategori() {
  const [items, setItems]     = useState(kategoriList);
  const [showForm, setForm]   = useState(false);
  const [newKat, setNewKat]   = useState('');

  function handleAdd() {
    if (!newKat.trim()) return;
    setItems([...items, { id: Date.now(), nama: newKat, jumlah: 0 }]);
    setNewKat(''); setForm(false);
  }

  function handleDelete(id) {
    setItems(items.filter(k => k.id !== id));
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Total: {items.length} kategori</p>
        </div>
        <button onClick={() => setForm(true)} className="btn-primary">
          <span className="material-symbols-rounded text-[16px]">add</span> Tambah Kategori
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card border border-primary/20">
          <p className="text-sm font-semibold mb-3">Kategori Baru</p>
          <div className="flex gap-2">
            <input className="input flex-1" placeholder="Nama kategori..." value={newKat}
              onChange={(e) => setNewKat(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
            <button onClick={handleAdd} className="btn-primary px-5">Simpan</button>
            <button onClick={() => { setForm(false); setNewKat(''); }} className="btn-ghost">Batal</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="card">
        <div className="space-y-2">
          {items.map((k) => (
            <div key={k.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 group transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-rounded text-primary text-[16px]">category</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{k.nama}</p>
                  <p className="text-[10px] text-gray-400">{k.jumlah} repositori</p>
                </div>
              </div>
              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
                <button className="w-7 h-7 rounded-lg bg-yellow-50 hover:bg-yellow-100 flex items-center justify-center">
                  <span className="material-symbols-rounded text-yellow-600 text-[15px]">edit</span>
                </button>
                <button onClick={() => handleDelete(k.id)}
                  className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center">
                  <span className="material-symbols-rounded text-red-600 text-[15px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
