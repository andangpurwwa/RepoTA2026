import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import Login from '../pages/Login';
import GuestLayout from '../layouts/GuestLayout';
import StudentLayout from '../layouts/StudentLayout';
import AdminLayout from '../layouts/AdminLayout';
import GuestBrowse from '../pages/guest/Browse';
import RepositoryDetail from '../pages/RepositoryDetail';
import DashboardMahasiswa from '../pages/mahasiswa/Dashboard';
import UploadRepo from '../pages/mahasiswa/Upload';
import SimilarityCheck from '../pages/mahasiswa/Similarity';
import HistoryMahasiswa from '../pages/mahasiswa/History';
import ProfileMahasiswa from '../pages/mahasiswa/Profile';
import DashboardAdmin from '../pages/admin/Dashboard';
import Verifikasi from '../pages/admin/Verifikasi';
import ManajemenRepo from '../pages/admin/Repository';
import Kategori from '../pages/admin/Kategori';
import Keyword from '../pages/admin/Keyword';
import Laporan from '../pages/admin/Laporan';
import MahasiswaAdmin from '../pages/admin/Mahasiswa';

function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="min-h-screen grid place-items-center bg-surface text-gray-500">Memeriksa sesi...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/mahasiswa/dashboard'} replace />;
  }
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/guest" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/guest" element={<GuestLayout />}>
        <Route index element={<GuestBrowse />} />
        <Route path="repository/:id" element={<RepositoryDetail />} />
      </Route>
      <Route path="/mahasiswa" element={<ProtectedRoute roles={['mahasiswa']}><StudentLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardMahasiswa />} />
        <Route path="repository" element={<GuestBrowse mode="student" />} />
        <Route path="repository/:id" element={<RepositoryDetail />} />
        <Route path="upload" element={<UploadRepo />} />
        <Route path="similarity" element={<SimilarityCheck />} />
        <Route path="history" element={<HistoryMahasiswa />} />
        <Route path="profile" element={<ProfileMahasiswa />} />
      </Route>
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardAdmin />} />
        <Route path="verifikasi" element={<Verifikasi />} />
        <Route path="repository" element={<ManajemenRepo />} />
        <Route path="repository/:id" element={<RepositoryDetail />} />
        <Route path="mahasiswa" element={<MahasiswaAdmin />} />
        <Route path="kategori" element={<Kategori />} />
        <Route path="keyword" element={<Keyword />} />
        <Route path="laporan" element={<Laporan />} />
      </Route>
      <Route path="*" element={<Navigate to="/guest" replace />} />
    </Routes>
  );
}
