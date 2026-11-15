import { useState, type FC, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import api from '../api/axios.ts';
import styles from '../pages/pasien/css/Login.module.css';

const LoginForm: FC = () => {
  const navigate = useNavigate();
  const [nama, setNama] = useState<string>('');
  const [nik, setNik] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fungsi agar NIK hanya bisa diisi angka
  const handleNikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, ''); // Hapus semua karakter selain angka
    setNik(numericValue);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !nik.trim()) {
      setErrorMsg('Nama dan NIK harus diisi!');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const response = await api.post('/pasien/login', {
        nama_pasien: nama,
        nik: nik
      });

      if (response.data && response.data.pasien) {
        localStorage.setItem('pasien', JSON.stringify(response.data.pasien));
        navigate('/pasien/beranda');
      } else {
        throw new Error('Data sesi pasien tidak valid.');
      }
    } catch (err: any) {
      console.error('Login gagal:', err);
      setErrorMsg(err.response?.data?.message || 'Login gagal. Periksa kembali Nama dan NIK Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className={styles.form}>
      {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}

      <div className={styles.inputGroup}>
        <label>Nama Lengkap</label>
        <div className={styles.inputWrapper}>
          <User size={18} color="#94a3b8" />
          <input 
            type="text"
            placeholder="Masukkan nama lengkap"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>NIK</label>
        <div className={styles.inputWrapper}>
          <Lock size={18} color="#94a3b8" />
          <input 
            type={showPassword ? 'text' : 'password'}
            placeholder="Masukkan NIK"
            value={nik}
            onChange={handleNikChange}
            inputMode="numeric"
            maxLength={20}
            required
          />
          {/* Tombol Toggle View Password */}
          <button 
            type="button" 
            className={styles.eyeBtn}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label="Sembunyikan atau tampilkan password"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className={styles.divrow}>
        <div className={styles.divcheck}>
          <input type="checkbox" id="ingat" style={{ width: '16px', height: '16px', accentColor: '#1e5eff' }} />
          <label htmlFor="ingat" style={{ cursor: 'pointer', color: '#5b6b8a', fontSize: '13px' }}>Ingat saya</label>
        </div>
      </div>

      <button type="submit" className={styles.submitBtn} disabled={loading}>
        <span>{loading ? 'Memproses...' : 'Masuk ke Beranda'}</span>
        {!loading && <ArrowRight size={18} />}
      </button>
    </form>
  );
};

export default LoginForm;