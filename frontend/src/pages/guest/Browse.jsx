import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/State';
import { formatDate, truncate } from '../../utils/helpers';

const PAGE_SIZE = 15;

const sortOptions = [
  { value: 'latest', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
  { value: 'title', label: 'Judul A-Z' },
];

export default function GuestBrowse({ mode = 'guest' }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get('search') || '';
  const initialPage = Math.max(Number(searchParams.get('page')) || 1, 1);

  const [repos, setRepos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [heroSearch, setHeroSearch] = useState(initialSearch);

  const [filters, setFilters] = useState({
    search: initialSearch,
    category_id: searchParams.get('category_id') || '',
    date_from: searchParams.get('date_from') || '',
    date_to: searchParams.get('date_to') || '',
    sort: searchParams.get('sort') || 'latest',
  });

  const [page, setPage] = useState(initialPage);

  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function cleanObject(obj) {
    return Object.fromEntries(
      Object.entries(obj).filter(
        ([, value]) => value !== '' && value !== null && value !== undefined
      )
    );
  }

  function makeQuery() {
    return new URLSearchParams(
      cleanObject({
        ...filters,
        page,
        limit: PAGE_SIZE,
      })
    ).toString();
  }

  async function load() {
    try {
      setLoading(true);
      setError('');

      const query = makeQuery();
      const getRepositoryData = mode === 'guest' ? api.getPublic : api.get;

      const [repoRes, catRes] = await Promise.all([
        getRepositoryData(`/repositories${query ? `?${query}` : ''}`),
        api.getPublic('/categories'),
      ]);

      const repoData = repoRes.data || [];
      const catData = catRes.data || [];
      const pageInfo = repoRes.pagination || {};

      setRepos(repoData);
      setCategories(catData);

      setPagination({
        page: Number(pageInfo.page) || page,
        limit: Number(pageInfo.limit) || PAGE_SIZE,
        total: Number(pageInfo.total) || repoData.length,
        totalPages: Math.max(Number(pageInfo.totalPages) || 1, 1),
        hasPrevPage:
          typeof pageInfo.hasPrevPage === 'boolean'
            ? pageInfo.hasPrevPage
            : page > 1,
        hasNextPage:
          typeof pageInfo.hasNextPage === 'boolean'
            ? pageInfo.hasNextPage
            : page < (Number(pageInfo.totalPages) || 1),
      });
    } catch (err) {
      setError(err.message || 'Gagal mengambil data repository.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (window.location.hash) {
      setTimeout(() => {
        document
          .querySelector(window.location.hash)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams(
        cleanObject({
          ...filters,
          page,
          limit: PAGE_SIZE,
        }),
        { replace: true }
      );

      load();
    }, 300);

    return () => clearTimeout(timer);
  }, [
    filters.search,
    filters.category_id,
    filters.date_from,
    filters.date_to,
    filters.sort,
    page,
  ]);

  function updateFilter(key, value) {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }

  function searchFromHero(e) {
    e.preventDefault();

    const next = heroSearch.trim();
    updateFilter('search', next);

    if (mode === 'student') {
      navigate(
        `/mahasiswa/repository${
          next
            ? `?search=${encodeURIComponent(next)}&page=1&limit=${PAGE_SIZE}`
            : `?page=1&limit=${PAGE_SIZE}`
        }`
      );
    } else {
      setTimeout(() => {
        document
          .querySelector('#repository')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }

  function resetFilters() {
    setFilters({
      search: '',
      category_id: '',
      date_from: '',
      date_to: '',
      sort: 'latest',
    });
    setHeroSearch('');
    setPage(1);
  }

  function goToPage(nextPage) {
    const totalPages = pagination.totalPages || 1;
    const safePage = Math.min(Math.max(Number(nextPage) || 1, 1), totalPages);

    setPage(safePage);

    setTimeout(() => {
      document
        .querySelector('#repository')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  const categoryChips = useMemo(() => categories.slice(0, 10), [categories]);

  const pageNumbers = useMemo(() => {
    const totalPages = pagination.totalPages || 1;
    const maxButtons = 7;
    const start = Math.max(1, Math.min(page - 3, totalPages - maxButtons + 1));
    const end = Math.min(totalPages, start + maxButtons - 1);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [page, pagination.totalPages]);

  const basePath = mode === 'student' ? '/mahasiswa/repository' : '/guest/repository';

  return (
    <div
      className={
        mode === 'guest'
          ? 'max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8'
          : 'space-y-6'
      }
    >
      {mode === 'guest' && (
        <section className="rounded-[2rem] bg-gradient-to-br from-tertiary-700 to-primary text-white p-6 sm:p-10 overflow-hidden relative">
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -left-16 -bottom-20 w-80 h-80 rounded-full bg-white/10 pointer-events-none" />

          <div className="relative z-10 grid lg:grid-cols-[1fr_0.8fr] gap-8 items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold mb-4">
                <span className="material-symbols-rounded text-[16px]">
                  verified
                </span>
                Program Studi Sistem Informasi
              </span>

              <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
                Dashboard Repository & Analisis Tugas Akhir
              </h1>

              <p className="mt-4 text-white/75 text-base sm:text-lg leading-8">
                Temukan referensi Tugas Akhir yang sudah terverifikasi, telusuri
                kategori penelitian, dan akses fitur lengkap melalui akun mahasiswa
                atau admin.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/login"
                  className="btn bg-white text-primary hover:bg-white/90"
                >
                  <span className="material-symbols-rounded text-[18px]">
                    login
                  </span>
                  Masuk Sistem
                </Link>

                <a
                  href="#repository"
                  className="btn bg-white/10 text-white border border-white/20 hover:bg-white/15"
                >
                  <span className="material-symbols-rounded text-[18px]">
                    search
                  </span>
                  Cari Repository
                </a>
              </div>
            </div>

            <form
              onSubmit={searchFromHero}
              className="relative z-20 rounded-3xl bg-white/10 border border-white/15 p-5 backdrop-blur"
            >
              <label className="text-sm font-bold text-white/85">
                Cari Judul Tugas Akhir
              </label>

              <div className="relative mt-3">
                <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  search
                </span>

                <input
                  className="input pl-11 py-3 bg-white text-slate-950 placeholder:text-slate-700 relative z-10"
                  placeholder="Contoh: data mining, repository, IoT..."
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  autoComplete="off"
                />
              </div>

              <button
                className="btn bg-white text-primary hover:bg-white/90 mt-3 w-full justify-center"
                type="submit"
              >
                <span className="material-symbols-rounded text-[18px]">
                  manage_search
                </span>
                Cari Sekarang
              </button>
            </form>
          </div>
        </section>
      )}

      <section id="repository" className="space-y-5 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-on-surface">
              Cari Judul Tugas Akhir
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Data ditarik langsung dari backend dan hanya menampilkan repository
              terverifikasi.
            </p>
          </div>

          <div className="text-sm text-gray-500">
            <b className="text-primary">{pagination.total || repos.length}</b>{' '}
            repository ditemukan
          </div>
        </div>

        <div className="card space-y-4">
          <div className="grid lg:grid-cols-[1.4fr_0.9fr_0.55fr_0.55fr_0.55fr] gap-3">
            <div className="relative">
              <span className="material-symbols-rounded absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                search
              </span>

              <input
                className="input pl-11 relative z-10 text-slate-950 placeholder:text-slate-700"
                placeholder="Cari judul, kategori, dosen, atau nama mahasiswa..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                autoComplete="off"
              />
            </div>

            <select
              className="input"
              value={filters.category_id}
              onChange={(e) => updateFilter('category_id', e.target.value)}
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="input"
              value={filters.date_from}
              onChange={(e) => updateFilter('date_from', e.target.value)}
              title="Dari tanggal"
            />

            <input
              type="date"
              className="input"
              value={filters.date_to}
              onChange={(e) => updateFilter('date_to', e.target.value)}
              title="Sampai tanggal"
            />

            <select
              className="input"
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {categoryChips.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => updateFilter('category_id', String(cat.id))}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  String(filters.category_id) === String(cat.id)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-600 border-outline hover:border-primary/50'
                }`}
              >
                {cat.name}
              </button>
            ))}

            {(filters.search ||
              filters.category_id ||
              filters.date_from ||
              filters.date_to) && (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full border px-3 py-1.5 text-xs font-bold bg-red-50 text-red-600 border-red-100"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {error && <ErrorState message={error} onRetry={load} />}

        {loading ? (
          <LoadingState />
        ) : repos.length === 0 ? (
          <EmptyState
            icon="search_off"
            title="Repository tidak ditemukan"
            description="Coba gunakan kata kunci atau filter yang berbeda."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {repos.map((repo) => (
                <article
                  key={repo.id}
                  className="card p-5 hover:-translate-y-0.5 transition-all hover:shadow-modal"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <span className="badge-info">
                      {repo.category_name || 'Tanpa Kategori'}
                    </span>

                    <span className="text-xs text-gray-400">
                      {formatDate(repo.research_date)}
                    </span>
                  </div>

                  <h3 className="font-bold text-on-surface leading-snug min-h-[3rem]">
                    {repo.title}
                  </h3>

                  <p className="mt-3 text-sm text-gray-500 leading-6">
                    {mode === 'guest'
                      ? 'Login sebagai mahasiswa atau admin untuk melihat abstrak.'
                      : truncate(repo.abstract || 'Abstrak belum tersedia.', 130)}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-outline/30 pt-4">
                    <div className="text-xs text-gray-500">
                      <span className="font-semibold text-on-surface">
                        {repo.author_name || repo.submitter_name || 'Mahasiswa SI'}
                      </span>
                      <br />
                      {repo.research_date ? formatDate(repo.research_date) : '-'}
                    </div>

                    <Link
                      to={`${basePath}/${repo.id}`}
                      className="btn-secondary py-2 text-xs"
                    >
                      <span className="material-symbols-rounded text-[16px]">
                        visibility
                      </span>
                      Detail
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <div className="card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-sm text-gray-500">
                Halaman{' '}
                <b className="text-on-surface">{pagination.page}</b> dari{' '}
                <b className="text-on-surface">{pagination.totalPages}</b> ·
                Total{' '}
                <b className="text-primary">{pagination.total}</b> repository ·{' '}
                <b className="text-on-surface">{PAGE_SIZE}</b> data per halaman
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="btn-secondary py-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                >
                  <span className="material-symbols-rounded text-[16px]">
                    chevron_left
                  </span>
                  Sebelumnya
                </button>

                {pageNumbers.map((number) => (
                  <button
                    key={number}
                    type="button"
                    onClick={() => goToPage(number)}
                    className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                      number === page
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-600 border-outline hover:border-primary/50'
                    }`}
                  >
                    {number}
                  </button>
                ))}

                <button
                  type="button"
                  className="btn-secondary py-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={page >= pagination.totalPages}
                  onClick={() => goToPage(page + 1)}
                >
                  Berikutnya
                  <span className="material-symbols-rounded text-[16px]">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {mode === 'guest' && (
        <section id="fitur" className="grid md:grid-cols-3 gap-4 scroll-mt-20">
          {[
            [
              'search',
              'Pencarian Repository',
              'Cari referensi Tugas Akhir berdasarkan judul, kategori, dan rentang tanggal.',
            ],
            [
              'compare',
              'Similarity Check',
              'Mahasiswa dapat memeriksa kemiripan usulan judul secara realtime terhadap database RepoTA.',
            ],
            [
              'verified',
              'Verifikasi Admin',
              'Admin menjaga kualitas data sebelum repository dipublikasikan.',
            ],
          ].map(([icon, title, desc]) => (
            <div key={title} className="card">
              <span className="material-symbols-rounded text-primary text-[32px]">
                {icon}
              </span>
              <h3 className="mt-3 font-bold">{title}</h3>
              <p className="text-sm text-gray-500 mt-2 leading-6">{desc}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}