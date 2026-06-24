import { useState } from 'react';

export default function ProfileMahasiswa() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    nama: 'Budi Santoso',
    nim: '20210078',
    email: 'budi.santoso@mhs.univ.ac.id',
    prodi: 'Teknik Informatika',
    angkatan: '2021',
    dosen: 'Dr. Siti Rahayu, M.Kom.',
    telepon: '081234567890',
  });

  const fields = [
    { key: 'nama',     label: 'Nama Lengkap',     icon: 'person' },
    { key: 'nim',      label: 'NIM',               icon: 'badge',         disabled: true },
    { key: 'email',    label: 'Email',             icon: 'email',         disabled: true },
    { key: 'prodi',    label: 'Program Studi',     icon: 'school',        disabled: true },
    { key: 'angkatan', label: 'Angkatan',          icon: 'calendar_today',disabled: true },
    { key: 'dosen',    label: 'Dosen Pembimbing',  icon: 'supervisor_account' },
    { key: 'telepon',  label: 'No. Telepon',       icon: 'phone' },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Avatar + name card */}
      <div className="card flex flex-col items-center py-8">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-card mb-3">
          <span className="material-symbols-rounded icon-filled text-white text-[40px]">person</span>
        </div>
        <h2 className="font-bold text-lg">{form.nama}</h2>
        <p className="text-sm text-gray-400">{form.nim} · {form.prodi}</p>
        <div className="flex gap-2 mt-4">
          <span className="badge badge-success">Mahasiswa Aktif</span>
          <span className="badge badge-info">Angkatan {form.angkatan}</span>
        </div>
      </div>

      {/* Info form */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold">Informasi Akun</p>
          <button onClick={() => setEditing(!editing)} className="btn-secondary text-xs py-1.5 px-3">
            <span className="material-symbols-rounded text-[15px]">{editing ? 'close' : 'edit'}</span>
            {editing ? 'Batal' : 'Edit'}
          </button>
        </div>
        <div className="space-y-3">
          {fields.map(({ key, label, icon, disabled }) => (
            <div key={key} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-rounded text-primary text-[16px]">{icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="label mb-0">{label}</p>
                {editing && !disabled
                  ? <input className="input text-xs py-1.5 mt-1" value={form[key]}
                      onChange={(e) => setForm({...form, [key]: e.target.value})} />
                  : <p className="text-sm font-medium truncate">{form[key]}</p>
                }
              </div>
              {disabled && (
                <span className="material-symbols-rounded text-[16px] text-gray-300">lock</span>
              )}
            </div>
          ))}
        </div>

        {editing && (
          <div className="flex gap-3 mt-4 justify-end">
            <button onClick={() => setEditing(false)} className="btn-ghost">Batal</button>
            <button onClick={() => setEditing(false)} className="btn-primary">
              <span className="material-symbols-rounded text-[16px]">save</span> Simpan
            </button>
          </div>
        )}
      </div>

      {/* Change password */}
      <div className="card">
        <p className="text-sm font-semibold mb-3">Keamanan</p>
        <button className="btn-secondary w-full justify-center">
          <span className="material-symbols-rounded text-[16px]">lock_reset</span>
          Ganti Password
        </button>
      </div>
    </div>
  );
}
