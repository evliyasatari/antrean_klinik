import { Router } from 'express';
import { asc, eq } from 'drizzle-orm';
import { db } from '../../';
import { poli } from '../../schema';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const data = await db.select().from(poli).orderBy(asc(poli.idPoli));
    const formatted = data.map((p) => ({
      id_poli: p.idPoli,
      idPoli: p.idPoli,
      nama_poli: p.namaPoli,
      namaPoli: p.namaPoli,
      kode_antrean: p.kodeAntrean,
      kodeAntrean: p.kodeAntrean,
    }));
    return res.json(formatted);
  } catch (error) {
    return res.status(500).json({ message: 'Gagal mengambil data poli.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nama_poli, kode_antrean } = req.body;
    await db.insert(poli).values({
      namaPoli: nama_poli,
      kodeAntrean: kode_antrean.toUpperCase(),
    });
    return res.status(201).json({ message: 'Poli berhasil ditambahkan.' });
  } catch (error: any) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Kode antrean sudah digunakan.' });
    }
    return res.status(500).json({ message: 'Gagal menambah data poli.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { nama_poli, kode_antrean } = req.body;
    await db
      .update(poli)
      .set({ namaPoli: nama_poli, kodeAntrean: kode_antrean.toUpperCase() })
      .where(eq(poli.idPoli, Number(req.params.id)));
    return res.json({ message: 'Data poli berhasil diubah.' });
  } catch (error) {
    return res.status(500).json({ message: 'Gagal mengubah data poli.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.delete(poli).where(eq(poli.idPoli, Number(req.params.id)));
    return res.json({ message: 'Data poli berhasil dihapus.' });
  } catch (error: any) {
    if (error.code === '23503' || error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'Poli masih dipakai oleh data dokter.' });
    }
    return res.status(500).json({ message: 'Gagal menghapus poli.' });
  }
});

export default router;