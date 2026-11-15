import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import authPetugasRoutes from './db/routes/petugas/auth';
// import dashboardRoutes from './routes/petugas/dashboard.routes';
import poliRoutes from './db/routes/petugas/poli';
// import dokterRoutes from './routes/petugas/dokter.routes';
// import pasienRoutes from './routes/petugas/pasien.routes';
// import antreanRoutes from './routes/petugas/antrean.routes';
// import riwayatRoutes from './routes/petugas/riwayat.routes';

import authPasienRoutes from './db/routes/pasien/auth';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// route petugas
app.use('/api/petugas', authPetugasRoutes);
// app.use('/api/petugas/dashboard', dashboardRoutes);
app.use('/api/petugas/poli', poliRoutes);
// app.use('/api/petugas/dokter', dokterRoutes);
// app.use('/api/petugas/pasien', pasienRoutes);
// app.use('/api/petugas/antrean', antreanRoutes);
// app.use('/api/petugas/riwayat', riwayatRoutes);

// route pasien
app.use('/api/pasien', authPasienRoutes);

app.listen(PORT, () => {
  console.log(`Server backend berjalan di http://localhost:${PORT}`);
});