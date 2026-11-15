import { useEffect, useState } from 'react';
import { Search, Calendar, CheckCircle2, Eye, X } from 'lucide-react';
import api from '../../api/axios';
import styles from './css/RiwayatPelayanan.module.css';

interface RiwayatItem {
  id_antrean: number;
  id_pendaftaran: number;
  nomor_antrean: string;
  tgl_antrean: string;
  tgl_daftar: string;
  waktu_panggil: string | null;
  status_antrean: 'selesai';
  nik: string;
  nama_pasien: string;
  jenis_kelamin: 'L' | 'P';
  no_hp: string;
  alamat: string;
  nama_poli: string;
  nama_dokter: string;
  keluhan: string;
  nama_petugas: string | null;
}

export default function RiwayatPelayanan() {
  const [riwayatList, setRiwayatList] = useState<RiwayatItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTanggal, setFilterTanggal] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // State untuk Modal Detail Riwayat
  const [selectedDetail, setSelectedDetail] = useState<RiwayatItem | null>(null);

  // 1. Ambil data riwayat pelayanan langsung dari backend
  const fetchRiwayat = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const response = await api.get('/petugas/riwayat');

      const formattedData: RiwayatItem[] = response.data.map((item: any) => ({
        id_antrean: item.id_antrean ?? item.idAntrean,
        id_pendaftaran: item.id_pendaftaran ?? item.idPendaftaran,
        nomor_antrean: item.nomor_antrean ?? item.nomorAntrean ?? '',
        tgl_antrean: item.tgl_antrean ?? item.tglAntrean ?? '',
        tgl_daftar: item.tgl_daftar ?? item.tglDaftar ?? '',
        waktu_panggil: item.waktu_panggil ?? item.waktuPanggil ?? null,
        status_antrean: item.status_antrean ?? item.statusAntrean ?? 'selesai',
        nik: item.nik ?? '',
        nama_pasien: item.nama_pasien ?? item.namaPasien ?? '',
        jenis_kelamin: item.jenis_kelamin ?? item.jenisKelamin ?? 'L',
        no_hp: item.no_hp ?? item.noHp ?? '',
        alamat: item.alamat ?? '',
        nama_poli: item.nama_poli ?? item.namaPoli ?? '',
        nama_dokter: item.nama_dokter ?? item.namaDokter ?? '',
        keluhan: item.keluhan ?? '',
        nama_petugas: item.nama_petugas ?? item.namaPetugas ?? null,
      }));

      setRiwayatList(formattedData);
    } catch (error: any) {
      console.error('Gagal mengambil data riwayat:', error);
      setErrorMsg(
        error.response?.data?.message || 'Gagal memuat riwayat pelayanan dari server.'
      );
      setRiwayatList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, []);

  // 2. Filter berdasarkan kata kunci dan tanggal
  const filteredRiwayat = riwayatList.filter((item) => {
    const keyword = searchQuery.toLowerCase();
    const matchKeyword =
      item.nama_pasien.toLowerCase().includes(keyword) ||
      item.nik.includes(searchQuery) ||
      item.nomor_antrean.toLowerCase().includes(keyword) ||
      item.nama_poli.toLowerCase().includes(keyword) ||
      item.nama_dokter.toLowerCase().includes(keyword);

    const tanggalItem = item.tgl_antrean ? item.tgl_antrean.split('T') : '';
    const matchDate = filterTanggal === '' || tanggalItem === filterTanggal;

    return matchKeyword && matchDate;
  });

  // Helper format tanggal Indonesia (15 Nov 2026)
  const formatTanggal = (tgl: string | null) => {
    if (!tgl) return '-';
    const date = new Date(tgl);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Helper format tanggal & jam lengkap untuk Modal (15 Nov 2026, 08:30)
  const formatTanggalWaktu = (datetimeStr: string | null) => {
    if (!datetimeStr) return '-';
    const date = new Date(datetimeStr);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      {/* Topbar */}
      <header className={styles.topbar}>
        <h1>Riwayat Pelayanan</h1>
        <div className={styles.userProfile}>
          <span>Petugas Admin</span>
          <div className={styles.avatar}>P</div>
        </div>
      </header>

      {/* Panel Utama */}
      <section className={styles.panel}>
        {/* Toolbar Pencarian & Filter Tanggal */}
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              placeholder="Cari riwayat pelayanan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.dateFilter}>
            <Calendar size={16} color="#64748b" />
            <input
              type="date"
              value={filterTanggal}
              onChange={(e) => setFilterTanggal(e.target.value)}
              title="Filter berdasarkan tanggal kunjungan"
            />
            {filterTanggal && (
              <button
                className={styles.resetDateBtn}
                onClick={() => setFilterTanggal('')}
              >
                Reset
              </button>
            )}
          </div>
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

        {/* Tabel Riwayat Ringkas */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>No</th>
                <th>Tanggal</th>
                <th>No. Antrean</th>
                <th>Nama</th>
                <th>Poli & Dokter</th>
                <th>Status</th>
                <th style={{ width: '140px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className={styles.emptyText}>
                    Memuat riwayat pelayanan...
                  </td>
                </tr>
              ) : filteredRiwayat.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyText}>
                    Tidak ada riwayat pelayanan ditemukan.
                  </td>
                </tr>
              ) : (
                filteredRiwayat.map((item, index) => (
                  <tr key={item.id_antrean}>
                    <td>{index + 1}</td>
                    <td>{formatTanggal(item.tgl_antrean)}</td>
                    <td>
                      <span className={styles.nomorBadge}>{item.nomor_antrean}</span>
                    </td>
                    <td>
                      <strong>{item.nama_pasien}</strong>
                    </td>
                    <td>
                      <div className={styles.poliInfo}>
                        <span>{item.nama_poli}</span>
                        <small>{item.nama_dokter}</small>
                      </div>
                    </td>
                    <td>
                      <span className={styles.badgeSelesai}>
                        <CheckCircle2 size={13} />
                        <span>Selesai</span>
                      </span>
                    </td>
                    <td>
                      <button
                        className={styles.detailBtn}
                        onClick={() => setSelectedDetail(item)}
                      >
                        <Eye size={14} />
                        <span>Lihat Detail</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

            {/* Modal Detail Riwayat Pelayanan Lengkap */}
      {selectedDetail && (
        <div className={styles.modalOverlay} onClick={() => setSelectedDetail(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3>Detail Riwayat Pelayanan</h3>
                <span className={styles.modalSub}>
                  Nomor Antrean: <strong>{selectedDetail.nomor_antrean}</strong>
                </span>
              </div>
              <button
                className={styles.closeIconBtn}
                onClick={() => setSelectedDetail(null)}
                title="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Kelompok Data Pasien */}
              <div className={styles.detailSection}>
                <h4>Informasi Pasien</h4>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span>Nama Pasien</span>
                    <strong>{selectedDetail.nama_pasien}</strong>
                  </div>
                  <div className={styles.detailItem}>
                    <span>NIK</span>
                    <strong>{selectedDetail.nik}</strong>
                  </div>
                  <div className={styles.detailItem}>
                    <span>Jenis Kelamin</span>
                    <strong>
                      {selectedDetail.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </strong>
                  </div>
                  <div className={styles.detailItem}>
                    <span>No. HP</span>
                    <strong>{selectedDetail.no_hp}</strong>
                  </div>
                  <div className={styles.detailItemFull}>
                    <span>Alamat</span>
                    <strong>{selectedDetail.alamat}</strong>
                  </div>
                </div>
              </div>

              {/* Kelompok Data Kunjungan & Pelayanan */}
              <div className={styles.detailSection}>
                <h4>Informasi Kunjungan & Pelayanan</h4>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span>Poli Tujuan</span>
                    <strong>{selectedDetail.nama_poli}</strong>
                  </div>
                  <div className={styles.detailItem}>
                    <span>Dokter Pemeriksa</span>
                    <strong>{selectedDetail.nama_dokter}</strong>
                  </div>
                  <div className={styles.detailItem}>
                    <span>Tanggal Kunjungan</span>
                    <strong>{formatTanggal(selectedDetail.tgl_antrean)}</strong>
                  </div>
                  <div className={styles.detailItem}>
                    <span>Waktu Daftar</span>
                    <strong>{formatTanggalWaktu(selectedDetail.tgl_daftar)}</strong>
                  </div>
                  <div className={styles.detailItem}>
                    <span>Waktu Dipanggil</span>
                    <strong>{formatTanggalWaktu(selectedDetail.waktu_panggil)}</strong>
                  </div>
                  <div className={styles.detailItem}>
                    <span>Petugas Melayani</span>
                    <strong>{selectedDetail.nama_petugas || '-'}</strong>
                  </div>
                  <div className={styles.detailItemFull}>
                    <span>Keluhan Pasien</span>
                    <p className={styles.keluhanBox}>{selectedDetail.keluhan}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.closeBtn}
                onClick={() => setSelectedDetail(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}