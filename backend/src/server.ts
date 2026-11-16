import express from 'express';
import cors from 'cors';
import 'dotenv/config';

// Routes Master & Petugas
import authPetugasRoutes from './db/routes/petugas/auth';
import dashboardPetugasRoutes from './db/routes/petugas/dashboard';
import poliRoutes from './db/routes/petugas/poli';
import pasienPetugasRoutes from './db/routes/petugas/pasien';
import dokterRoutes from './db/routes/dokter';
import antreanPetugasRoutes from './db/routes/petugas/antrean';
import riwayatPetugasRoutes from './db/routes/petugas/riwayat';

// Routes Pasien
import authPasienRoutes from './db/routes/pasien/auth';
import pendaftaranRoutes from './db/routes/pasien/pendaftaran';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// ===================== ROUTES MASTER DATA =====================
app.use('/api/poli', poliRoutes);
app.use('/api/petugas/poli', poliRoutes);

app.use('/api/dokter', dokterRoutes);
app.use('/api/petugas/dokter', dokterRoutes);

// ===================== ROUTES PETUGAS =====================
app.use('/api/petugas/dashboard', dashboardPetugasRoutes);
app.use('/api/petugas/pasien', pasienPetugasRoutes);
app.use('/api/petugas/antrean', antreanPetugasRoutes);
app.use('/api/petugas/riwayat', riwayatPetugasRoutes);
app.use('/api/petugas', authPetugasRoutes); // login petugas

// ===================== ROUTES PASIEN =====================
app.use('/api/pendaftaran', pendaftaranRoutes);
app.use('/api/pasien', pendaftaranRoutes); // status-aktif & riwayat
app.use('/api/pasien', authPasienRoutes); // login & register pasien

app.listen(PORT, () => {
  console.log(`Server backend berjalan di http://localhost:${PORT}`);
});
