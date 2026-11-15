import { Router } from 'express';
import { db } from '../../index';
import { pasien } from '../../schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Endpoint Login Pasien: POST /api/pasien/login
router.post('/login', async (req, res) => {
  try {
    const { nama_pasien, nik } = req.body;

    if (!nama_pasien || !nik) {
      return res.status(400).json({ message: 'Nama dan NIK harus diisi!' });
    }

    // Cari data pasien berdasarkan nama dan NIK
    const hasilPasien = await db
      .select()
      .from(pasien)
      .where(and(eq(pasien.namaPasien, nama_pasien), eq(pasien.nik, nik)))
      .limit(1);

    if (hasilPasien.length === 0) {
      return res.status(401).json({ message: 'Nama atau NIK salah! Pasien tidak ditemukan.' });
    }

    return res.status(200).json({
      message: 'Login berhasil',
      pasien: hasilPasien[0]
    });
  } catch (error) {
    console.error('Error saat login pasien:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server database.' });
  }
});

// Endpoint Registrasi Pasien: POST /api/pasien/register
router.post('/register', async (req, res) => {
  try {
    const { nik, nama_pasien, jenis_kelamin, tanggal_lahir, no_hp, alamat } = req.body;

    if (!nik || !nama_pasien || !tanggal_lahir || !no_hp || !alamat) {
      return res.status(400).json({ message: 'Semua kolom wajib diisi!' });
    }

    // Masukkan data ke tabel pasien (tanggal_lahir langsung dikirim sebagai string karena mode: 'string')
    const newPasien = await db.insert(pasien).values({
      nik: nik,
      namaPasien: nama_pasien,
      jenisKelamin: jenis_kelamin,
      tanggalLahir: tanggal_lahir, // <-- Langsung string (misal: "2001-05-12")
      noHp: no_hp,
      alamat: alamat
    });

    return res.status(201).json({
      message: 'Registrasi berhasil',
      data: newPasien
    });
  } catch (error) {
    console.error('Error saat registrasi pasien:', error);
    return res.status(500).json({ message: 'Registrasi gagal. NIK mungkin sudah terdaftar.' });
  }
});

export default router;