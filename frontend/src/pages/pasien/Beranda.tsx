import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, FileText, Clock, FilePlus2, Info, ArrowRight} from 'lucide-react';
import api from '../../api/axios.ts';
import BottomNav from '../../components/NavbarPasien.tsx';
import styles from '../pasien/css/Beranda.module.css';

const Beranda: FC = () => {
  const navigate = useNavigate();
  const [activeQueueInfo, setActiveQueueInfo] = useState<string>('Daftar antrean secara online dengan mudah dan cepat.');

  // Contoh opsional: Cek status antrean aktif pasien secara real-time jika sudah login
  useEffect(() => {
    const fetchActiveQueue = async () => {
      try {
        const pasienData = localStorage.getItem('pasien');
        if (pasienData) {
          const pasien = JSON.parse(pasienData);
          const response = await api.get(`/pasien/status-aktif/${pasien.id_pasien}`);
          if (response.data && response.data.nomor_antrean) {
            setActiveQueueInfo(`Nomor Antrean Anda: ${response.data.nomor_antrean} (${response.data.status_antrean})`);
          }
        }
      } catch (err) {
        console.error('Gagal memuat status antrean aktif:', err);
      }
    };

    fetchActiveQueue();
  }, []);

  // Fungsi navigasi dengan proteksi login
  const handleProtectedNavigation = (targetPath: string) => {
    const pasienData = localStorage.getItem('pasien');
    if (!pasienData) {
      navigate('/pasien/login', { state: { redirectTo: targetPath } });
    } else {
      navigate(targetPath);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.beranda}>
        <div className={styles.divscreen}>
          
          {/* Navbar */}
          <div className={styles.divnavbar}>
            <div className={styles.divbrand} onClick={() => navigate('/pasien/beranda')}>
              <HeartPulse className={styles.brandIcon} size={28} color="#1e5eff" strokeWidth={2.3} />
              <b className={styles.clinic}>Klinik</b>
            </div>
            {/* <button 
              type="button" 
              className={styles.menuBtn} 
              onClick={() => handleProtectedNavigation('/pasien/akun')}
              aria-label="Menu Akun"
            >
              <Menu size={24} color="#1b2a4a" />
            </button> */}
          </div>

          {/* Hero Section */}
          <div className={styles.divhero}>
            <b className={styles.selamatDatangDi}>
              Selamat Datang<br />di Klinik Sehat<br />Bersama
            </b>
            <div className={styles.daftarAntreanSecara}>
              {activeQueueInfo}
            </div>
            <button 
              type="button"
              className={styles.buttoncta}
              onClick={() => handleProtectedNavigation('/pasien/pendaftaran')}
            >
              <b className={styles.clinic}>Daftar Sekarang</b>
              <ArrowRight size={16} color="#ffffff" strokeWidth={2.5} />
            </button>
            
            {/* Ilustrasi Dokter */}
            <img 
              className={styles.dokter1Icon} 
              src="/ilustrasi_dokter.png" 
              alt="Ilustrasi Dokter Klinik Sehat Bersama" 
            />
          </div>

          {/* Menu Utama */}
          <div className={styles.divsection}>
            <div className={styles.h2}>
              <b className={styles.menuUtama}>Menu Utama</b>
            </div>
            <div className={styles.divmenus}>
              {/* Menu 1: Antrean Online / Pendaftaran */}
              <div 
                className={styles.divmenu} 
                onClick={() => handleProtectedNavigation('/pasien/pendaftaran')}
              >
                <div className={styles.diviconCircle}>
                  <FileText size={24} color="#1e5eff" />
                </div>
                <div className={styles.antreanOnline}>Antrean Online</div>
              </div>

              {/* Menu 2: Cek Status */}
              <div 
                className={styles.divmenu} 
                onClick={() => handleProtectedNavigation('/pasien/status-antrean')}
              >
                <div className={styles.diviconCircle}>
                  <Clock size={24} color="#1e5eff" />
                </div>
                <div className={styles.antreanOnline}>Cek Status</div>
              </div>

              {/* Menu 3: Riwayat Pemeriksaan */}
              <div 
                className={styles.divmenu3} 
                onClick={() => handleProtectedNavigation('/pasien/riwayat')}
              >
                <div className={styles.diviconCircle}>
                  <FilePlus2 size={24} color="#1e5eff" />
                </div>
                <div className={styles.antreanOnline}>Riwayat<br />Pemeriksaan</div>
              </div>
            </div>
          </div>

          {/* Info Jam Pelayanan */}
          <div className={styles.divinfo}>
            <Info className={styles.frameIcon6} size={26} color="#1e5eff" />
            <div className={styles.div}>
              <div className={styles.jamPelayananSeninsabtuContainer}>
                <b className={styles.jamPelayanan}>Jam pelayanan<br /></b>
                <span className={styles.seninsabtu08001600Pend}>
                  Senin–Sabtu, 08:00–16:00. Pendaftaran ditutup pukul 15:00.
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Navigation Bar */}
          <BottomNav/>

        </div>
      </div>
    </div>
  );
};

export default Beranda;