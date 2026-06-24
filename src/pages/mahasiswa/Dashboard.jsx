import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { statsMahasiswa, repoList, uploadPerBulan } from '../../utils/dummyData';
import { statusBadge, similarityColor, truncate } from '../../utils/helpers';

const BAR_COLORS = ['#a8a5f1','#7b77ea','#4f4ae3','#3525cd','#2b1ea4','#21177b','#3525cd'];

export default function DashboardMahasiswa() {
  const myRepos = repoList.slice(0, 3);

  return (
    <div className="space-y-5">

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary to-primary-400 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm">Halo, 👋</p>
          <h2 className="text-xl font-bold mt-0.5">Budi Santoso</h2>
          <p className="text-white/60 text-xs mt-1">NIM 20210078 · Teknik Informatika</p>
        </div>
        <div className="hidden sm:flex gap-3">
          <div className="bg-white/15 rounded-xl px-4 py-3 text-center min-w-[70px]">
            <p className="text-2xl font-bold">2</p>
            <p className="text-[10px] text-white/60">Terverifikasi</p>
          </div>
          <div className="bg-white/15 rounded-xl px-4 py-3 text-center min-w-[70px]">
            <p className="text-2xl font-bold">1</p>
            <p className="text-[10px] text-white/60">Menunggu</p>
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsMahasiswa.map(({ label, value, icon, color }) => (
          <div key={label} className="card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <span className="material-symbols-rounded icon-filled text-[20px]">{icon}</span>
            </div>
            <div>
              <p className="text-xl font-bold text-on-surface">{value}</p>
              <p className="text-xs text-gray-400 leading-snug">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bento: chart + info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="card lg:col-span-2">
          <p className="text-sm font-semibold mb-4">Upload per Bulan</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={uploadPerBulan} barSize={28}>
              <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.1)', fontSize: 12 }}
                cursor={{ fill: '#3525cd10' }}
              />
              <Bar dataKey="jumlah" radius={[6,6,0,0]}>
                {uploadPerBulan.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions */}
        <div className="card flex flex-col gap-3">
          <p className="text-sm font-semibold">Aksi Cepat</p>
          {[
            { label: 'Upload Repositori Baru', icon: 'upload_file',   href: '/mahasiswa/upload',     color: 'bg-primary/10 text-primary' },
            { label: 'Cek Similaritas',         icon: 'manage_search', href: '/mahasiswa/similarity', color: 'bg-green-50 text-green-600' },
            { label: 'Lihat Riwayat',           icon: 'history',       href: '/mahasiswa/history',    color: 'bg-yellow-50 text-yellow-600' },
          ].map(({ label, icon, href, color }) => (
            <a key={href} href={href}
              className="flex items-center gap-3 p-3 rounded-xl border border-outline/40 hover:border-primary/40 hover:bg-primary/5 transition group">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                <span className="material-symbols-rounded icon-filled text-[18px]">{icon}</span>
              </span>
              <span className="text-sm font-medium text-gray-600 group-hover:text-primary">{label}</span>
              <span className="material-symbols-rounded text-[16px] text-gray-300 ml-auto group-hover:text-primary">chevron_right</span>
            </a>
          ))}
        </div>
      </div>

      {/* Tabel repositori terbaru */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold">Repositori Terbaru Saya</p>
          <a href="/mahasiswa/history" className="text-xs text-primary hover:underline font-medium">Lihat semua →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th rounded-tl-lg">Judul</th>
                <th className="table-th">Kategori</th>
                <th className="table-th">Similaritas</th>
                <th className="table-th">Tanggal</th>
                <th className="table-th rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {myRepos.map((r) => (
                <tr key={r.id} className="table-row">
                  <td className="table-td font-medium max-w-[220px]">{truncate(r.judul, 50)}</td>
                  <td className="table-td"><span className="badge badge-info">{r.kategori}</span></td>
                  <td className="table-td">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${similarityColor(r.similarity)}`}>
                      {r.similarity}%
                    </span>
                  </td>
                  <td className="table-td text-gray-400">{r.tanggal}</td>
                  <td className="table-td">
                    <span className={statusBadge(r.status)}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
