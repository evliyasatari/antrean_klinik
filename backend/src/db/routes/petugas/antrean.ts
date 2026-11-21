import { Router } from 'express';
import { asc, desc, eq } from 'drizzle-orm';
import { db } from '../../index';
import { antrean, pendaftaran, pasien, dokter, poli, petugas } from '../../schema';

const router = Router();

// GET /api/petugas/antrean - Daftar antrean aktif
router.get('/', async (_req, res) => {
  try {
    const list = await db
      .select({
        idAntrean: antrean.idAntrean,
        idPendaftaran: antrean.idPendaftaran,
        nomorAntrean: antrean.nomorAntrean,
        tglAntrean: antrean.tglAntrean,
        statusAntrean: antrean.statusAntrean,
        waktuPanggil: antrean.waktuPanggil,
        tglDaftar: pendaftaran.tglDaftar,
        keluhan: pendaftaran.keluhan,
        namaPasien: pasien.namaPasien,
        idPasien: pasien.idPasien,
        idDokter: dokter.idDokter,
        namaDokter: dokter.namaDokter,
        idPoli: poli.idPoli,
        namaPoli: poli.namaPoli,
      })
      .from(antrean)
      .innerJoin(pendaftaran, eq(antrean.idPendaftaran, pendaftaran.idPendaftaran))
      .leftJoin(pasien, eq(pendaftaran.idPasien, pasien.idPasien))
      .leftJoin(dokter, eq(pendaftaran.idDokter, dokter.idDokter))
      .leftJoin(poli, eq(dokter.idPoli, poli.idPoli))
      .orderBy(asc(antrean.idAntrean)); // 

    const formatted = list.map((a) => ({
      id_antrean: a.idAntrean,
      idAntrean: a.idAntrean,
      id_pendaftaran: a.idPendaftaran,
      idPendaftaran: a.idPendaftaran,
      nomor_antrean: a.nomorAntrean || '',
      nomorAntrean: a.nomorAntrean || '',
      tgl_antrean: a.tglAntrean || '',
      tglAntrean: a.tglAntrean || '',
      tgl_daftar: a.tglDaftar || '',
      tglDaftar: a.tglDaftar || '',
      status_antrean: a.statusAntrean || 'menunggu',
      statusAntrean: a.statusAntrean || 'menunggu',
      waktu_panggil: a.waktuPanggil,
      waktuPanggil: a.waktuPanggil,
      nama_pasien: a.namaPasien || 'Pasien',
      namaPasien: a.namaPasien || 'Pasien',
      id_poli: a.idPoli || 0,
      idPoli: a.idPoli || 0,
      nama_poli: a.namaPoli || '-',
      namaPoli: a.namaPoli || '-',
      nama_dokter: a.namaDokter || '-',
      namaDokter: a.namaDokter || '-',
      keluhan: a.keluhan || '-',
    }));

    return res.json(formatted);
  } catch (error) {
    console.error('Error fetch antrean:', error);
    return res.status(500).json({ message: 'Gagal memuat daftar antrean.' });
  }
});

// PATCH /api/petugas/antrean/:id/panggil
router.patch('/:id/panggil', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const nowIso = new Date().toISOString();

    await db
      .update(antrean)
      .set({
        statusAntrean: 'dipanggil',
        waktuPanggil: nowIso,
      })
      .where(eq(antrean.idAntrean, id));

    return res.json({ message: 'Pasien berhasil dipanggil.' });
  } catch (error) {
    console.error('Error panggil antrean:', error);
    return res.status(500).json({ message: 'Gagal memanggil antrean.' });
  }
});

// PATCH /api/petugas/antrean/:id/selesai
router.patch('/:id/selesai', async (req, res) => {
  try {
    const id = Number(req.params.id);

    await db
      .update(antrean)
      .set({
        statusAntrean: 'selesai',
      })
      .where(eq(antrean.idAntrean, id));

    return res.json({ message: 'Pelayanan pasien telah selesai.' });
  } catch (error) {
    console.error('Error selesai antrean:', error);
    return res.status(500).json({ message: 'Gagal menyelesaikan antrean.' });
  }
});

export default router;
