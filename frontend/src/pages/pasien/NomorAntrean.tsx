import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, Clock, Info, AlertCircle } from 'lucide-react';
import api from '../../api/axios.ts';
import styles from '../pasien/css/NomorAntrean.module.css';
import BottomNav from '../../components/NavbarPasien.tsx';

interface AntreanTicketData {
  nomor_antrean: string;
  nama_poli: string;
  estimasi_waktu?: string;
  posisi_antrean?: number;
}

const NomorAntrean: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Cek apakah halaman ini dibuka langsung setelah submit pendaftaran
  const isBaruDaftar = Boolean(location.state?.antreanBaru);

  const [ticketData, setTicketData] = useState<AntreanTicketData | null>(
    location.state?.antreanBaru || null
  );
  const [loading, setLoading] = useState<boolean>(!isBaruDaftar);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isBaruDaftar && location.state?.antreanBaru) {
      setTicketData(location.state.antreanBaru);
      setLoading(false);
      return;
    }

    const fetchActiveAntrean = async () => {
      const pasienData = localStorage.getItem('pasien');
      if (!pasienData) {
        navigate('/pasien/login', { state: { redirectTo: '/pasien/nomor-antrean' } });
        return;
      }

      try {
        setLoading(true);
        setErrorMsg(null);
        const parsed = JSON.parse(pasienData);
        const idPasien = parsed.idPasien || parsed.id_pasien;

        const response = await api.get(`/pasien/status-aktif/${idPasien}`);
        setTicketData(response.data);
      } catch (err: any) {
        console.error('Gagal mengambil nomor antrean:', err);
        setErrorMsg(err.response?.data?.message || 'Anda belum memiliki nomor antrean aktif hari ini.');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveAntrean();
  }, [isBaruDaftar, location.state, navigate]);

  const getEstimasiText = () => {
    if (ticketData?.estimasi_waktu) return ticketData.estimasi_waktu;
    const posisi = ticketData?.posisi_antrean || 1;
    return `± ${posisi * 15} menit`;
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.nomorAntrean}>
        <div className={styles.divscreen}>
          
          {/* Appbar / Header */}
          <div className={styles.divappbar}>
            <button
              type="button"
              onClick={() => navigate('/pasien/beranda')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
            >
              <ArrowLeft color="#1b2a4a" size={24} />
            </button>
            <b className={styles.headerTitle}>Nomor Antrean</b>
          </div>

          <div className={styles.divcontent}>
            {loading ? (
              <div style={{ marginTop: '100px', color: '#5b6b8a', fontSize: '14px', textAlign: 'center' }}>
                Memuat tiket antrean Anda...
              </div>
            ) : errorMsg ? (
              <div style={{ width: '100%', textAlign: 'center', padding: '48px 20px', background: '#fff', borderRadius: '20px', boxSizing: 'border-box', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginTop: '20px' }}>
                <AlertCircle size={44} color="#f59e0b" style={{ marginBottom: '12px' }} />
                <h3 style={{ margin: '0 0 8px 0', color: '#1b2a4a', fontSize: '18px' }}>Belum Ada Antrean</h3>
                <p style={{ margin: '0 0 24px 0', color: '#5b6b8a', fontSize: '13px', lineHeight: '20px' }}>{errorMsg}</p>
                <button
                  type="button"
                  className={styles.buttonbtn}
                  onClick={() => navigate('/pasien/pendaftaran')}
                >
                  <b>Daftar Antrean Sekarang</b>
                </button>
                <button
                  type="button"
                  className={styles.buttonbtn2}
                  style={{ marginTop: '12px' }}
                  onClick={() => navigate('/pasien/beranda')}
                >
                  <b>Kembali ke Beranda</b>
                </button>
              </div>
            ) : ticketData && (
              <>
                {/* Bagian Ikon Checkmark Hijau: HANYA tampil jika baru selesai mendaftar */}
                {isBaruDaftar && (
                  <div className={styles.divsuccess}>
                    <span className={styles.confettiDot1} />
                    <span className={styles.confettiDot2} />
                    <span className={styles.confettiLine1} />
                    <span className={styles.confettiLine2} />
                    <div className={styles.divcircle}>
                      <div className={styles.divcircleshadow} />
                      <Check size={44} color="#ffffff" strokeWidth={3.5} style={{ position: 'relative', zIndex: 2 }} />
                    </div>
                  </div>
                )}

                {/* Judul Dinamis */}
                <div className={styles.h1}>
                  <b className={styles.pendaftaranBerhasil}>
                    {isBaruDaftar ? 'Pendaftaran Berhasil!' : 'Nomor Antrean Anda'}
                  </b>
                </div>

                <div className={styles.psub}>
                  <div className={styles.pendaftaranBerhasil}>
                    {isBaruDaftar 
                      ? 'Berikut nomor antrean Anda:' 
                      : 'Simpan atau tunjukkan tiket digital ini di klinik:'}
                  </div>
                </div>

                {/* Kartu Tiket Nomor Antrean */}
                <div className={styles.divticket}>
                  <div className={styles.divlabel}>
                    <div>Nomor Antrean</div>
                  </div>
                  <div className={styles.divnumber}>
                    <b className={styles.a001}>{ticketData.nomor_antrean}</b>
                  </div>
                  <div className={styles.divpoli}>
                    <b>{ticketData.nama_poli}</b>
                  </div>

                  <div className={styles.divsepmargin}>
                    <div className={styles.divsep} />
                  </div>

                  <div className={styles.divest}>
                    <Clock size={18} color="#5b6b8a" />
                    <div>Estimasi Waktu</div>
                  </div>
                  <div className={styles.divestTime}>
                    <b>{getEstimasiText()}</b>
                  </div>
                </div>

                {/* Info Box */}
                <div className={styles.divinfo}>
                  <Info size={20} color="#1e5eff" className={styles.frameIcon7} />
                  <div className={styles.tunjukkanNomorIni}>
                    Tunjukkan nomor ini kepada petugas saat dipanggil.
                  </div>
                </div>

                {/* Tombol Aksi Bawah */}
                <div className={styles.divbottom}>
                  <button
                    type="button"
                    className={styles.buttonbtn}
                    onClick={() => navigate('/pasien/status-antrean')}
                  >
                    <b>Lihat Detail Antrean</b>
                  </button>
                  <button
                    type="button"
                    className={styles.buttonbtn2}
                    onClick={() => navigate('/pasien/beranda')}
                  >
                    <b>Kembali ke Beranda</b>
                  </button>
                </div>
              </>
            )}

            <BottomNav/>

          </div>

        </div>
      </div>
    </div>
  );
};

export default NomorAntrean;