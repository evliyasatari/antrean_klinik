import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '../../';
import { petugas } from '../../schema';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_klinik_default_123';

router.post('/login', async (req, res) => {
  try {
    const { nama_petugas, nip } = req.body;
    if (!nama_petugas || !nip) {
      return res.status(400).json({ message: 'Nama petugas dan NIP wajib diisi.' });
    }

    const result = await db
      .select()
      .from(petugas)
      .where(
        and(
          eq(sql`LOWER(${petugas.namaPetugas})`, nama_petugas.toLowerCase()),
          eq(petugas.nip, nip)
        )
      )
      .limit(1);

    const userPetugas = result[0];
    if (!userPetugas) {
      return res.status(401).json({ message: 'Nama petugas atau NIP tidak sesuai.' });
    }

    const token = jwt.sign(
      { id: userPetugas.idPetugas, nama: userPetugas.namaPetugas },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({ message: 'Login berhasil', token, petugas: userPetugas });
  } catch (error) {
    console.error('Error login:', error);
    return res.status(500).json({ message: 'Kesalahan pada server.' });
  }
});

export default router;