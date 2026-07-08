import { useEffect, useState } from 'react';
import { api } from '../../api';
import { getErrorMessage } from '../../utils/helpers';

const initialForm = {
  title: '', abstract: '', research_date: '', advisor: '', author_name: '', category_id: '', document: null,
};

export default function UploadRepo() {
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data || [])).catch((err) => setError(err.message));
  }, []);

  function update(key, value) { setForm((prev) => ({ ...prev, [key]: value })); }

  function buildData() {
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'document') return;
      if (value !== null && value !== undefined) data.append(key, value);
    });
    data.append('save_as_draft', 'false');
    if (form.document) data.append('document', form.document);
    return data;
  }

  async function submit() {
    try {
      setLoading(true); setError(''); setMessage('');
      const res = await api.post('/repositories', buildData());
      setMessage(res.message || 'Tugas Akhir berhasil dikirim untuk verifikasi.');
      setForm(initialForm);
      const fileInput = document.getElementById('document');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setError(getErrorMessage(err));
    } finally { setLoading(false); }
  }

  function handleSubmit(e) { e.preventDefault(); submit(); }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="rounded-3xl bg-white border border-outline/50 p-5 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><span className="material-symbols-rounded">info</span></div>
        <div><h2 className="font-extrabold text-lg">Form Upload Tugas Akhir</h2><p className="text-sm text-gray-500 leading-6 mt-1">Field bertanda <span className="text-red-500 font-bold">*</span> wajib diisi. Data yang dikirim akan masuk ke admin untuk proses verifikasi.</p></div>
      </div>
      {message && <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 flex gap-2"><span className="material-symbols-rounded">check_circle</span>{message}</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex gap-2"><span className="material-symbols-rounded">error</span>{error}</div>}
      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><label className="label">Judul Tugas Akhir <span className="text-red-500">*</span></label><input className="input" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Masukkan judul Tugas Akhir" /></div>
          <div><label className="label">Tanggal Tugas Akhir <span className="text-red-500">*</span></label><input type="date" className="input" value={form.research_date} onChange={(e) => update('research_date', e.target.value)} /></div>
          <div><label className="label">Kategori</label><select className="input" value={form.category_id} onChange={(e) => update('category_id', e.target.value)}><option value="">Otomatis berdasarkan keyword / pilih kategori</option>{categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></div>
          <div><label className="label">Nama Mahasiswa/Penulis <span className="text-red-500">*</span></label><input className="input" value={form.author_name} onChange={(e) => update('author_name', e.target.value)} placeholder="Nama lengkap penulis" /></div>
          <div><label className="label">Dosen Pembimbing <span className="text-red-500">*</span></label><input className="input" value={form.advisor} onChange={(e) => update('advisor', e.target.value)} placeholder="Nama dosen pembimbing" /></div>
          <div className="md:col-span-2"><label className="label">Abstrak <span className="text-red-500">*</span></label><textarea className="input min-h-32" value={form.abstract} onChange={(e) => update('abstract', e.target.value)} placeholder="Tuliskan abstrak Tugas Akhir" /></div>
          <div className="md:col-span-2"><label className="label">Dokumen Tugas Akhir PDF <span className="text-red-500">*</span></label><input id="document" type="file" accept="application/pdf" className="input file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white" onChange={(e) => update('document', e.target.files?.[0] || null)} /><p className="text-xs text-gray-400 mt-1">Format PDF, maksimal 10 MB.</p></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-end border-t border-outline/40 pt-5">
          <button type="submit" disabled={loading} className="btn-primary justify-center"><span className={`material-symbols-rounded text-[18px] ${loading ? 'animate-spin' : ''}`}>{loading ? 'refresh' : 'send'}</span>Kirim untuk Verifikasi</button>
        </div>
      </form>
    </div>
  );
}
