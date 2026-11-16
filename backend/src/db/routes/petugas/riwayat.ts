import { Router } from 'express';
import { desc, eq } from 'drizzle-orm';
import { db } from '../../index';
import { antrean, pendaftaran, pasien, dokter, poli, petugas } from '../../schema';

const router = Router();

// GET /api/petugas/riwayat
router.get('/', async (_req, res) => {
  try {
    const list = await db
      .select({
        idAntrean: antrean.idAntrean,
        idPendaftaran: antrean.idPendaftaran,
        nomorAntrean: antrean.nomorAntrean,
        tglAntrean: antrean.tglAntrean,
        tglDaftar: pendaftaran.tglDaftar,
        waktuPanggil: antrean.waktuPanggil,
        statusAntrean: antrean.statusAntrean,
        nik: pasien.nik,
        namaPasien: pasien.namaPasien,
        jenisKelamin: pasien.jenisKelamin,
        noHp: pasien.noHp,
        alamat: pasien.alamat,
        namaPoli: poli.namaPoli,
        namaDokter: dokter.namaDokter,
        keluhan: pendaftaran.keluhan,
        namaPetugas: petugas.namaPetugas,
      })
      .from(antrean)
      .innerJoin(pendaftaran, eq(antrean.idPendaftaran, pendaftaran.idPendaftaran))
      .leftJoin(pasien, eq(pendaftaran.idPasien, pasien.idPasien))
      .leftJoin(dokter, eq(pendaftaran.idDokter, dokter.idDokter))
      .leftJoin(poli, eq(dokter.idPoli, poli.idPoli))
      .leftJoin(petugas, eq(antrean.idPetugas, petugas.idPetugas))
      .orderBy(desc(antrean.idAntrean));

    const formatted = list.map((item) => ({
      id_antrean: item.idAntrean,
      idAntrean: item.idAntrean,
      id_pendaftaran: item.idPendaftaran,
      idPendaftaran: item.idPendaftaran,
      nomor_antrean: item.nomorAntrean || '',
      nomorAntrean: item.nomorAntrean || '',
      tgl_antrean: item.tglAntrean || '',
      tglAntrean: item.tglAntrean || '',
      tgl_daftar: item.tglDaftar || '',
      tglDaftar: item.tglDaftar || '',
      waktu_panggil: item.waktuPanggil,
      waktuPanggil: item.waktuPanggil,
      status_antrean: item.statusAntrean || 'selesai',
      statusAntrean: item.statusAntrean || 'selesai',
      nik: item.nik || '',
      nama_pasien: item.namaPasien || 'Pasien',
      namaPasien: item.namaPasien || 'Pasien',
      jenis_kelamin: item.jenisKelamin || 'L',
      jenisKelamin: item.jenisKelamin || 'L',
      no_hp: item.noHp || '',
      noHp: item.noHp || '',
      alamat: item.alamat || '',
      nama_poli: item.namaPoli || '-',
      namaPoli: item.namaPoli || '-',
      nama_dokter: item.namaDokter || '-',
      namaDokter: item.namaDokter || '-',
      keluhan: item.keluhan || '-',
      nama_petugas: item.namaPetugas || null,
      namaPetugas: item.namaPetugas || null,
    }));

    return res.json(formatted);
  } catch (error) {
    console.error('Error fetch riwayat:', error);
    return res.status(500).json({ message: 'Gagal memuat riwayat pelayanan.' });
  }
});

export default router;
