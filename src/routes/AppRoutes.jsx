import { Routes, Route, Navigate } from 'react-router-dom';

import Login from '../pages/Login';

// Layouts
import StudentLayout  from '../layouts/StudentLayout';
import AdminLayout    from '../layouts/AdminLayout';
import GuestLayout    from '../layouts/GuestLayout';

// Mahasiswa pages
import DashboardMahasiswa from '../pages/mahasiswa/Dashboard';
import UploadRepo         from '../pages/mahasiswa/Upload';
import SimilarityCheck    from '../pages/mahasiswa/Similarity';
import HistoryMahasiswa   from '../pages/mahasiswa/History';
import ProfileMahasiswa   from '../pages/mahasiswa/Profile';

// Admin pages
import DashboardAdmin   from '../pages/admin/Dashboard';
import Verifikasi       from '../pages/admin/Verifikasi';
import ManajemenRepo    from '../pages/admin/Repository';
import Kategori         from '../pages/admin/Kategori';
import Keyword          from '../pages/admin/Keyword';
import Laporan          from '../pages/admin/Laporan';

// Guest pages
import GuestBrowse from '../pages/guest/Browse';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />

      {/* Mahasiswa */}
      <Route path="/mahasiswa" element={<StudentLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"   element={<DashboardMahasiswa />} />
        <Route path="upload"      element={<UploadRepo />} />
        <Route path="similarity"  element={<SimilarityCheck />} />
        <Route path="history"     element={<HistoryMahasiswa />} />
        <Route path="profile"     element={<ProfileMahasiswa />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"   element={<DashboardAdmin />} />
        <Route path="verifikasi"  element={<Verifikasi />} />
        <Route path="repository"  element={<ManajemenRepo />} />
        <Route path="kategori"    element={<Kategori />} />
        <Route path="keyword"     element={<Keyword />} />
        <Route path="laporan"     element={<Laporan />} />
      </Route>

      {/* Guest / Publik */}
      <Route path="/guest" element={<GuestLayout />}>
        <Route index element={<GuestBrowse />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
