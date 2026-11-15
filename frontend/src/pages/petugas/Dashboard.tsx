import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, List, User, CheckCircle2 } from 'lucide-react';
import api from '../../api/axios.ts';
import styles from './css/Dashboard.module.css';

// Tipe data yang diharapkan dari respons API backend
interface DashboardStats {
  totalPasien: number;
  dalamAntrean: number;
  sedangDilayani: number;
  selesaiHariIni: number;
}

interface AntreanPoliItem {
  id: number;
  nama: string;
  kode: string;
  estimasi: string;
}

export default function Dashboard() {
  const navigate = useNavigate();

  // State untuk menampung data dari backend
  const [statsData, setStatsData] = useState<DashboardStats>({
    totalPasien: 0,
    dalamAntrean: 0,
    sedangDilayani: 0,
    selesaiHariIni: 0,
  });
  const [antreanPoli, setAntreanPoli] = useState<AntreanPoliItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mengambil data saat halaman pertama kali dibuka
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Panggil endpoint API backend Anda (sesuaikan URL endpoint jika berbeda)
        const response = await api.get('/petugas/dashboard');

        // Asumsi format JSON dari backend: { stats: {...}, antreanPoli: [...] }
        setStatsData(response.data.stats);
        setAntreanPoli(response.data.antreanPoli);
      } catch (err) {
        console.error('Gagal memuat data dashboard:', err);
        setError('Gagal mengambil data dari server. Pastikan backend menyala.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Susun konfigurasi kartu berdasarkan state statsData
  const statsCards = [
    { label: 'Total Pasien', value: statsData.totalPasien, color: '#2563eb', bg: '#eff6ff', icon: <Users size={20} color="#2563eb" /> },
    { label: 'Dalam Antrean', value: statsData.dalamAntrean, color: '#ea580c', bg: '#fff7ed', icon: <List size={20} color="#ea580c" /> },
    { label: 'Sedang Dilayani', value: statsData.sedangDilayani, color: '#16a34a', bg: '#f0fdf4', icon: <User size={20} color="#16a34a" /> },
    { label: 'Selesai Hari Ini', value: statsData.selesaiHariIni, color: '#2563eb', bg: '#eff6ff', icon: <CheckCircle2 size={20} color="#2563eb" /> },
  ];

  return (
    <div className={styles.dashboardContainer}>
      {/* Topbar */}
      <header className={styles.topbar}>
        <h1>Dashboard</h1>
        <div className={styles.userProfile}>
          <span>Petugas Admin</span>
          <div className={styles.avatar}>P</div>
        </div>
      </header>

      {/* Pesan Error jika backend belum siap / gagal koneksi */}
      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Kartu Statistik */}
      <section className={styles.statsGrid}>
        {statsCards.map((item, idx) => (
          <div key={idx} className={styles.statCard}>
            <div className={styles.iconCircle} style={{ backgroundColor: item.bg }}>
              {item.icon}
            </div>
            <h2 className={styles.statNumber} style={{ color: item.color }}>
              {loading ? '...' : item.value}
            </h2>
            <p className={styles.statLabel}>{item.label}</p>
          </div>
        ))}
      </section>

      {/* Panel Antrean per Poli */}
      <section className={styles.panel}>
        <h3>Antrean per Poli</h3>

        {loading ? (
          <p style={{ color: '#64748b', fontSize: '14px' }}>Memuat data antrean...</p>
        ) : antreanPoli.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '14px' }}>Belum ada data antrean hari ini.</p>
        ) : (
          <div className={styles.poliGrid}>
            {antreanPoli.map((poli) => (
              <div key={poli.id} className={styles.poliCard}>
                <span className={styles.poliName}>{poli.nama}</span>
                <h2 className={styles.poliCode}>{poli.kode}</h2>
                <p className={styles.poliEst}>{poli.estimasi}</p>
                <button
                  className={styles.detailBtn}
                  onClick={() => navigate(`/petugas/antrean?poliId=${poli.id}`)}
                >
                  Lihat Detail
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}