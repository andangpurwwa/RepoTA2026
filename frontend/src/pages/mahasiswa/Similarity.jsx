import React, { useState } from 'react';
import { api } from '../../api';
import { similarityClass } from '../../utils/helpers';

export default function SimilarityCheck() {
  const [title, setTitle] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function check(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul usulan wajib diisi.');
      return;
    }
    try {
      setLoading(true); setError(''); setResult(null);
      const res = await api.post('/similarity/check', { title: title.trim() });
      setResult(res);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-16 lg:pb-0">
      <section className="rounded-3xl bg-white border border-outline/50 p-5 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><span className="material-symbols-rounded">manage_search</span></div>
        <div>
          <h2 className="font-extrabold text-lg">Cek Similarity Judul Realtime</h2>
          <p className="text-sm text-gray-500 leading-6 mt-1">Perhitungan dilakukan langsung secara realtime terhadap database RepoTA yang sudah terverifikasi. Hasil ini membantu mahasiswa mengecek kemiripan judul sebelum mengajukan Tugas Akhir.</p>
        </div>
      </section>
      <form onSubmit={check} className="card p-6 rounded-3xl">
        <label className="label">Usulan Judul Tugas Akhir <span className="text-red-500">*</span></label>
        <textarea className="input min-h-28" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Pengembangan Dashboard Repository Tugas Akhir Berbasis Web pada Program Studi Sistem Informasi" />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex justify-end">
          <button className="btn-primary justify-center" disabled={loading}><span className={`material-symbols-rounded text-[18px] ${loading ? 'animate-spin' : ''}`}>{loading ? 'refresh' : 'manage_search'}</span>{loading ? 'Mengecek...' : 'Cek Similarity RepoTA'}</button>
        </div>
      </form>
      {result && <section className="card p-6 rounded-3xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div><h2 className="text-xl font-extrabold">Hasil Analisis Kemiripan</h2><p className="text-sm text-gray-500 mt-1">Interpretasi sistem: {result.interpretation}</p></div>
          <span className={`rounded-2xl border px-4 py-2 text-lg font-extrabold ${similarityClass(result.top_score)}`}>{result.top_score}%</span>
        </div>
        <div className="space-y-3">
          {(result.data || []).map((item, index) => <div key={item.id} className="rounded-2xl border border-outline/50 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-gray-400">Peringkat #{index + 1} · {item.category_name || 'Tanpa kategori'}</p><h3 className="font-bold mt-1">{item.title}</h3></div><span className={`rounded-xl border px-3 py-1 text-sm font-bold ${similarityClass(item.similarity)}`}>{item.similarity}%</span></div><p className="mt-2 text-sm text-gray-500">{item.interpretation}</p></div>)}
        </div>
      </section>}
    </div>
  );
}
