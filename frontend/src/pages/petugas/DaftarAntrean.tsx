import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, Volume2, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import styles from './css/DaftarAntrean.module.css';

interface AntreanItem {
  id_antrean: number;
  id_pendaftaran: number;
  nomor_antrean: string;
  tgl_antrean: string;
  tgl_daftar: string;
  status_antrean: 'menunggu' | 'dipanggil' | 'selesai';
  waktu_panggil: string | null;
  nama_pasien: string;
  id_poli: number;
  nama_poli: string;
  nama_dokter: string;
  keluhan: string;
}

interface Poli {
  id_poli: number;
  nama_poli: string;
}

export default function DaftarAntrean() {
  const [searchParams] = useSearchParams();
  const initialPoli = searchParams.get('poliId') || 'all';

  const [antreanList, setAntreanList] = useState<AntreanItem[]>([]);
  const [poliList, setPoliList] = useState<Poli[]>([]);
  const [selectedPoli, setSelectedPoli] = useState<string>(initialPoli);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Ambil data antrean dan daftar poli dari backend
  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      setErrorMsg(null);
      const [resAntrean, resPoli] = await Promise.all([
        api.get('/petugas/antrean'),
        api.get('/petugas/poli'),
      ]);

      const formattedPoli: Poli[] = resPoli.data.map((p: any) => ({
        id_poli: p.id_poli ?? p.idPoli,
        nama_poli: p.nama_poli ?? p.namaPoli ?? '',
      }));

      const formattedAntrean: AntreanItem[] = resAntrean.data.map((a: any) => ({
        id_antrean: a.id_antrean ?? a.idAntrean,
        id_pendaftaran: a.id_pendaftaran ?? a.idPendaftaran,
        nomor_antrean: a.nomor_antrean ?? a.nomorAntrean ?? '',
        tgl_antrean: a.tgl_antrean ?? a.tglAntrean ?? '',
        tgl_daftar: a.tgl_daftar ?? a.tglDaftar ?? '',
        status_antrean: a.status_antrean ?? a.statusAntrean ?? 'menunggu',
        waktu_panggil: a.waktu_panggil ?? a.waktuPanggil ?? null,
        nama_pasien: a.nama_pasien ?? a.namaPasien ?? '',
        id_poli: a.id_poli ?? a.idPoli,
        nama_poli: a.nama_poli ?? a.namaPoli ?? '',
        nama_dokter: a.nama_dokter ?? a.namaDokter ?? '',
        keluhan: a.keluhan ?? '',
      }));

      setPoliList(formattedPoli);
      setAntreanList(formattedAntrean);
    } catch (error: any) {
      console.error('Gagal memuat daftar antrean:', error);
      setErrorMsg(
        error.response?.data?.message || 'Gagal memuat daftar antrean dari server.'
      );
      setPoliList([]);
      setAntreanList([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Validasi Model Queue: Cek apakah seluruh antrean sebelumnya dalam poli yang sama BELUM berstatus 'selesai'
  const isQueueBlocked = (currentItem: AntreanItem) => {
    const queueInSamePoli = antreanList.filter(
      (item) => item.id_poli === currentItem.id_poli
    );

    const currentIndex = queueInSamePoli.findIndex(
      (item) => item.id_antrean === currentItem.id_antrean
    );

    if (currentIndex <= 0) return false;

    for (let i = 0; i < currentIndex; i++) {
      if (queueInSamePoli[i].status_antrean !== 'selesai') {
        return true;
      }
    }

    return false;
  };

  // 2. Fungsi Panggil Pasien (status -> 'dipanggil')
  const handlePanggil = async (id_antrean: number) => {
    const targetItem = antreanList.find((item) => item.id_antrean === id_antrean);
    if (targetItem && isQueueBlocked(targetItem)) {
      alert('Tidak dapat memanggil pasien ini karena antrean sebelumnya di poli yang sama belum selesai.');
      return;
    }

    try {
      await api.patch(`/petugas/antrean/${id_antrean}/panggil`);
      fetchData();
    } catch (error: any) {
      console.error('Gagal memanggil pasien:', error);
      alert(error.response?.data?.message || 'Gagal memanggil pasien ke server.');
    }
  };

  // 3. Fungsi Selesaikan Pelayanan (status -> 'selesai')
  const handleSelesai = async (id_antrean: number) => {
    try {
      await api.patch(`/petugas/antrean/${id_antrean}/selesai`);
      fetchData();
    } catch (error: any) {
      console.error('Gagal menyelesaikan pelayanan:', error);
      alert(error.response?.data?.message || 'Gagal menyelesaikan pelayanan ke server.');
    }
  };

  // Filter berdasarkan dropdown poli
  const filteredAntrean = antreanList.filter((item) => {
    if (selectedPoli === 'all') return true;
    return String(item.id_poli) === selectedPoli;
  });

  // Format jam dari datetime (contoh: "2026-11-14 08:00:00" -> "08:00")
  const formatWaktu = (datetimeStr: string | null) => {
    if (!datetimeStr) return '-';
    const date = new Date(datetimeStr);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      {/* Topbar */}
      <header className={styles.topbar}>
        <h1>Daftar Antrean</h1>
      </header>

      {/* Panel Utama */}
      <section className={styles.panel}>
        {/* Toolbar: Dropdown Poli di kiri & Tombol Refresh di kanan */}
        <div className={styles.toolbar}>
          <select
            className={styles.poliSelect}
            value={selectedPoli}
            onChange={(e) => setSelectedPoli(e.target.value)}
          >
            <option value="all">Semua Poli</option>
            {poliList.map((poli) => (
              <option key={poli.id_poli} value={poli.id_poli}>
                {poli.nama_poli}
              </option>
            ))}
          </select>

          <button
            className={styles.refreshBtn}
            onClick={fetchData}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={isRefreshing ? styles.spin : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Pesan Error Koneksi */}
        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Tabel Daftar Antrean */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>No</th>
                <th>No. Antrean</th>
                <th>Nama Pasien</th>
                <th>Poli & Dokter</th>
                <th>Waktu Daftar</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className={styles.emptyText}>
                    Memuat daftar antrean...
                  </td>
                </tr>
              ) : filteredAntrean.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyText}>
                    Belum ada antrean untuk poli yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredAntrean.map((item, index) => {
                  const isBlocked = isQueueBlocked(item);

                  return (
                    <tr key={item.id_antrean}>
                      <td>{index + 1}</td>
                      <td>
                        <strong className={styles.nomorCode}>{item.nomor_antrean}</strong>
                      </td>
                      <td>
                        <div className={styles.patientInfo}>
                          <strong>{item.nama_pasien}</strong>
                          <small>{item.keluhan}</small>
                        </div>
                      </td>
                      <td>
                        <div className={styles.poliInfo}>
                          <span>{item.nama_poli}</span>
                          <small>{item.nama_dokter}</small>
                        </div>
                      </td>
                      <td>{formatWaktu(item.tgl_daftar)}</td>
                      <td>
                        {item.status_antrean === 'dipanggil' && (
                          <span className={styles.badgeDilayani}>Dilayani</span>
                        )}
                        {item.status_antrean === 'menunggu' && (
                          <span className={styles.badgeMenunggu}>Menunggu</span>
                        )}
                        {item.status_antrean === 'selesai' && (
                          <span className={styles.badgeSelesai}>Selesai</span>
                        )}
                      </td>
                      <td>
                        {item.status_antrean === 'menunggu' && (
                          <div className={styles.actionWrapper}>
                            <button
                              className={`${styles.callBtn} ${isBlocked ? styles.btnDisabled : ''}`}
                              onClick={() => handlePanggil(item.id_antrean)}
                              disabled={isBlocked}
                              title={
                                isBlocked
                                  ? 'Antrean sebelumnya di poli ini belum selesai'
                                  : 'Panggil pasien'
                              }
                            >
                              <Volume2 size={14} />
                              <span>Panggil</span>
                            </button>
                            {isBlocked && (
                              <span className={styles.blockHint}>
                                <AlertCircle size={12} /> Antrean sebelumnya belum selesai
                              </span>
                            )}
                          </div>
                        )}
                        {item.status_antrean === 'dipanggil' && (
                          <button
                            className={styles.finishBtn}
                            onClick={() => handleSelesai(item.id_antrean)}
                          >
                            <CheckCircle size={14} />
                            <span>Selesai</span>
                          </button>
                        )}
                        {item.status_antrean === 'selesai' && (
                          <span className={styles.doneText}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}