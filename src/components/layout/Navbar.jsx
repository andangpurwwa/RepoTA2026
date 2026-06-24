import { useState } from 'react';

export default function Navbar({ title = 'Dashboard', subtitle = '' }) {
  const [showNotif, setShowNotif] = useState(false);

  const notifs = [
    { id: 1, text: 'Repositori kamu berhasil diverifikasi', time: '5 menit lalu', icon: 'task_alt', color: 'text-green-600' },
    { id: 2, text: 'Pengajuan baru menunggu persetujuan', time: '1 jam lalu', icon: 'hourglass_top', color: 'text-yellow-600' },
    { id: 3, text: 'Sistem pembaruan selesai', time: '3 jam lalu', icon: 'info', color: 'text-blue-600' },
  ];

  return (
    <header className="h-16 bg-white border-b border-outline/40 px-6 flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-sm">
      {/* Judul */}
      <div>
        <h1 className="text-base font-semibold text-on-surface">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 relative">
        {/* Notifikasi */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-primary/5 transition relative"
          >
            <span className="material-symbols-rounded text-[22px] text-gray-500">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          {showNotif && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-modal border border-outline/30 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-outline/30 flex items-center justify-between">
                <p className="text-sm font-semibold">Notifikasi</p>
                <span className="badge badge-info">3 baru</span>
              </div>
              {notifs.map((n) => (
                <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-outline/20 last:border-0 cursor-pointer">
                  <span className={`material-symbols-rounded icon-filled text-[20px] mt-0.5 ${n.color}`}>{n.icon}</span>
                  <div>
                    <p className="text-xs text-on-surface">{n.text}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-outline/40">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-rounded icon-filled text-white text-[18px]">person</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-on-surface leading-none">Budi Santoso</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Mahasiswa</p>
          </div>
          <span className="material-symbols-rounded text-[16px] text-gray-400">expand_more</span>
        </div>
      </div>
    </header>
  );
}
