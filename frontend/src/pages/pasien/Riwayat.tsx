import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, ChevronRight, Stethoscope, FileText } from 'lucide-react';
import api from '../../api/axios.ts';
import BottomNav from '../../components/NavbarPasien.tsx';
import styles from '../pasien/css/Riwayat.module.css';

// Tipe data riwayat pemeriksaan yang diterima dari backend
interface RiwayatItem {
  id_pendaftaran: number;
  tgl_kunjungan: string;
  nama_poli: string;
  nama_dokter: string;
  keluhan: string;
  nomor_antrean: string | null;
  status_antrean: 'menunggu' | 'dipanggil' | 'selesai' | null;
  status_pendaftaran: 'terdaftar' | 'dibatalkan';
}

const RiwayatPasien: FC = () => {
  const navigate = useNavigate();
  const [riwayatList, setRiwayatList] = useState<RiwayatItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<RiwayatItem | null>(null);

  useEffect(() => {
    const fetchRiwayat = async () => {
      const pasienData = localStorage.getItem('pasien');
      if (!pasienData) {
        navigate('/pasien/login', { state: { redirectTo: '/pasien/riwayat' } });
        return;
      }

      try {
        setLoading(true);
        setErrorMsg(null);
        const parsed = JSON.parse(pasienData);
        const idPasien = parsed.idPasien || parsed.id_pasien;

        // Panggil endpoint backend untuk mengambil riwayat pendaftaran pasien
        const response = await api.get(`/pasien/riwayat/${idPasien}`);
        setRiwayatList(response.data);
      } catch (err: any) {
        console.error('Gagal memuat riwayat:', err);
        setErrorMsg('Gagal mengambil data riwayat dari server.');
      } finally {
        setLoading(false);
      }
    };

    fetchRiwayat();
  }, [navigate]);

  // Helper format tanggal menjadi "14 Okt 2026"
  const formatTanggal = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Helper warna & teks badge status
  const getBadgeStyle = (item: RiwayatItem) => {
    if (item.status_pendaftaran === 'dibatalkan') {
      return { text: 'Dibatalkan', bg: '#fee2e2', color: '#dc2626' };
    }
    if (item.status_antrean === 'selesai') {
      return { text: 'Selesai', bg: '#dcfce7', color: '#16a34a' };
    }
    if (item.status_antrean === 'dipanggil') {
      return { text: 'Dipanggil', bg: '#dbeafe', color: '#1e5eff' };
    }
    return { text: 'Menunggu', bg: '#fef3c7', color: '#d97706' };
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.riwayat}>
        <div className={styles.divscreen}>
          
          {/* Appbar / Header */}
          <div className={styles.divappbar}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
            >
              <ArrowLeft color="#ffffff" size={24} />
            </button>
            <b className={styles.riwayatPemeriksaan}>Riwayat Pemeriksaan</b>
          </div>

          {/* Konten Utama */}
          <div className={styles.divcontent}>
            <div className={styles.divsubmargin}>
              <div className={styles.divsub}>
                <div className={styles.daftarKunjunganAnda}>Daftar kunjungan Anda ke klinik.</div>
              </div>
            </div>

            {errorMsg && (
              <div style={{ width: '100%', padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '10px', fontSize: '13px', boxSizing: 'border-box' }}>
                {errorMsg}
              </div>
            )}

            {loading ? (
              <div style={{ width: '100%', textAlign: 'center', padding: '40px 0', color: '#5b6b8a', fontSize: '14px' }}>
                Memuat riwayat pemeriksaan...
              </div>
            ) : riwayatList.length === 0 ? (
              <div style={{ width: '100%', textAlign: 'center', padding: '48px 20px', background: '#fff', borderRadius: '16px', boxSizing: 'border-box', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                <FileText size={40} color="#cbd5e1" style={{ marginBottom: '10px' }} />
                <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: '#1b2a4a', fontSize: '15px' }}>Belum Ada Riwayat</p>
                <p style={{ margin: 0, color: '#8a94a6', fontSize: '13px' }}>Anda belum memiliki catatan kunjungan atau pendaftaran.</p>
              </div>
            ) : (
              riwayatList.map((item) => {
                const badge = getBadgeStyle(item);
                return (
                  <div 
                    key={item.id_pendaftaran} 
                    className={styles.divitem}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className={styles.diviconCircle}>
                      <Calendar size={22} color="#1e5eff" />
                    </div>
                    <div className={styles.divmeta}>
                      <div className={styles.divsub}>
                        <div className={styles.tanggalText}>{formatTanggal(item.tgl_kunjungan)}</div>
                      </div>
                      <div className={styles.divname}>
                        <b className={styles.poliText}>{item.nama_poli}</b>
                      </div>
                      <div style={{ fontSize: '11px', color: '#8a94a6' }}>{item.nama_dokter}</div>
                    </div>
                    <div 
                      className={styles.divbadge} 
                      style={{ backgroundColor: badge.bg, color: badge.color }}
                    >
                      <b>{badge.text}</b>
                    </div>
                    <ChevronRight size={18} color="#8a94a6" />
                  </div>
                );
              })
            )}
          </div>

          {/* Modal Detail Pemeriksaan (Muncul saat kartu diklik) */}
          {selectedItem && (
            <div 
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(27, 42, 74, 0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
              onClick={() => setSelectedItem(null)}
            >
              <div 
                style={{ backgroundColor: '#fff', width: '100%', maxWidth: '370px', borderRadius: '20px', padding: '24px', boxSizing: 'border-box', color: '#1b2a4a' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eaf2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Stethoscope size={20} color="#1e5eff" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>{selectedItem.nama_poli}</h3>
                    <span style={{ fontSize: '12px', color: '#5b6b8a' }}>{formatTanggal(selectedItem.tgl_kunjungan)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', borderTop: '1px solid #e3e9f3', paddingTop: '14px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#5b6b8a' }}>Nomor Antrean</span>
                    <b>{selectedItem.nomor_antrean || '-'}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#5b6b8a' }}>Dokter Pemeriksa</span>
                    <b>{selectedItem.nama_dokter}</b>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                    <span style={{ color: '#5b6b8a' }}>Keluhan:</span>
                    <div style={{ background: '#f4f8ff', padding: '10px 12px', borderRadius: '10px', color: '#1b2a4a' }}>
                      {selectedItem.keluhan || 'Tidak ada catatan keluhan.'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  style={{ width: '100%', height: '44px', borderRadius: '12px', background: '#1e5eff', color: '#fff', border: 'none', fontWeight: 600, fontFamily: 'Poppins', cursor: 'pointer' }}
                >
                  Tutup
                </button>
              </div>
            </div>
          )}

          {/* Gunakan komponen BottomNav terpisah */}
          <BottomNav />

        </div>
      </div>
    </div>
  );
};

export default RiwayatPasien;