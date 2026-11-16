import { Router } from 'express';
import { asc, eq } from 'drizzle-orm';
import { db } from '../index';
import { dokter, poli } from '../schema';

const router = Router();

// GET all dokter
router.get('/', async (_req, res) => {
  try {
    const list = await db
      .select({
        idDokter: dokter.idDokter,
        namaDokter: dokter.namaDokter,
        idPoli: dokter.idPoli,
        noHp: dokter.noHp,
        namaPoli: poli.namaPoli,
      })
      .from(dokter)
      .leftJoin(poli, eq(dokter.idPoli, poli.idPoli))
      .orderBy(asc(dokter.idDokter));

    const formatted = list.map((d) => ({
      id_dokter: d.idDokter,
      idDokter: d.idDokter,
      nama_dokter: d.namaDokter,
      namaDokter: d.namaDokter,
      id_poli: d.idPoli,
      idPoli: d.idPoli,
      no_hp: d.noHp,
      noHp: d.noHp,
      nama_poli: d.namaPoli || '',
      namaPoli: d.namaPoli || '',
    }));

    return res.json(formatted);
  } catch (error) {
    console.error('Error fetch dokter:', error);
    return res.status(500).json({ message: 'Gagal mengambil data dokter.' });
  }
});

// POST new dokter
router.post('/', async (req, res) => {
  try {
    const { nama_dokter, id_poli, no_hp } = req.body;
    await db.insert(dokter).values({
      namaDokter: nama_dokter,
      idPoli: Number(id_poli),
      noHp: no_hp,
    });
    return res.status(201).json({ message: 'Dokter berhasil ditambahkan.' });
  } catch (error) {
    console.error('Error create dokter:', error);
    return res.status(500).json({ message: 'Gagal menambahkan data dokter.' });
  }
});

// PUT update dokter
router.put('/:id', async (req, res) => {
  try {
    const { nama_dokter, id_poli, no_hp } = req.body;
    await db
      .update(dokter)
      .set({
        namaDokter: nama_dokter,
        idPoli: Number(id_poli),
        noHp: no_hp,
      })
      .where(eq(dokter.idDokter, Number(req.params.id)));
    return res.json({ message: 'Data dokter berhasil diubah.' });
  } catch (error) {
    console.error('Error update dokter:', error);
    return res.status(500).json({ message: 'Gagal mengubah data dokter.' });
  }
});

// DELETE dokter
router.delete('/:id', async (req, res) => {
  try {
    await db.delete(dokter).where(eq(dokter.idDokter, Number(req.params.id)));
    return res.json({ message: 'Dokter berhasil dihapus.' });
  } catch (error: any) {
    if (error.code === '23503' || error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'Dokter masih memiliki riwayat pendaftaran.' });
    }
    return res.status(500).json({ message: 'Gagal menghapus data dokter.' });
  }
});

export default router;
