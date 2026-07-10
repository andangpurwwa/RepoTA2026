import { useEffect, useState } from 'react';
import { api } from '../../api';
import { useAuth } from '../../auth';
import Toast from '../../components/ui/Toast';
import { countWords, getErrorMessage } from '../../utils/helpers';

const TITLE_MIN_WORDS = 5;
const ABSTRACT_MIN_WORDS = 100;

const initialForm = {
  title: '',
  abstract: '',
  research_date: '',
  advisor: '',
  category_id: '',
  document: null,
};

export default function UploadRepo() {
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(res.data || []))
      .catch((err) => setError(err.message));
  }, []);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const titleWordCount = countWords(form.title);
  const abstractWordCount = countWords(form.abstract);

  function validate() {
    if (titleWordCount < TITLE_MIN_WORDS) {
      return `Judul Tugas Akhir minimal ${TITLE_MIN_WORDS} kata.`;
    }

    if (!form.research_date) {
      return 'Tanggal Tugas Akhir wajib diisi.';
    }

    if (!form.advisor.trim()) {
      return 'Dosen pembimbing wajib diisi.';
    }

    if (abstractWordCount < ABSTRACT_MIN_WORDS) {
      return `Abstrak minimal ${ABSTRACT_MIN_WORDS} kata.`;
    }

    if (!form.document) {
      return 'Dokumen PDF wajib diunggah.';
    }

    if (form.document.type !== 'application/pdf') {
      return 'Dokumen harus berformat PDF.';
    }

    if (form.document.size > 10 * 1024 * 1024) {
      return 'Ukuran file maksimal 10 MB.';
    }

    return '';
  }

  function buildData() {
    const data = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (key === 'document') return;

      if (value !== null && value !== undefined) {
        data.append(key, value);
      }
    });

    // Data pengunggah tetap otomatis dikirim ke backend,
    // tetapi tidak ditampilkan di halaman.
    data.append('author_name', user?.name || '');
    data.append('nim', user?.nim || '');
    data.append('email_uad', user?.email || '');
    data.append('save_as_draft', 'false');

    if (form.document) {
      data.append('document', form.document);
    }

    return data;
  }

  async function submit() {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const res = await api.post('/repositories', buildData());

      setMessage(res.message || 'Tugas Akhir berhasil dikirim untuk verifikasi.');
      setForm(initialForm);

      const fileInput = document.getElementById('document');

      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    submit();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="rounded-3xl bg-white border border-outline/50 p-5 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <span className="material-symbols-rounded">info</span>
        </div>

        <div>
          <h2 className="font-extrabold text-lg">
            Form Upload Tugas Akhir
          </h2>

          <p className="text-sm text-gray-500 leading-6 mt-1">
            Field bertanda <span className="text-red-500 font-bold">*</span>{' '}
            wajib diisi. Data pengunggah otomatis mengikuti akun mahasiswa yang
            sedang login.
          </p>
        </div>
      </div>

      {message && (
        <Toast message={message} onClose={() => setMessage('')} />
      )}

      {error && (
        <Toast
          type="error"
          message={error}
          onClose={() => setError('')}
        />
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">
              Judul Tugas Akhir <span className="text-red-500">*</span>
              <span className="ml-2 text-xs font-medium text-gray-400">
                minimal {TITLE_MIN_WORDS} kata
              </span>
            </label>

            <input
              className="input"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder={`Masukkan judul Tugas Akhir minimal ${TITLE_MIN_WORDS} kata`}
              maxLength={250}
            />

            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-gray-400">Tuliskan judul yang spesifik dan mudah dipahami.</span>
              <span className={titleWordCount >= TITLE_MIN_WORDS ? 'font-semibold text-emerald-600' : 'font-semibold text-amber-600'}>
                {titleWordCount}/{TITLE_MIN_WORDS} kata
              </span>
            </div>
          </div>

          <div>
            <label className="label">
              Tanggal Tugas Akhir <span className="text-red-500">*</span>
            </label>

            <input
              type="date"
              className="input"
              value={form.research_date}
              onChange={(e) => update('research_date', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Kategori</label>

            <select
              className="input"
              value={form.category_id}
              onChange={(e) => update('category_id', e.target.value)}
            >
              <option value="">
                Otomatis berdasarkan keyword / pilih kategori
              </option>

              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="label">
              Dosen Pembimbing <span className="text-red-500">*</span>
            </label>

            <input
              className="input"
              value={form.advisor}
              onChange={(e) => update('advisor', e.target.value)}
              placeholder="Nama dosen pembimbing"
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">
              Abstrak <span className="text-red-500">*</span>
              <span className="ml-2 text-xs font-medium text-gray-400">
                minimal {ABSTRACT_MIN_WORDS} kata
              </span>
            </label>

            <textarea
              className="input min-h-32"
              value={form.abstract}
              onChange={(e) => update('abstract', e.target.value)}
              placeholder={`Tuliskan abstrak Tugas Akhir minimal ${ABSTRACT_MIN_WORDS} kata`}
            />

            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-gray-400">Ringkas latar belakang, tujuan, metode, hasil, dan kesimpulan.</span>
              <span className={abstractWordCount >= ABSTRACT_MIN_WORDS ? 'font-semibold text-emerald-600' : 'font-semibold text-amber-600'}>
                {abstractWordCount}/{ABSTRACT_MIN_WORDS} kata
              </span>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="label">
              Dokumen Tugas Akhir PDF{' '}
              <span className="text-red-500">*</span>
            </label>

            <input
              id="document"
              type="file"
              accept="application/pdf"
              className="input file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white"
              onChange={(e) =>
                update('document', e.target.files?.[0] || null)
              }
            />

            <p className="text-xs text-gray-400 mt-1">
              Format PDF, maksimal 10 MB.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end border-t border-outline/40 pt-5">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary justify-center"
          >
            <span
              className={`material-symbols-rounded text-[18px] ${
                loading ? 'animate-spin' : ''
              }`}
            >
              {loading ? 'refresh' : 'send'}
            </span>
            {loading ? 'Mengirim...' : 'Kirim untuk Verifikasi'}
          </button>
        </div>
      </form>
    </div>
  );
}