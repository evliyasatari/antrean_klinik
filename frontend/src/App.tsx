import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import PetugasLayout from './layouts/PetugasLayout';
import Dashboard from './pages/petugas/Dashboard';
import KelolaPasien from './pages/petugas/KelolaPasien';
import KelolaDokter from './pages/petugas/KelolaDokter';
import KelolaPoli from './pages/petugas/KelolaPoli';
import DaftarAntrean from './pages/petugas/DaftarAntrean';
import RiwayatPelayanan from './pages/petugas/RiwayatPelayanan';
import LoginPetugas from './pages/petugas/LoginPetugas';

import Beranda from './pages/pasien/Beranda';
import Pendaftaran from './pages/pasien/Pendaftaran';
import LoginPasien from './pages/pasien/LoginPasien';
import RiwayatPasien from './pages/pasien/Riwayat';
import StatusAntrean from './pages/pasien/Status';
import NomorAntrean from './pages/pasien/NomorAntrean';
// import AkunPasien from './pages/pasien/AkunPasien';

const PlaceholderPage = ({ title }: { title: string }) => (
  <div style={{ padding: '24px', background: '#fff', borderRadius: '16px', margin: '20px' }}>
    <h2 style={{ margin: 0, color: '#1b2a4a' }}>{title}</h2>
    <p style={{ color: '#5b6b8a' }}>Halaman ini sedang dalam tahap pengembangan.</p>
  </div>
);

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Arahkan halaman utama (/) ke Beranda Pasien atau ganti sesuai kebutuhan */}
        <Route path="/" element={<Navigate to="/pasien/beranda" replace />} />

        {/* ================= ROUTES PASIEN ================= */}
        <Route path="/pasien/beranda" element={<Beranda />} />
        <Route path="/pasien/login" element={<LoginPasien/>} />
        <Route path="/pasien/pendaftaran" element={<Pendaftaran/>} />
        <Route path="/pasien/nomor-antrean" element={<NomorAntrean />} />
        <Route path="/pasien/status-antrean" element={<StatusAntrean/>} />
        <Route path="/pasien/riwayat" element={<RiwayatPasien/>} />
        <Route path="/pasien/akun" element={<PlaceholderPage title="Akun Pasien" />} />

        {/* ================= ROUTES PETUGAS ================= */}
        <Route path="/petugas/login" element={<LoginPetugas />} />

        <Route path="/petugas" element={<PetugasLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="poli" element={<KelolaPoli />} />
          <Route path="pasien" element={<KelolaPasien />} />
          <Route path="dokter" element={<KelolaDokter />} />
          <Route path="antrean" element={<DaftarAntrean />} />
          <Route path="riwayat" element={<RiwayatPelayanan />} />
          <Route path="pengaturan" element={<PlaceholderPage title="Pengaturan Klinik" />} />
        </Route>

        {/* Fallback jika URL tidak ditemukan */}
        <Route path="*" element={<Navigate to="/pasien/beranda" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;