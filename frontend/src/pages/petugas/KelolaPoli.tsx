import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Search, Pencil, Trash2, Plus } from 'lucide-react';
import api from '../../api/axios';
import styles from './css/KelolaPoli.module.css';

interface Poli {
  id_poli: number;
  nama_poli: string;
  kode_antrean: string;
}

export default function KelolaPoli() {
  const [poliList, setPoliList] = useState<Poli[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoli, setEditingPoli] = useState<Poli | null>(null);
  const [formData, setFormData] = useState({
    nama_poli: '',
    kode_antrean: '',
  });

  // Mengambil data poli langsung dari database melalui API backend
  const fetchPoli = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const response = await api.get('/petugas/poli');

      // Normalisasi format agar tetap terbaca baik backend mengirim snake_case maupun camelCase
      const formattedData: Poli[] = response.data.map((item: any) => ({
        id_poli: item.id_poli ?? item.idPoli,
        nama_poli: item.nama_poli ?? item.namaPoli,
        kode_antrean: item.kode_antrean ?? item.kodeAntrean,
      }));

      setPoliList(formattedData);
    } catch (error: any) {
      console.error('Gagal mengambil data poli:', error);
      setErrorMsg(
        error.response?.data?.message || 'Gagal memuat data poli dari server.'
      );
      setPoliList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoli();
  }, []);

  const filteredPoli = poliList.filter(
    (item) =>
      item.nama_poli.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kode_antrean.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openModal = (poli?: Poli) => {
    if (poli) {
      setEditingPoli(poli);
      setFormData({
        nama_poli: poli.nama_poli,
        kode_antrean: poli.kode_antrean,
      });
    } else {
      setEditingPoli(null);
      setFormData({
        nama_poli: '',
        kode_antrean: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nama_poli: formData.nama_poli.trim(),
      kode_antrean: formData.kode_antrean.toUpperCase().trim(),
    };

    try {
      if (editingPoli) {
        await api.put(`/petugas/poli/${editingPoli.id_poli}`, payload);
      } else {
        await api.post('/petugas/poli', payload);
      }
      setIsModalOpen(false);
      fetchPoli();
    } catch (error: any) {
      console.error('Gagal menyimpan data poli:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan data poli ke server.');
    }
  };

  const handleDelete = async (id: number, nama: string) => {
    if (!window.confirm(`Yakin ingin menghapus ${nama}?`)) return;
    try {
      await api.delete(`/petugas/poli/${id}`);
      fetchPoli();
    } catch (error: any) {
      console.error('Gagal menghapus poli:', error);
      alert(
        error.response?.data?.message ||
          'Gagal menghapus data poli. Pastikan poli tidak sedang digunakan oleh dokter.'
      );
    }
  };

  return (
    <div>
      {/* Topbar */}
      <header className={styles.topbar}>
        <h1>Kelola Data</h1>
      </header>

      {/* Panel Utama */}
      <section className={styles.panel}>
        {/* Tab Navigasi Atas */}
        <div className={styles.tabs}>
          <NavLink
            to="/petugas/poli"
            className={({ isActive }) => (isActive ? styles.tabActive : styles.tab)}
          >
            Poli
          </NavLink>
          <NavLink
            to="/petugas/pasien"
            className={({ isActive }) => (isActive ? styles.tabActive : styles.tab)}
          >
            Pasien
          </NavLink>
          <NavLink
            to="/petugas/dokter"
            className={({ isActive }) => (isActive ? styles.tabActive : styles.tab)}
          >
            Dokter
          </NavLink>
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

        {/* Kotak Pencarian */}
        <div className={styles.searchBox}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Cari data poli..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabel Data Poli */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '70px' }}>No</th>
                <th>Nama Poli</th>
                <th>Kode Antrean</th>
                <th style={{ width: '120px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className={styles.emptyText}>
                    Memuat data dari database...
                  </td>
                </tr>
              ) : filteredPoli.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.emptyText}>
                    {errorMsg ? 'Tidak dapat menampilkan data.' : 'Belum ada data poli di database.'}
                  </td>
                </tr>
              ) : (
                filteredPoli.map((poli, index) => (
                  <tr key={poli.id_poli}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{poli.nama_poli}</strong>
                    </td>
                    <td>
                      <span className={styles.kodeBadge}>{poli.kode_antrean}</span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.editBtn}
                          onClick={() => openModal(poli)}
                          title="Edit Poli"
                        >
                          <Pencil size={15} color="#ffffff" />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(poli.id_poli, poli.nama_poli)}
                          title="Hapus Poli"
                        >
                          <Trash2 size={15} color="#ffffff" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Tombol Tambah Poli */}
        <div className={styles.footerAction}>
          <button className={styles.addBtn} onClick={() => openModal()}>
            <Plus size={16} />
            <span>Tambah Poli</span>
          </button>
        </div>
      </section>

      {/* Modal Form Tambah / Edit Poli */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3>{editingPoli ? 'Edit Data Poli' : 'Tambah Poli Baru'}</h3>
            <form onSubmit={handleSave} className={styles.modalForm}>
              <label>
                Nama Poli
                <input
                  type="text"
                  maxLength={50}
                  required
                  value={formData.nama_poli}
                  onChange={(e) => setFormData({ ...formData, nama_poli: e.target.value })}
                  placeholder="Contoh: Poli Umum"
                />
              </label>

              <label>
                Kode Antrean
                <input
                  type="text"
                  maxLength={5}
                  required
                  value={formData.kode_antrean}
                  onChange={(e) =>
                    setFormData({ ...formData, kode_antrean: e.target.value.toUpperCase() })
                  }
                  placeholder="Contoh: A"
                />
              </label>

              <div className={styles.modalButtons}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={styles.cancelBtn}
                >
                  Batal
                </button>
                <button type="submit" className={styles.saveBtn}>
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}