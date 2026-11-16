import { Router } from 'express';
import { asc, eq } from 'drizzle-orm';
import { db } from '../../index';
import { pasien } from '../../schema';

const router = Router();

// GET all pasien
router.get('/', async (_req, res) => {
  try {
    const list = await db.select().from(pasien).orderBy(asc(pasien.idPasien));
    const formatted = list.map((p) => ({
      id_pasien: p.idPasien,
      idPasien: p.idPasien,
      nik: p.nik || '',
      nama_pasien: p.namaPasien || '',
      namaPasien: p.namaPasien || '',
      jenis_kelamin: p.jenisKelamin || 'L',
      jenisKelamin: p.jenisKelamin || 'L',
      tanggal_lahir: p.tanggalLahir || '',
      tanggalLahir: p.tanggalLahir || '',
      no_hp: p.noHp || '',
      noHp: p.noHp || '',
      alamat: p.alamat || '',
    }));
    return res.json(formatted);
  } catch (error) {
    console.error('Error fetch pasien:', error);
    return res.status(500).json({ message: 'Gagal mengambil data pasien.' });
  }
});

// POST new pasien
router.post('/', async (req, res) => {
  try {
    const { nik, nama_pasien, jenis_kelamin, tanggal_lahir, no_hp, alamat } = req.body;

    if (!nik || !nama_pasien || !tanggal_lahir || !no_hp || !alamat) {
      return res.status(400).json({ message: 'Semua kolom pasien wajib diisi.' });
    }

    const [newPasien] = await db
      .insert(pasien)
      .values({
        nik: String(nik).trim(),
        namaPasien: String(nama_pasien).trim(),
        jenisKelamin: String(jenis_kelamin || 'L'),
        tanggalLahir: String(tanggal_lahir),
        noHp: String(no_hp).trim(),
        alamat: String(alamat).trim(),
      })
      .returning();

    return res.status(201).json({
      message: 'Data pasien berhasil ditambahkan.',
      data: newPasien,
    });
  } catch (error: any) {
    console.error('Error insert pasien:', error);
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'NIK pasien sudah terdaftar di sistem.' });
    }
    return res.status(500).json({ message: 'Gagal menambahkan data pasien.' });
  }
});

// PUT update pasien
router.put('/:id', async (req, res) => {
  try {
    const { nik, nama_pasien, jenis_kelamin, tanggal_lahir, no_hp, alamat } = req.body;
    const id = Number(req.params.id);

    await db
      .update(pasien)
      .set({
        nik: String(nik).trim(),
        namaPasien: String(nama_pasien).trim(),
        jenisKelamin: String(jenis_kelamin || 'L'),
        tanggalLahir: String(tanggal_lahir),
        noHp: String(no_hp).trim(),
        alamat: String(alamat).trim(),
      })
      .where(eq(pasien.idPasien, id));

    return res.json({ message: 'Data pasien berhasil diperbarui.' });
  } catch (error: any) {
    console.error('Error update pasien:', error);
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'NIK pasien sudah digunakan oleh pasien lain.' });
    }
    return res.status(500).json({ message: 'Gagal memperbarui data pasien.' });
  }
});

// DELETE pasien
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(pasien).where(eq(pasien.idPasien, id));
    return res.json({ message: 'Data pasien berhasil dihapus.' });
  } catch (error: any) {
    console.error('Error delete pasien:', error);
    if (error.code === '23503' || error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        message: 'Pasien tidak dapat dihapus karena masih memiliki riwayat pendaftaran.',
      });
    }
    return res.status(500).json({ message: 'Gagal menghapus data pasien.' });
  }
});

export default router;
