import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import { uploadPerBulan, distribusiKategori } from '../../utils/dummyData';

const COLORS = ['#3525cd','#7b77ea','#a8a5f1','#d4d2f8','#c8ccec'];

const summaryCards = [
  { label: 'Total Repositori', value: '1.284', icon: 'folder_open',   color: 'bg-blue-50 text-blue-600' },
  { label: 'Mahasiswa Aktif',  value: '438',   icon: 'school',         color: 'bg-purple-50 text-purple-600' },
  { label: 'Rata-rata Sim.',   value: '11.4%', icon: 'manage_search', color: 'bg-green-50 text-green-600' },
  { label: 'Upload Bulan Ini', value: '38',    icon: 'upload_file',   color: 'bg-yellow-50 text-yellow-600' },
];

export default function Laporan() {
  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(({ label, value, icon, color }) => (
          <div key={label} className="card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <span className="material-symbols-rounded icon-filled text-[20px]">{icon}</span>
            </div>
            <div>
              <p className="text-xl font-bold">{value}</p>
              <p className="text-xs text-gray-400 leading-snug">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold">Tren Upload Bulanan</p>
            <button className="btn-secondary text-xs py-1.5 px-3">
              <span className="material-symbols-rounded text-[14px]">download</span> Ekspor
            </button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={uploadPerBulan}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.1)', fontSize: 12 }} />
              <Line type="monotone" dataKey="jumlah" stroke="#3525cd" strokeWidth={2.5}
                dot={{ fill: '#3525cd', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <p className="text-sm font-semibold mb-4">Repositori per Kategori</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={distribusiKategori} layout="vertical" barSize={18}>
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} width={100} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11 }} />
              <Bar dataKey="value" radius={[0,6,6,0]}>
                {distribusiKategori.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Export panel */}
      <div className="card">
        <p className="text-sm font-semibold mb-3">Ekspor Laporan</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Ekspor PDF',   icon: 'picture_as_pdf', color: 'text-red-600 bg-red-50' },
            { label: 'Ekspor Excel', icon: 'table_chart',     color: 'text-green-600 bg-green-50' },
            { label: 'Ekspor CSV',   icon: 'csv',             color: 'text-blue-600 bg-blue-50' },
          ].map(({ label, icon, color }) => (
            <button key={label}
              className="flex items-center gap-3 p-4 rounded-xl border border-outline/40 hover:border-primary/30 hover:bg-primary/5 transition group">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                <span className="material-symbols-rounded icon-filled text-[18px]">{icon}</span>
              </div>
              <span className="text-sm font-medium text-gray-600 group-hover:text-primary">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
