import { Router } from 'express';
import { sql, eq, asc } from 'drizzle-orm';
import { db } from '../../index';
import { pasien, antrean, pendaftaran, dokter, poli } from '../../schema';

const router = Router();

// GET /api/petugas/dashboard
router.get('/', async (_req, res) => {
  try {
    // 1. Total Pasien
    const totalPasienRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(pasien);
    const totalPasien = Number(totalPasienRes[0]?.count || 0);

    // 2. Dalam Antrean (menunggu)
    const dalamAntreanRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(antrean)
      .where(eq(antrean.statusAntrean, 'menunggu'));
    const dalamAntrean = Number(dalamAntreanRes[0]?.count || 0);

    // 3. Sedang Dilayani (dipanggil)
    const sedangDilayaniRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(antrean)
      .where(eq(antrean.statusAntrean, 'dipanggil'));
    const sedangDilayani = Number(sedangDilayaniRes[0]?.count || 0);

    // 4. Selesai Hari Ini
    const selesaiHariIniRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(antrean)
      .where(eq(antrean.statusAntrean, 'selesai'));
    const selesaiHariIni = Number(selesaiHariIniRes[0]?.count || 0);

    // 5. Antrean per Poli
    const allPoli = await db.select().from(poli).orderBy(asc(poli.idPoli));
    
    // Hitung antrean per poli (yang berstatus menunggu atau dipanggil)
    const antreanPoli = await Promise.all(
      allPoli.map(async (p) => {
        const countRes = await db
          .select({ count: sql<number>`count(*)` })
          .from(antrean)
          .innerJoin(pendaftaran, eq(antrean.idPendaftaran, pendaftaran.idPendaftaran))
          .innerJoin(dokter, eq(pendaftaran.idDokter, dokter.idDokter))
          .where(
            eq(dokter.idPoli, p.idPoli)
          );
        const count = Number(countRes[0]?.count || 0);
        return {
          id: p.idPoli,
          nama: p.namaPoli || 'Poli',
          kode: p.kodeAntrean || '',
          estimasi: `± ${count * 15} menit`,
        };
      })
    );

    return res.json({
      stats: {
        totalPasien,
        dalamAntrean,
        sedangDilayani,
        selesaiHariIni,
      },
      antreanPoli,
    });
  } catch (error) {
    console.error('Error load dashboard:', error);
    return res.status(500).json({ message: 'Gagal memuat statistik dashboard.' });
  }
});

export default router;
