import type { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, User, FileText, Clock } from 'lucide-react';
import styles from './NavbarPasien.module.css';

const BottomNav: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper untuk mengecek apakah tab sedang aktif berdasarkan URL saat ini
  const isActive = (path: string) => location.pathname === path;

  // Fungsi proteksi login untuk menu tertentu
  const handleNavClick = (targetPath: string, isProtected: boolean = false) => {
    if (isProtected) {
      const pasienData = localStorage.getItem('pasien');
      if (!pasienData) {
        navigate('/pasien/login', { state: { redirectTo: targetPath } });
        return;
      }
    }
    navigate(targetPath);
  };

  return (
    <div className={styles.divbottomNav}>
      {/* Beranda */}
      <div 
        className={isActive('/pasien/beranda') ? styles.divtabActive : styles.divtab} 
        onClick={() => handleNavClick('/pasien/beranda')}
      >
        <Home size={22} color={isActive('/pasien/beranda') ? '#1e5eff' : '#8a94a6'} />
        <span className={isActive('/pasien/beranda') ? styles.textActive : styles.text}>Beranda</span>
      </div>

      {/* Antrean */}
      <div 
        className={isActive('/pasien/nomor-antrean') ? styles.divtabActive : styles.divtab} 
        onClick={() => handleNavClick('/pasien/nomor-antrean', true)}
      >
        <FileText size={22} color={isActive('/pasien/nomor-antrean') ? '#1e5eff' : '#8a94a6'} />
        <span className={isActive('/pasien/nomor-antrean') ? styles.textActive : styles.text}>Antrean</span>
      </div>

      {/* Riwayat */}
      <div 
        className={isActive('/pasien/riwayat') ? styles.divtabActive : styles.divtab} 
        onClick={() => handleNavClick('/pasien/riwayat', true)}
      >
        <Clock size={22} color={isActive('/pasien/riwayat') ? '#1e5eff' : '#8a94a6'} />
        <span className={isActive('/pasien/riwayat') ? styles.textActive : styles.text}>Riwayat</span>
      </div>

      {/* Akun */}
      <div 
        className={isActive('/pasien/akun') ? styles.divtabActive : styles.divtab} 
        onClick={() => handleNavClick('/pasien/akun', true)}
      >
        <User size={22} color={isActive('/pasien/akun') ? '#1e5eff' : '#8a94a6'} />
        <span className={isActive('/pasien/akun') ? styles.textActive : styles.text}>Akun</span>
      </div>
    </div>
  );
};

export default BottomNav;