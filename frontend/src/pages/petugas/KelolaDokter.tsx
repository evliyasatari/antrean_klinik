import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Search, Pencil, Trash2, Plus } from 'lucide-react';
import api from '../../api/axios';
import styles from './css/KelolaDokter.module.css';

interface Dokter {
  id_dokter: number;
  nama_dokter: string;
  id_poli: number;
  nama_poli?: string;
  no_hp: string;
}

interface Poli {
  id_poli: number;
  nama_poli: string;
}

export default function KelolaDokter() {
  const [dokterList, setDokterList] = useState<Dokter[]>([]);
  const [poliList, setPoliList] = useState<Poli[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // State Modal Tambah / Edit Dokter
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDokter, setEditingDokter] = useState<Dokter | null>(null);
  const [formData, setFormData] = useState({
    nama_dokter: '',
    id_poli: '',
    no_hp: '',
  });

  // 1. Ambil data dokter & daftar poli dari backend
  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [resDokter, resPoli] = await Promise.all([
        api.get('/petugas/dokter'),
        api.get('/petugas/poli'),
      ]);

      const formattedPoli: Poli[] = resPoli.data.map((p: any) => ({
        id_poli: p.id_poli ?? p.idPoli,
        nama_poli: p.nama_poli ?? p.namaPoli ?? '',
      }));

      const formattedDokter: Dokter[] = resDokter.data.map((d: any) => ({
        id_dokter: d.id_dokter ?? d.idDokter,
        nama_dokter: d.nama_dokter ?? d.namaDokter ?? '',
        id_poli: d.id_poli ?? d.idPoli,
        nama_poli: d.nama_poli ?? d.namaPoli,
        no_hp: d.no_hp ?? d.noHp ?? '',
      }));

      setPoliList(formattedPoli);
      setDokterList(formattedDokter);
    } catch (error: any) {
      console.error('Gagal mengambil data dokter/poli:', error);
      setErrorMsg(
        error.response?.data?.message || 'Gagal memuat data dokter dari server.'
      );
      setPoliList([]);
      setDokterList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper mencocokkan nama poli jika backend mengirim id_poli tanpa field nama_poli
  const getNamaPoli = (dokter: Dokter) => {
    if (dokter.nama_poli) return dokter.nama_poli;
    const poli = poliList.find((p) => p.id_poli === dokter.id_poli);
    return poli ? poli.nama_poli : `Poli #${dokter.id_poli}`;
  };

  // 2. Filter pencarian berdasarkan Nama Dokter, Nama Poli, atau No. HP
  const filteredDokter = dokterList.filter((item) => {
    const namaPoli = getNamaPoli(item).toLowerCase();
    const keyword = searchQuery.toLowerCase();
    return (
      item.nama_dokter.toLowerCase().includes(keyword) ||
      namaPoli.includes(keyword) ||
      item.no_hp.includes(searchQuery)
    );
  });

  // 3. Buka modal Tambah / Edit
  const openModal = (dokter?: Dokter) => {
    if (dokter) {
      setEditingDokter(dokter);
      setFormData({
        nama_dokter: dokter.nama_dokter,
        id_poli: String(dokter.id_poli),
        no_hp: dokter.no_hp,
      });
    } else {
      setEditingDokter(null);
      setFormData({
        nama_dokter: '',
        id_poli: poliList.length > 0 ? String(poliList[0].id_poli) : '',
        no_hp: '',
      });
    }
    setIsModalOpen(true);
  };

  // 4. Simpan data dokter (POST / PUT)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nama_dokter: formData.nama_dokter.trim(),
      id_poli: Number(formData.id_poli),
      no_hp: formData.no_hp.trim(),
    };

    try {
      if (editingDokter) {
        await api.put(`/petugas/dokter/${editingDokter.id_dokter}`, payload);
      } else {
        await api.post('/petugas/dokter', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Gagal menyimpan data dokter:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan data dokter ke server.');
    }
  };

  // 5. Hapus data dokter
  const handleDelete = async (id: number, nama: string) => {
    if (!window.confirm(`Yakin ingin menghapus data ${nama}?`)) return;
    try {
      await api.delete(`/petugas/dokter/${id}`);
      fetchData();
    } catch (error: any) {
      console.error('Gagal menghapus dokter:', error);
      alert(
        error.response?.data?.message ||
          'Gagal menghapus data dokter. Pastikan dokter tidak memiliki data pendaftaran.'
      );
    }
  };

  return (
    <div>
      {/* Topbar */}
      <header className={styles.topbar}>
        <h1>Kelola Data</h1>
        <div className={styles.userProfile}>
          <span>Petugas Admin</span>
          <div className={styles.avatar}>P</div>
        </div>
      </header>

      {/* Panel Utama */}
      <section className={styles.panel}>
        {/* Tab Navigasi Atas (Tanpa Tab Jadwal) */}
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
            placeholder="Cari data dokter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabel Data Dokter */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>No</th>
                <th>Nama Dokter</th>
                <th>Poli</th>
                <th>No. HP</th>
                <th style={{ width: '110px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className={styles.emptyText}>
                    Memuat data...
                  </td>
                </tr>
              ) : filteredDokter.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyText}>
                    Data dokter tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredDokter.map((dokter, index) => (
                  <tr key={dokter.id_dokter}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{dokter.nama_dokter}</strong>
                    </td>
                    <td>
                      <span className={styles.poliBadge}>{getNamaPoli(dokter)}</span>
                    </td>
                    <td>{dokter.no_hp}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.editBtn}
                          onClick={() => openModal(dokter)}
                          title="Edit Dokter"
                        >
                          <Pencil size={15} color="#ffffff" />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(dokter.id_dokter, dokter.nama_dokter)}
                          title="Hapus Dokter"
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

        {/* Tombol Tambah Dokter */}
        <div className={styles.footerAction}>
          <button className={styles.addBtn} onClick={() => openModal()}>
            <Plus size={16} />
            <span>Tambah Dokter</span>
          </button>
        </div>
      </section>

      {/* Modal Form Tambah / Edit Dokter */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3>{editingDokter ? 'Edit Data Dokter' : 'Tambah Dokter Baru'}</h3>
            <form onSubmit={handleSave} className={styles.modalForm}>
              <label>
                Nama Dokter
                <input
                  type="text"
                  maxLength={50}
                  required
                  value={formData.nama_dokter}
                  onChange={(e) => setFormData({ ...formData, nama_dokter: e.target.value })}
                  placeholder="Contoh: dr. Rina Kartika"
                />
              </label>

              <label>
                Poli
                <select
                  required
                  value={formData.id_poli}
                  onChange={(e) => setFormData({ ...formData, id_poli: e.target.value })}
                >
                  <option value="" disabled>
                    -- Pilih Poli --
                  </option>
                  {poliList.map((poli) => (
                    <option key={poli.id_poli} value={poli.id_poli}>
                      {poli.nama_poli}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Nomor HP
                <input
                  type="text"
                  maxLength={15}
                  required
                  value={formData.no_hp}
                  onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                placeholder="Contoh: 0813-1111-2222"
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
