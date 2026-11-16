import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import authPetugasRoutes from './db/routes/petugas/auth';
import poliRoutes from './db/routes/petugas/poli';
import dokterRoutes from './db/routes/dokter';
import authPasienRoutes from './db/routes/pasien/auth';
import pendaftaranRoutes from './db/routes/pasien/pendaftaran';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Routes Master Data (Poli & Dokter) - bisa diakses Pasien & Petugas
app.use('/api/poli', poliRoutes);
app.use('/api/petugas/poli', poliRoutes);

app.use('/api/dokter', dokterRoutes);
app.use('/api/petugas/dokter', dokterRoutes);

// Routes Pendaftaran & Antrean Pasien
app.use('/api/pendaftaran', pendaftaranRoutes);
app.use('/api/pasien', pendaftaranRoutes); // status-aktif & riwayat

// Routes Auth Pasien
app.use('/api/pasien', authPasienRoutes);

// Routes Petugas
app.use('/api/petugas', authPetugasRoutes);

app.listen(PORT, () => {
  console.log(`Server backend berjalan di http://localhost:${PORT}`);
});
