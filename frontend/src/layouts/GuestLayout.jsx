import { Link, Outlet } from 'react-router-dom';

export default function GuestLayout() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-outline/40 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Identitas RepoTA */}
          <Link
            to="/guest"
            className="flex items-center gap-2.5"
            aria-label="Kembali ke halaman utama RepoTA"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-card">
              <span className="material-symbols-rounded icon-filled text-[22px] text-white">
                auto_stories
              </span>
            </div>

            <div>
              <p className="font-extrabold leading-none text-primary">
                RepoTA
              </p>

              <p className="mt-1 text-[11px] text-gray-500">
                Repository Tugas Akhir SI
              </p>
            </div>
          </Link>

          {/* Menu kanan */}
          <div className="flex items-center gap-2">
            <a
              href="mailto:si@uad.ac.id"
              className="hidden items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-primary md:inline-flex"
              aria-label="Kirim email ke Program Studi Sistem Informasi"
            >
              <span className="material-symbols-rounded text-[17px]">
                mail
              </span>

              <span>si@uad.ac.id</span>
            </a>

            <Link
              to="/login"
              className="btn-primary px-4 py-2 text-xs"
            >
              <span className="material-symbols-rounded text-[16px]">
                login
              </span>

              <span>Masuk</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Isi halaman */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        id="kontak"
        className="scroll-mt-20 border-t border-outline/40 bg-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="grid gap-8 rounded-3xl border border-outline/40 bg-gradient-to-br from-primary-50 to-white p-6 text-sm text-gray-600 sm:p-8 md:grid-cols-[1.25fr_0.75fr] md:items-center lg:gap-12">
            {/* Informasi RepoTA */}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-card">
                  <span className="material-symbols-rounded icon-filled text-[25px] text-white">
                    auto_stories
                  </span>
                </div>

                <div>
                  <p className="text-2xl font-extrabold leading-none text-primary">
                    RepoTA
                  </p>

                  <p className="mt-1 text-xs font-medium text-gray-500">
                    Repository Tugas Akhir Sistem Informasi
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
                Portal pencarian, pengelolaan, dan analisis Tugas Akhir Program
                Studi Sistem Informasi Universitas Ahmad Dahlan.
              </p>
            </div>

            {/* Kontak Prodi */}
            <div className="border-t border-outline/40 pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
              <p className="mb-4 text-base font-bold text-on-surface">
                Kontak Prodi
              </p>

              <div className="flex flex-col items-start gap-3">
                <a
                  href="mailto:si@uad.ac.id"
                  className="inline-flex items-center gap-3 text-sm transition-colors hover:text-primary sm:text-base"
                >
                  <span className="material-symbols-rounded text-[20px]">
                    mail
                  </span>

                  <span>si@uad.ac.id</span>
                </a>

                <a
                  href="tel:+62274563711"
                  className="inline-flex items-center gap-3 text-sm transition-colors hover:text-primary sm:text-base"
                >
                  <span className="material-symbols-rounded text-[20px]">
                    call
                  </span>

                  <span>(0274) 563711</span>
                </a>

                <div className="inline-flex items-start gap-3 text-sm sm:text-base">
                  <span className="material-symbols-rounded mt-0.5 text-[20px]">
                    location_on
                  </span>

                  <span>Kampus UAD · Yogyakarta</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-outline/40 px-4 py-4 text-center text-xs text-gray-500">
          © 2026 RepoTA · Program Studi Sistem Informasi Universitas Ahmad
          Dahlan
        </div>
      </footer>
    </div>
  );
}