import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Check, Bell, Clock, AlertCircle } from 'lucide-react';
import api from '../../api/axios.ts';
import BottomNav from '../../components/NavbarPasien.tsx';
import styles from '../pasien/css/Status.module.css';

interface StatusAntreanData {
  nomor_antrean: string;
  nama_poli: string;
  tgl_antrean: string;
  status_antrean: 'menunggu' | 'dipanggil' | 'selesai';
  posisi_antrean: number;
}

const StatusAntrean: FC = () => {
  const navigate = useNavigate();
  const [dataAntrean, setDataAntrean] = useState<StatusAntreanData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatusAntrean = async () => {
      const pasienData = localStorage.getItem('pasien');
      if (!pasienData) {
        navigate('/pasien/login', { state: { redirectTo: '/pasien/status-antrean' } });
        return;
      }

      try {
        setLoading(true);
        setErrorMsg(null);
        const parsed = JSON.parse(pasienData);
        const idPasien = parsed.idPasien || parsed.id_pasien;

        // Panggil endpoint backend untuk status antrean aktif pasien
        const response = await api.get(`/pasien/status-aktif/${idPasien}`);
        setDataAntrean(response.data);
      } catch (err: any) {
        console.error('Gagal mengambil status antrean:', err);
        setErrorMsg(err.response?.data?.message || 'Anda belum memiliki antrean aktif hari ini.');
      } finally {
        setLoading(false);
      }
    };

    fetchStatusAntrean();
  }, [navigate]);

  // Helper format tanggal
  const formatTanggal = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Status step aktif (1: Menunggu, 2: Dipanggil, 3: Selesai)
  const getStepActive = () => {
    if (!dataAntrean) return 1;
    if (dataAntrean.status_antrean === 'dipanggil') return 2;
    if (dataAntrean.status_antrean === 'selesai') return 3;
    return 1;
  };

  const currentStep = getStepActive();

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.status}>
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
            <b className={styles.statusAntrean}>Status Antrean</b>
          </div>

          {/* Konten Utama */}
          <div className={styles.divcontent}>
            
            {errorMsg ? (
              <div style={{ width: '100%', textAlign: 'center', padding: '48px 20px', background: '#fff', borderRadius: '16px', boxSizing: 'border-box', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                <AlertCircle size={44} color="#f59e0b" style={{ marginBottom: '10px' }} />
                <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: '#1b2a4a', fontSize: '16px' }}>Belum Ada Antrean Aktif</p>
                <p style={{ margin: '0 0 20px 0', color: '#5b6b8a', fontSize: '13px' }}>{errorMsg}</p>
                <button
                  type="button"
                  onClick={() => navigate('/pasien/pendaftaran')}
                  style={{ background: '#1e5eff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 600, fontFamily: 'Poppins', cursor: 'pointer' }}
                >
                  Daftar Antrean Sekarang
                </button>
              </div>
            ) : loading ? (
              <div style={{ width: '100%', textAlign: 'center', padding: '40px 0', color: '#5b6b8a', fontSize: '14px' }}>
                Memuat status antrean...
              </div>
            ) : dataAntrean && (
              <>
                {/* Mini Card Nomor Antrean */}
                <div className={styles.divmini}>
                  <div className={styles.div}>
                    <div className={styles.div2}>
                      <div className={styles.statusAntrean}>Nomor Antrean Anda</div>
                    </div>
                    <div className={styles.divcode}>
                      <b className={styles.a001}>{dataAntrean.nomor_antrean}</b>
                    </div>
                  </div>
                  <div className={styles.div3}>
                    <div className={styles.divpoli}>
                      <b className={styles.statusAntrean}>{dataAntrean.nama_poli}</b>
                    </div>
                    <div className={styles.divdate}>
                      <div className={styles.statusAntrean}>{formatTanggal(dataAntrean.tgl_antrean)}</div>
                    </div>
                  </div>
                </div>

                {/* Card Detail Status & Progress */}
                <div className={styles.divcard}>
                  <div className={styles.h2}>
                    <b className={styles.statusAntrean2}>Status Antrean</b>
                  </div>

                  <div className={styles.divposition}>
                    <Users size={48} color="#1e5eff" style={{ marginBottom: '4px' }} />
                    <div className={styles.divtxt}>
                      <b className={styles.andaBeradaDiContainer}>
                        <span className={styles.andaBeradaDi}>Anda berada di posisi </span>
                        <span className={styles.ke1}>ke-{dataAntrean.posisi_antrean}<br /></span>
                        <span className={styles.andaBeradaDi}>dalam antrean.</span>
                      </b>
                    </div>
                  </div>

                  {/* Progress Bar 3 Tahap */}
                  <div className={styles.divprogress}>
                    <div className={styles.before} />
                    
                    {/* Stage 1: Menunggu */}
                    <div className={styles.divstage} style={{ color: currentStep >= 1 ? '#1e5eff' : '#8a94a6' }}>
                      <div className={styles.divdot} style={{ backgroundColor: currentStep >= 1 ? '#1e5eff' : '#e3e9f3' }}>
                        {currentStep >= 1 && <Check size={16} color="#fff" />}
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: currentStep === 1 ? 600 : 400 }}>Menunggu</span>
                    </div>

                    {/* Stage 2: Dipanggil */}
                    <div className={styles.divstage2} style={{ color: currentStep >= 2 ? '#1e5eff' : '#8a94a6' }}>
                      <div className={styles.divdot2} style={{ backgroundColor: currentStep >= 2 ? '#1e5eff' : '#e3e9f3' }}>
                        {currentStep >= 2 ? <Check size={16} color="#fff" /> : <Clock size={16} color="#8a94a6" />}
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: currentStep === 2 ? 600 : 400 }}>Dipanggil</span>
                    </div>

                    {/* Stage 3: Selesai */}
                    <div className={styles.divstage3} style={{ color: currentStep >= 3 ? '#1e5eff' : '#8a94a6' }}>
                      <div className={styles.divdot2} style={{ backgroundColor: currentStep >= 3 ? '#1e5eff' : '#e3e9f3' }}>
                        {currentStep >= 3 ? <Check size={16} color="#fff" /> : <Clock size={16} color="#8a94a6" />}
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: currentStep === 3 ? 600 : 400 }}>Selesai</span>
                    </div>
                  </div>

                  {/* Notice Box */}
                  <div className={styles.divnotice}>
                    <Bell size={24} color="#1e5eff" className={styles.frameIcon6} />
                    <div className={styles.mohonMenungguHingga}>
                      {currentStep === 2 
                        ? 'Giliran Anda! Silakan segera menuju ke ruangan poli.' 
                        : 'Mohon menunggu hingga nomor antrean Anda dipanggil.'}
                    </div>
                  </div>

                </div>
              </>
            )}

          </div>

          <BottomNav />

        </div>
      </div>
    </div>
  );
};

export default StatusAntrean;