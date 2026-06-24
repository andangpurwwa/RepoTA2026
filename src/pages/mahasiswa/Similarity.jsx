import { useState } from 'react';
import { similarityColor } from '../../utils/helpers';

const dummyResult = {
  overall: 14,
  segments: [
    { section: 'Bab I — Pendahuluan',      pct: 8,  status: 'Aman' },
    { section: 'Bab II — Tinjauan Pustaka', pct: 22, status: 'Perhatian' },
    { section: 'Bab III — Metodologi',     pct: 11, status: 'Aman' },
    { section: 'Bab IV — Hasil & Pembahasan', pct: 5, status: 'Aman' },
    { section: 'Bab V — Penutup',           pct: 3,  status: 'Aman' },
  ],
  matches: [
    { source: 'Skripsi 2022 — Ahmad Fauzi', url: '#', pct: 7 },
    { source: 'Jurnal IJCS Vol.4 2021',     url: '#', pct: 4 },
    { source: 'Skripsi 2023 — Lina Wati',   url: '#', pct: 3 },
  ],
};

export default function SimilarityCheck() {
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  function handleFile(e) { setFile(e.target.files[0]); }

  function handleCheck() {
    if (!file) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setResult(dummyResult); }, 1800);
  }

  const pctColor = (p) => similarityColor(p);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Upload card */}
      <div className="card">
        <p className="text-sm font-semibold mb-1">Unggah Dokumen untuk Diperiksa</p>
        <p className="text-xs text-gray-400 mb-4">Format PDF · Maks 10 MB</p>

        <div
          onClick={() => document.getElementById('sim-input').click()}
          className="border-2 border-dashed border-outline/60 rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/[0.02] transition"
        >
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <span className="material-symbols-rounded icon-filled text-red-500 text-[28px]">picture_as_pdf</span>
              <p className="text-sm font-medium">{file.name}</p>
              <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}
                className="text-gray-400 hover:text-red-500">
                <span className="material-symbols-rounded text-[18px]">close</span>
              </button>
            </div>
          ) : (
            <>
              <span className="material-symbols-rounded text-gray-300 text-[40px]">description</span>
              <p className="text-sm text-gray-400 mt-2">Klik atau drag dokumen PDF</p>
            </>
          )}
        </div>
        <input id="sim-input" type="file" accept=".pdf" className="hidden" onChange={handleFile} />

        <button
          disabled={!file || loading}
          onClick={handleCheck}
          className="btn-primary mt-4 w-full justify-center py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? <><span className="material-symbols-rounded text-[18px] animate-spin">refresh</span> Menganalisis...</>
            : <><span className="material-symbols-rounded text-[18px]">manage_search</span> Periksa Similaritas</>
          }
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Overall score */}
          <div className="card flex items-center gap-5">
            <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center shrink-0 ${pctColor(result.overall)}`}>
              <p className="text-2xl font-bold">{result.overall}%</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Skor Similaritas Keseluruhan</p>
              <p className={`text-xs font-medium mt-0.5 ${pctColor(result.overall).split(' ')[0]}`}>
                {result.overall <= 15 ? '✓ Aman — di bawah batas 20%' :
                 result.overall <= 30 ? '⚠ Perhatian — mendekati batas' :
                 '✗ Melebihi batas — perlu revisi'}
              </p>
              <p className="text-xs text-gray-400 mt-1">Dianalisis dari {result.segments.length} bagian dokumen</p>
            </div>
          </div>

          {/* Per-section */}
          <div className="card">
            <p className="text-sm font-semibold mb-3">Detail per Bagian</p>
            <div className="space-y-3">
              {result.segments.map((s) => (
                <div key={s.section}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium">{s.section}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pctColor(s.pct)}`}>{s.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${s.pct <= 15 ? 'bg-green-500' : s.pct <= 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Matched sources */}
          <div className="card">
            <p className="text-sm font-semibold mb-3">Sumber yang Cocok</p>
            <div className="space-y-2">
              {result.matches.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-rounded text-[18px] text-gray-400 shrink-0">article</span>
                    <p className="text-xs text-on-surface truncate">{m.source}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ml-3 ${pctColor(m.pct)}`}>{m.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
