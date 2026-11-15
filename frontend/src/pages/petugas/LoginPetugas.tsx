import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, User, BadgeCheck, Eye, EyeOff, ArrowRight } from 'lucide-react';
import api from '../../api/axios';
import styles from './css/LoginPetugas.module.css';

export default function LoginPetugas() {
  const navigate = useNavigate();

  const [namaPetugas, setNamaPetugas] = useState('');
  const [nip, setNip] = useState('');
  const [showNip, setShowNip] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const response = await api.post('/petugas/login', {
        nama_petugas: namaPetugas.trim(),
        nip: nip.trim(),
      });

      // Simpan token dan data petugas ke localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('petugas', JSON.stringify(response.data.petugas));

      navigate('/petugas/dashboard');
    } catch (error: any) {
      console.error('Login gagal:', error);
      setErrorMsg(
        error.response?.data?.message ||
          'Nama petugas atau NIP tidak sesuai, atau server belum terhubung.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.loginCard}>
        {/* Bagian Konten Form */}
        <div className={styles.cardContent}>
          <div className={styles.brandHeader}>
            <div className={styles.logoBox}>
              <HeartPulse size={26} color="#1e5eff" />
            </div>
            <div>
              <h2>Klinik Admin</h2>
              <p>Portal Petugas & Pelayanan Klinik</p>
            </div>
          </div>

          {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="namaPetugas">Nama Petugas</label>
              <div className={styles.inputWrapper}>
                <User size={18} color="#94a3b8" />
                <input
                  id="namaPetugas"
                  type="text"
                  required
                  value={namaPetugas}
                  onChange={(e) => setNamaPetugas(e.target.value)}
                  placeholder="Masukkan nama lengkap petugas"
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="nip">NIP (Nomor Induk Pegawai)</label>
              <div className={styles.inputWrapper}>
                <BadgeCheck size={18} color="#94a3b8" />
                <input
                  id="nip"
                  type={showNip ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  value={nip}
                  onChange={(e) => {
                    const hanyaAngka = e.target.value.replace(/\D/g, '');
                    setNip(hanyaAngka);
                  }}
                  placeholder="Masukkan NIP (hanya angka)"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowNip(!showNip)}
                  tabIndex={-1}
                >
                  {showNip ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              <span>{loading ? 'Memproses...' : 'Masuk ke Dashboard'}</span>
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>

        {/* Dekorasi Wave Biru & Garis Detak Jantung di Bagian Bawah */}
        <div className={styles.waveFooter}>
          <svg
            viewBox="0 0 500 110"
            preserveAspectRatio="none"
            className={styles.waveSvg}
          >
            {/* Wave Lapisan Belakang */}
            <path
              d="M0,45 C130,15 240,85 380,45 C440,28 475,18 500,22 L500,110 L0,110 Z"
              fill="#dbeafe"
              opacity="0.75"
            />
            {/* Wave Lapisan Depan */}
            <path
              d="M0,75 C90,90 180,35 310,55 C410,70 465,40 500,30 L500,110 L0,110 Z"
              fill="#bfdbfe"
              opacity="0.85"
            />
            {/* Garis Detak Jantung (Pulse) */}
            <path
              d="M75,62 L135,62 L145,56 L155,62 L270,62 L285,62 L298,35 L312,82 L326,48 L336,62 L375,62 L392,28 L408,78 L420,52 L430,62 L495,62"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}