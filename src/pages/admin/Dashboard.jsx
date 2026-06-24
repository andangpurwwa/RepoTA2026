import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import { statsAdmin, repoList, uploadPerBulan, distribusiKategori } from '../../utils/dummyData';
import { statusBadge, truncate } from '../../utils/helpers';

const COLORS = ['#3525cd','#7b77ea','#a8a5f1','#d4d2f8','#c8ccec'];
const BAR_COLORS = ['#a8a5f1','#7b77ea','#4f4ae3','#3525cd','#2b1ea4','#21177b','#3525cd'];

export default function DashboardAdmin() {
  const pending = repoList.filter(r => r.status === 'Menunggu');

  return (
    <div className="space-y-5">

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsAdmin.map(({ label, value, icon, color, trend }) => (
          <div key={label} className="card">
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <span className="material-symbols-rounded icon-filled text-[20px]">{icon}</span>
              </div>
              <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{trend}</span>
            </div>
            <p className="text-2xl font-bold mt-3">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                {uploadPerBulan.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <p className="text-sm font-semibold mb-3">Distribusi Kategori</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={distribusiKategori} cx="50%" cy="50%" innerRadius={48} outerRadius={78}
                dataKey="value" paddingAngle={3}>
                {distribusiKategori.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Verifikasi pending */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold">Menunggu Verifikasi</p>
          <a href="/admin/verifikasi" className="text-xs text-primary font-medium hover:underline">Lihat semua →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">#</th>
                <th className="table-th">Judul</th>
                <th className="table-th">Mahasiswa</th>
                <th className="table-th">Kategori</th>
                <th className="table-th">Tanggal</th>
                <th className="table-th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((r, i) => (
                <tr key={r.id} className="table-row">
                  <td className="table-td text-gray-400 text-xs">{i + 1}</td>
                  <td className="table-td font-medium max-w-[200px]">{truncate(r.judul, 45)}</td>
                  <td className="table-td">
                    <p className="text-xs font-medium">{r.nama}</p>
                    <p className="text-[10px] text-gray-400">{r.nim}</p>
                  </td>
                  <td className="table-td"><span className="badge badge-info">{r.kategori}</span></td>
                  <td className="table-td text-xs text-gray-400">{r.tanggal}</td>
                  <td className="table-td">
                    <div className="flex gap-1.5">
                      <button className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center transition" title="Terima">
                        <span className="material-symbols-rounded text-green-600 text-[16px]">check</span>
                      </button>
                      <button className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition" title="Tolak">
                        <span className="material-symbols-rounded text-red-600 text-[16px]">close</span>
                      </button>
                    </div>
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
