import { Link, Outlet } from 'react-router-dom';

export default function GuestLayout() {
  const close = () => {};
  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-outline/40 shadow-sm">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between">
          <Link to="/guest" className="flex items-center gap-2.5" onClick={close}>
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-card">
              <span className="material-symbols-rounded icon-filled text-white text-[22px]">auto_stories</span>
            </div>
            <div>
              <p className="font-extrabold text-primary leading-none">RepoTA</p>
              <p className="text-[11px] text-gray-500 mt-1">Repository Tugas Akhir SI</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <a href="mailto:si@uad.ac.id" className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary"><span className="material-symbols-rounded text-[17px]">mail</span> si@uad.ac.id</a>
            <Link to="/login" className="btn-primary text-xs py-2 px-4"><span className="material-symbols-rounded text-[16px]">login</span> Masuk</Link>
          </div>
        </div>
      </header>
      <main><Outlet /></main>
      <footer id="kontak" className="border-t border-outline/40 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="rounded-3xl bg-gradient-to-br from-primary-50 to-white border border-outline/40 p-5 sm:p-6 grid md:grid-cols-[1fr_1fr_1fr] gap-6 text-sm text-gray-600">
            <div>
              <p className="font-extrabold text-primary text-xl">RepoTA</p>
              <p className="mt-2 leading-6">Portal repository dan analisis Tugas Akhir Program Studi Sistem Informasi.</p>
            </div>
            <div>
              <p className="font-bold text-on-surface mb-2">Kontak Prodi</p>
              <a className="inline-flex items-center gap-2 hover:text-primary" href="mailto:si@uad.ac.id"><span className="material-symbols-rounded text-[17px]">mail</span>si@uad.ac.id</a>
              <a className="mt-1 inline-flex items-center gap-2 hover:text-primary" href="tel:+62274563711"><span className="material-symbols-rounded text-[17px]">call</span>(0274) 563711</a>
              <p className="mt-1 inline-flex items-center gap-2"><span className="material-symbols-rounded text-[17px]">location_on</span>Kampus UAD · Yogyakarta</p>
            </div>
            <div>
              <p className="font-bold text-on-surface mb-2">Bantuan Akun</p>
              <p className="leading-6">Reset password sudah memakai OTP email. Jika email tidak masuk, hubungi admin prodi atau cek konfigurasi SMTP backend.</p>
            </div>
          </div>
        </div>
        <div className="border-t border-outline/40 py-4 text-center text-xs text-gray-500">© 2026 RepoTA · Program Studi Sistem Informasi</div>
      </footer>
    </div>
  );
}
