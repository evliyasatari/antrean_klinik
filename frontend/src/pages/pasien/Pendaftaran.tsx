import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import api from '../../api/axios.ts';
import styles from '../pasien/css/Pendaftaran.module.css';

interface Poli {
  id_poli: number;
  nama_poli: string;
  kode_antrean: string;
}

interface Dokter {
  id_dokter: number;
  nama_dokter: string;
  id_poli: number;
  no_hp: string;
  nama_poli?: string;
}

const Pendaftaran: FC = () => {
  const navigate = useNavigate();

  // State Data Pasien & Form
  const [namaPasien, setNamaPasien] = useState<string>('Memuat...');
  const [idPasien, setIdPasien] = useState<number | null>(null);
  
  const [listPoli, setListPoli] = useState<Poli[]>([]);
  const [listDokter, setListDokter] = useState<Dokter[]>([]);

  const [selectedPoli, setSelectedPoli] = useState<string>('');
  const [selectedDokter, setSelectedDokter] = useState<string>('');
  const [tglKunjungan, setTglKunjungan] = useState<string>('');
  const [keluhan, setKeluhan] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Ambil data session pasien dan referensi Poli/Dokter dari backend saat pertama load
  useEffect(() => {
    const pasienData = localStorage.getItem('pasien');
    if (!pasienData) {
      navigate('/pasien/login', { state: { redirectTo: '/pasien/pendaftaran' } });
      return;
    }

    try {
      const parsed = JSON.parse(pasienData);
      setNamaPasien(parsed.nama_pasien || 'Pasien');
      setIdPasien(parsed.id_pasien);
    } catch {
      navigate('/pasien/login');
    }

    // Set default tanggal hari ini (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    setTglKunjungan(today);

    // Fetch master data Poli & Dokter
    const fetchMasterData = async () => {
      try {
        const [resPoli, resDokter] = await Promise.all([
          api.get('/poli'), // Endpoint backend tabel poli
          api.get('/dokter') // Endpoint backend tabel dokter
        ]);
        setListPoli(resPoli.data);
        setListDokter(resDokter.data);

        if (resPoli.data.length > 0) {
          setSelectedPoli(resPoli.data[0].id_poli.toString());
        }
      } catch (err) {
        console.error('Gagal memuat master data:', err);
        setErrorMsg('Gagal terhubung ke server untuk memuat poli/dokter.');
      }
    };

    fetchMasterData();
  }, [navigate]);

  // Filter dokter berdasarkan poli yang dipilih
  const filteredDokter = listDokter.filter(
    (d) => d.id_poli.toString() === selectedPoli
  );

  // Handle Submit Pendaftaran ke Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idPasien || !selectedPoli || !selectedDokter || !tglKunjungan) {
      alert('Mohon lengkapi data pendaftaran!');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      // Kirim data ke endpoint pendaftaran backend (akan memasukkan ke tabel pendaftaran & antrean)
      const payload = {
        id_pasien: idPasien,
        id_dokter: Number(selectedDokter),
        tgl_kunjungan: tglKunjungan,
        keluhan: keluhan || 'Tanpa keluhan khusus'
      };

      const response = await api.post('/pendaftaran', payload);
      
      // Jika berhasil, arahkan ke halaman Nomor Antrean
      navigate('/pasien/nomor-antrean', { 
        state: { antreanBaru: response.data } 
      });
    } catch (err: any) {
      console.error('Gagal mendaftar:', err);
      setErrorMsg(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan pendaftaran.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pendaftaran}>
        <div className={styles.divscreen}>
          
          {/* App Bar / Header */}
          <div className={styles.divappbar}>
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <ArrowLeft className={styles.frameIcon} color="#fff" size={24} />
            </button>
            <b className={styles.buka}>Pendaftaran</b>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className={styles.divform}>
            
            {errorMsg && (
              <div style={{ width: '100%', padding: '10px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '12px' }}>
                {errorMsg}
              </div>
            )}

            {/* Nama Pasien (Readonly dari session) */}
            <div className={styles.divgroup}>
              <div className={styles.label}>
                <b className={styles.nama}>Nama Pasien</b>
              </div>
              <div className={styles.divinput}>
                <div className={styles.spangrow}>
                  <div className={styles.nama}>{namaPasien}</div>
                </div>
              </div>
            </div>

            {/* Pilih Poli */}
            <div className={styles.divgroup}>
              <div className={styles.label}>
                <b className={styles.nama}>Pilih Poli</b>
              </div>
              <div className={styles.divinput2Select}>
                <select 
                  value={selectedPoli} 
                  onChange={(e) => {
                    setSelectedPoli(e.target.value);
                    setSelectedDokter(''); // Reset dokter saat poli berubah
                  }}
                  style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'Poppins', fontSize: '14px', color: '#1b2a4a' }}
                >
                  {listPoli.map((poli) => (
                    <option key={poli.id_poli} value={poli.id_poli}>
                      {poli.nama_poli}
                    </option>
                  ))}
                </select>
                <ChevronDown className={styles.frameIcon2} size={18} color="#5b6b8a" />
              </div>
            </div>

            {/* Pilih Tanggal Daftar */}
            <div className={styles.divgroup}>
              <div className={styles.label}>
                <b className={styles.nama}>Pilih Tanggal Daftar</b>
              </div>
              <div className={styles.divinput2}>
                <input 
                  type="date" 
                  value={tglKunjungan}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setTglKunjungan(e.target.value)}
                  style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'Poppins', fontSize: '14px', color: '#1b2a4a' }}
                />
              </div>
            </div>

            {/* Pilih Dokter */}
            <div className={styles.divgroup}>
              <div className={styles.label}>
                <b className={styles.nama}>Pilih Dokter</b>
              </div>
              
              <div className={styles.divinputSelectContainer}>
                <select 
                  value={selectedDokter}
                  onChange={(e) => setSelectedDokter(e.target.value)}
                  style={{ width: '100%', border: '1px solid #d5dce8', borderRadius: '10px', padding: '14px', background: '#fff', outline: 'none', fontFamily: 'Poppins', fontSize: '14px', color: '#1b2a4a' }}
                  required
                >
                  <option value="" disabled>-- Pilih Dokter Tersedia --</option>
                  {filteredDokter.map((doc) => (
                    <option key={doc.id_dokter} value={doc.id_dokter}>
                      {doc.nama_dokter} (08:00 - 16:00)
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.divnotemargin}>
                <div className={styles.divnote}>
                  <i className={styles.pendaftaranDibukaSejak}>
                    * Pendaftaran dibuka sejak pukul 08:00 dan ditutup pukul 15:00 pada hari yang sama.
                  </i>
                </div>
              </div>
            </div>

            {/* Keluhan */}
            <div className={styles.divgroup} style={{ marginBottom: '90px' }}>
              <div className={styles.label}>
                <b className={styles.nama}>Keluhan</b>
              </div>
              <div className={styles.divinput5}>
                <textarea 
                  placeholder="Silakan isi keluhan..."
                  value={keluhan}
                  onChange={(e) => setKeluhan(e.target.value)}
                  style={{ width: '100%', height: '80px', border: 'none', background: 'transparent', outline: 'none', resize: 'none', fontFamily: 'Poppins', fontSize: '14px', color: '#1b2a4a' }}
                />
              </div>
            </div>

            {/* Bottom Button Simpan */}
            <div className={styles.divbottom}>
              <button type="submit" className={styles.buttonbtn} disabled={loading} style={{ cursor: 'pointer', border: 'none' }}>
                <b className={styles.buka}>{loading ? 'Menyimpan...' : 'Simpan'}</b>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Pendaftaran;