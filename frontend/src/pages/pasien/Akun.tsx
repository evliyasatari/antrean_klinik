import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {CreditCard, Phone, MapPin, Calendar, Users, LogOut, ShieldCheck } from 'lucide-react';
import BottomNav from '../../components/NavbarPasien.tsx';
import styles from '../pasien/css/Akun.module.css';

interface PasienData {
  idPasien?: number;
  id_pasien?: number;
  namaPasien?: string;
  nama_pasien?: string;
  nik?: string;
  jenisKelamin?: string;
  jenis_kelamin?: string;
  tanggalLahir?: string;
  tanggal_lahir?: string;
  noHp?: string;
  no_hp?: string;
  alamat?: string;
}

const Akun: FC = () => {
  const navigate = useNavigate();
  const [pasien, setPasien] = useState<PasienData | null>(null);

  useEffect(() => {
    const pasienData = localStorage.getItem('pasien');
    if (!pasienData) {
      navigate('/pasien/login', { state: { redirectTo: '/pasien/akun' } });
      return;
    }

    try {
      const parsed = JSON.parse(pasienData);
      setPasien(parsed);
    } catch {
      navigate('/pasien/login');
    }
  }, [navigate]);

  // Fungsi Logout
  const handleLogout = () => {
    const konfirmasi = window.confirm('Apakah Anda yakin ingin keluar dari akun?');
    if (konfirmasi) {
      localStorage.removeItem('pasien');
      navigate('/pasien/login');
    }
  };

  // Ambil inisial nama untuk avatar
  const getInitials = (name?: string) => {
    if (!name) return 'P';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const namaLengkap = pasien?.namaPasien || pasien?.nama_pasien || 'Pasien Clinic';
  const nomorHp = pasien?.noHp || pasien?.no_hp || '-';
  const nomorNik = pasien?.nik || '-';
  const jenisKelaminText = (pasien?.jenisKelamin || pasien?.jenis_kelamin) === 'P' ? 'Perempuan' : 'Laki-laki';
  const tanggalLahirText = pasien?.tanggalLahir || pasien?.tanggal_lahir || '-';
  const alamatText = pasien?.alamat || '-';

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.akun}>
        <div className={styles.divscreen}>
          
          {/* Appbar / Header */}
          <div className={styles.divappbar}>
            <b className={styles.ap}>Akun Saya</b>
          </div>

          {/* Konten Utama */}
          <div className={styles.divcontent}>
            
            {/* Profil Ringkas */}
            <div className={styles.divprofile}>
              <div className={styles.divavatar}>
                <b className={styles.avatarText}>{getInitials(namaLengkap)}</b>
              </div>
              <div className={styles.divwho}>
                <div className={styles.divname}>
                  <b className={styles.andiPratama}>{namaLengkap}</b>
                </div>
                <div className={styles.divsub}>
                  <div className={styles.andiPratama}>{nomorHp}</div>
                </div>
              </div>
            </div>

            {/* Kartu Informasi Data Diri */}
            <div className={styles.divgroup}>
              <div style={{ padding: '16px 20px 8px', fontSize: '13px', fontWeight: 600, color: '#1e5eff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} />
                <span>Informasi Data Diri Pasien</span>
              </div>

              {/* NIK */}
              <div className={styles.divrow}>
                <div className={styles.diviconCircle}>
                  <CreditCard size={18} color="#1e5eff" />
                </div>
                <div className={styles.divtxt}>
                  <div className={styles.dataDiriLabel}>NIK</div>
                  <div className={styles.dataDiriValue}>{nomorNik}</div>
                </div>
              </div>

              {/* Jenis Kelamin */}
              <div className={styles.divrow}>
                <div className={styles.diviconCircle}>
                  <Users size={18} color="#1e5eff" />
                </div>
                <div className={styles.divtxt}>
                  <div className={styles.dataDiriLabel}>Jenis Kelamin</div>
                  <div className={styles.dataDiriValue}>{jenisKelaminText}</div>
                </div>
              </div>

              {/* Tanggal Lahir */}
              <div className={styles.divrow}>
                <div className={styles.diviconCircle}>
                  <Calendar size={18} color="#1e5eff" />
                </div>
                <div className={styles.divtxt}>
                  <div className={styles.dataDiriLabel}>Tanggal Lahir</div>
                  <div className={styles.dataDiriValue}>{tanggalLahirText}</div>
                </div>
              </div>

              {/* No HP */}
              <div className={styles.divrow}>
                <div className={styles.diviconCircle}>
                  <Phone size={18} color="#1e5eff" />
                </div>
                <div className={styles.divtxt}>
                  <div className={styles.dataDiriLabel}>Nomor HP / WhatsApp</div>
                  <div className={styles.dataDiriValue}>{nomorHp}</div>
                </div>
              </div>

              {/* Alamat */}
              <div className={styles.divrow3}>
                <div className={styles.diviconCircle}>
                  <MapPin size={18} color="#1e5eff" />
                </div>
                <div className={styles.divtxt}>
                  <div className={styles.dataDiriLabel}>Alamat Domisili</div>
                  <div className={styles.dataDiriValue}>{alamatText}</div>
                </div>
              </div>
            </div>

            {/* Tombol Logout */}
            <button 
              type="button" 
              className={styles.buttonlogout}
              onClick={handleLogout}
              style={{ cursor: 'pointer', width: '100%', border: '1px solid #f3c4c6' }}
            >
              <LogOut size={18} color="#e5484d" />
              <b className={styles.edit}>Keluar (Logout)</b>
            </button>

            {/* Versi Aplikasi */}
            <div className={styles.divver}>
              <div className={styles.edit}>ClinicQueue versi 1.0</div>
            </div>

          </div>

          {/* Gunakan komponen BottomNav terpisah */}
          <BottomNav />

        </div>
      </div>
    </div>
  );
};

export default Akun;