import { useState, type FC, type FormEvent } from 'react';
import { User, CreditCard, Phone, MapPin, Calendar, Users, UserPlus } from 'lucide-react';
import api from '../api/axios.ts';
import styles from '../pages/pasien/css/Login.module.css';

interface RegisterFormProps {
  onSuccess: () => void;
}

const RegisterForm: FC<RegisterFormProps> = ({ onSuccess }) => {
  const [namaPasien, setNamaPasien] = useState<string>('');
  const [nik, setNik] = useState<string>('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [tanggalLahir, setTanggalLahir] = useState<string>('');
  const [noHp, setNoHp] = useState<string>('');
  const [alamat, setAlamat] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!namaPasien || !nik || !tanggalLahir || !noHp || !alamat) {
      setErrorMsg('Semua kolom wajib diisi!');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const payload = {
        nik,
        nama_pasien: namaPasien,
        jenis_kelamin: jenisKelamin,
        tanggal_lahir: tanggalLahir,
        no_hp: noHp,
        alamat
      };

      const response = await api.post('/pasien/register', payload);

      if (response.status === 201 || response.data) {
        alert('Registrasi berhasil! Silakan masuk menggunakan Nama dan NIK Anda.');
        onSuccess(); // Pindah otomatis ke tab Masuk
      }
    } catch (err: any) {
      console.error('Registrasi gagal:', err);
      setErrorMsg(err.response?.data?.message || 'Registrasi gagal. NIK mungkin sudah terdaftar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className={styles.form}>
      {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}

      <div className={styles.inputGroup}>
        <label>Nama Lengkap</label>
        <div className={styles.inputWrapper}>
          <User size={18} color="#94a3b8" />
          <input 
            type="text"
            placeholder="Masukkan nama lengkap"
            value={namaPasien}
            onChange={(e) => setNamaPasien(e.target.value)}
            required
          />
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>NIK</label>
        <div className={styles.inputWrapper}>
          <CreditCard size={18} color="#94a3b8" />
          <input 
            type="text"
            placeholder="Nomor Induk Kependudukan"
            value={nik}
            onChange={(e) => setNik(e.target.value)}
            maxLength={20}
            required
          />
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>Jenis Kelamin</label>
        <div className={styles.inputWrapper}>
          <Users size={18} color="#94a3b8" />
          <select 
            value={jenisKelamin} 
            onChange={(e) => setJenisKelamin(e.target.value as 'L' | 'P')}
          >
            <option value="L">Laki-laki (L)</option>
            <option value="P">Perempuan (P)</option>
          </select>
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>Tanggal Lahir</label>
        <div className={styles.inputWrapper}>
          <Calendar size={18} color="#94a3b8" />
          <input 
            type="date"
            value={tanggalLahir}
            onChange={(e) => setTanggalLahir(e.target.value)}
            required
          />
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>No. HP</label>
        <div className={styles.inputWrapper}>
          <Phone size={18} color="#94a3b8" />
          <input 
            type="tel"
            placeholder="Contoh: 08123456789"
            value={noHp}
            onChange={(e) => setNoHp(e.target.value)}
            required
          />
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>Alamat</label>
        <div className={styles.inputWrapper}>
          <MapPin size={18} color="#94a3b8" />
          <input 
            type="text"
            placeholder="Alamat domisili saat ini"
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            required
          />
        </div>
      </div>

      <button type="submit" className={styles.submitBtn} disabled={loading}>
        <span>{loading ? 'Memproses...' : 'Daftar Akun Baru'}</span>
        {!loading && <UserPlus size={18} />}
      </button>
    </form>
  );
};

export default RegisterForm;