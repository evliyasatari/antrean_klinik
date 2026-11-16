import { Router } from 'express';
import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../../index';
import { pendaftaran, antrean, dokter, poli } from '../../schema';

const router = Router();

// POST /api/pendaftaran
router.post('/', async (req, res) => {
  try {
    const { id_pasien, id_dokter, tgl_kunjungan, keluhan } = req.body;

    if (!id_pasien || !id_dokter || !tgl_kunjungan) {
      return res.status(400).json({ message: 'Data pendaftaran belum lengkap.' });
    }

    // 1. Ambil info dokter dan poli
    const dokterData = await db
      .select({
        idDokter: dokter.idDokter,
        namaDokter: dokter.namaDokter,
        idPoli: dokter.idPoli,
        namaPoli: poli.namaPoli,
        kodeAntrean: poli.kodeAntrean,
      })
      .from(dokter)
      .leftJoin(poli, eq(dokter.idPoli, poli.idPoli))
      .where(eq(dokter.idDokter, Number(id_dokter)))
      .limit(1);

    if (dokterData.length === 0 || !dokterData[0]) {
      return res.status(404).json({ message: 'Dokter tidak ditemukan.' });
    }

    const doc = dokterData[0];
    const kodePoli = doc.kodeAntrean || 'A';

    // 2. Hitung jumlah antrean poli tersebut pada tanggal kunjungan untuk nomor urut
    const existingAntreans = await db
      .select({ count: sql<number>`count(*)` })
      .from(antrean)
      .leftJoin(pendaftaran, eq(antrean.idPendaftaran, pendaftaran.idPendaftaran))
      .leftJoin(dokter, eq(pendaftaran.idDokter, dokter.idDokter))
      .where(
        and(
          eq(antrean.tglAntrean, tgl_kunjungan),
          eq(dokter.idPoli, Number(doc.idPoli))
        )
      );

    const count = Number(existingAntreans[0]?.count || 0);
    const nomorUrut = count + 1;
    const nomorAntreanFormatted = `${kodePoli}-${String(nomorUrut).padStart(3, '0')}`;

    // 3. Simpan ke tabel pendaftaran
    const nowIso = new Date().toISOString();
    const resultPendaftaran = await db
      .insert(pendaftaran)
      .values({
        idPasien: Number(id_pasien),
        idDokter: Number(id_dokter),
        tglKunjungan: String(tgl_kunjungan),
        tglDaftar: nowIso,
        keluhan: String(keluhan || 'Tanpa keluhan khusus'),
        status: 'terdaftar',
      })
      .returning();

    const newPendaftaran = resultPendaftaran[0];
    if (!newPendaftaran) {
      throw new Error('Gagal menyimpan pendaftaran.');
    }

    // 4. Simpan ke tabel antrean
    const resultAntrean = await db
      .insert(antrean)
      .values({
        idPendaftaran: newPendaftaran.idPendaftaran,
        nomorAntrean: nomorAntreanFormatted,
        tglAntrean: String(tgl_kunjungan),
        statusAntrean: 'menunggu',
      })
      .returning();

    const newAntrean = resultAntrean[0];
    if (!newAntrean) {
      throw new Error('Gagal membuat antrean.');
    }

    return res.status(201).json({
      id_antrean: newAntrean.idAntrean,
      nomor_antrean: newAntrean.nomorAntrean,
      nama_poli: doc.namaPoli || 'Poli Umum',
      posisi_antrean: nomorUrut,
      estimasi_waktu: `± ${nomorUrut * 15} menit`,
      status_antrean: 'menunggu',
    });
  } catch (error) {
    console.error('Error saat pendaftaran antrean:', error);
    return res.status(500).json({ message: 'Gagal melakukan pendaftaran antrean.' });
  }
});

// GET /api/pasien/status-aktif/:idPasien
router.get('/status-aktif/:idPasien', async (req, res) => {
  try {
    const idPasien = Number(req.params.idPasien);

    // Cari antrean aktif terbaru milik pasien (status: menunggu atau dipanggil)
    const result = await db
      .select({
        idAntrean: antrean.idAntrean,
        nomorAntrean: antrean.nomorAntrean,
        tglAntrean: antrean.tglAntrean,
        statusAntrean: antrean.statusAntrean,
        namaPoli: poli.namaPoli,
      })
      .from(antrean)
      .innerJoin(pendaftaran, eq(antrean.idPendaftaran, pendaftaran.idPendaftaran))
      .leftJoin(dokter, eq(pendaftaran.idDokter, dokter.idDokter))
      .leftJoin(poli, eq(dokter.idPoli, poli.idPoli))
      .where(
        and(
          eq(pendaftaran.idPasien, idPasien),
          sql`${antrean.statusAntrean} IN ('menunggu', 'dipanggil')`
        )
      )
      .orderBy(desc(antrean.idAntrean))
      .limit(1);

    if (result.length === 0 || !result[0]) {
      return res.status(404).json({ message: 'Anda belum memiliki nomor antrean aktif.' });
    }

    const active = result[0];
    return res.json({
      id_antrean: active.idAntrean,
      nomor_antrean: active.nomorAntrean,
      nama_poli: active.namaPoli || 'Poli',
      tgl_antrean: active.tglAntrean,
      status_antrean: active.statusAntrean,
      posisi_antrean: 1,
      estimasi_waktu: '± 15 menit',
    });
  } catch (error) {
    console.error('Error get status aktif:', error);
    return res.status(500).json({ message: 'Gagal memuat status antrean.' });
  }
});

// GET /api/pasien/riwayat/:idPasien
router.get('/riwayat/:idPasien', async (req, res) => {
  try {
    const idPasien = Number(req.params.idPasien);

    const list = await db
      .select({
        idPendaftaran: pendaftaran.idPendaftaran,
        tglKunjungan: pendaftaran.tglKunjungan,
        keluhan: pendaftaran.keluhan,
        statusPendaftaran: pendaftaran.status,
        namaDokter: dokter.namaDokter,
        namaPoli: poli.namaPoli,
        nomorAntrean: antrean.nomorAntrean,
        statusAntrean: antrean.statusAntrean,
      })
      .from(pendaftaran)
      .leftJoin(dokter, eq(pendaftaran.idDokter, dokter.idDokter))
      .leftJoin(poli, eq(dokter.idPoli, poli.idPoli))
      .leftJoin(antrean, eq(pendaftaran.idPendaftaran, antrean.idPendaftaran))
      .where(eq(pendaftaran.idPasien, idPasien))
      .orderBy(desc(pendaftaran.idPendaftaran));

    const formatted = list.map((item) => ({
      id_pendaftaran: item.idPendaftaran,
      tgl_kunjungan: item.tglKunjungan,
      nama_poli: item.namaPoli || '-',
      nama_dokter: item.namaDokter || '-',
      keluhan: item.keluhan || '-',
      nomor_antrean: item.nomorAntrean || null,
      status_antrean: item.statusAntrean || null,
      status_pendaftaran: item.statusPendaftaran || 'terdaftar',
    }));

    return res.json(formatted);
  } catch (error) {
    console.error('Error get riwayat pasien:', error);
    return res.status(500).json({ message: 'Gagal mengambil riwayat pendaftaran.' });
  }
});

export default router;
