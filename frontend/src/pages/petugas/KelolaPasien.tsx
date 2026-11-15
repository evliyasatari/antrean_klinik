import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Search, Pencil, Trash2, Plus } from 'lucide-react';
import api from '../../api/axios';
import styles from './css/KelolaPasien.module.css';

interface Pasien {
  id_pasien: number;
  nik: string;
  nama_pasien: string;
  jenis_kelamin: 'L' | 'P';
  tanggal_lahir: string;
  no_hp: string;
  alamat: string;
}

export default function KelolaPasien() {
  const [pasienList, setPasienList] = useState<Pasien[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPasien, setEditingPasien] = useState<Pasien | null>(null);
  const [formData, setFormData] = useState({
    nik: '',
    nama_pasien: '',
    jenis_kelamin: 'L' as 'L' | 'P',
    tanggal_lahir: '',
    no_hp: '',
    alamat: '',
  });

  // 1. Mengambil data pasien langsung dari database via API backend
  const fetchPasien = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const response = await api.get('/petugas/pasien');

      // Normalisasi format agar tetap terbaca baik backend mengirim snake_case maupun camelCase
      const formattedData: Pasien[] = response.data.map((item: any) => ({
        id_pasien: item.id_pasien ?? item.idPasien,
        nik: item.nik ?? '',
        nama_pasien: item.nama_pasien ?? item.namaPasien ?? '',
        jenis_kelamin: item.jenis_kelamin ?? item.jenisKelamin ?? 'L',
        tanggal_lahir: item.tanggal_lahir ?? item.tanggalLahir ?? '',
        no_hp: item.no_hp ?? item.noHp ?? '',
        alamat: item.alamat ?? '',
      }));

      setPasienList(formattedData);
    } catch (error: any) {
      console.error('Gagal mengambil data pasien:', error);
      setErrorMsg(
        error.response?.data?.message || 'Gagal memuat data pasien dari server.'
      );
      setPasienList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasien();
  }, []);

  // 2. Filter pencarian berdasarkan Nama, NIK, atau No. HP
  const filteredPasien = pasienList.filter(
    (item) =>
      item.nama_pasien.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nik.includes(searchQuery) ||
      item.no_hp.includes(searchQuery)
  );

  // 3. Buka modal untuk Tambah atau Edit
  const openModal = (pasien?: Pasien) => {
    if (pasien) {
      setEditingPasien(pasien);
      setFormData({
        nik: pasien.nik,
        nama_pasien: pasien.nama_pasien,
        jenis_kelamin: pasien.jenis_kelamin,
        tanggal_lahir: pasien.tanggal_lahir ? pasien.tanggal_lahir.split('T')[0] : '',
        no_hp: pasien.no_hp,
        alamat: pasien.alamat,
      });
    } else {
      setEditingPasien(null);
      setFormData({
        nik: '',
        nama_pasien: '',
        jenis_kelamin: 'L',
        tanggal_lahir: '',
        no_hp: '',
        alamat: '',
      });
    }
    setIsModalOpen(true);
  };

  // 4. Simpan data (POST untuk baru, PUT untuk edit)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nik: formData.nik.trim(),
      nama_pasien: formData.nama_pasien.trim(),
      jenis_kelamin: formData.jenis_kelamin,
      tanggal_lahir: formData.tanggal_lahir,
      no_hp: formData.no_hp.trim(),
      alamat: formData.alamat.trim(),
    };

    try {
      if (editingPasien) {
        await api.put(`/petugas/pasien/${editingPasien.id_pasien}`, payload);
      } else {
        await api.post('/petugas/pasien', payload);
      }
      setIsModalOpen(false);
      fetchPasien();
    } catch (error: any) {
      console.error('Gagal menyimpan data pasien:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan data pasien ke server.');
    }
  };

  // 5. Hapus data pasien
  const handleDelete = async (id: number, nama: string) => {
    if (!window.confirm(`Yakin ingin menghapus data pasien ${nama}?`)) return;
    try {
      await api.delete(`/petugas/pasien/${id}`);
      fetchPasien();
    } catch (error: any) {
      console.error('Gagal menghapus pasien:', error);
      alert(
        error.response?.data?.message ||
          'Gagal menghapus data pasien. Pastikan pasien tidak memiliki riwayat pendaftaran.'
      );
    }
  };

  const formatTanggal = (tgl: string) => {
    if (!tgl) return '-';
    const date = new Date(tgl);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
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
            placeholder="Cari data pasien..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabel Data Pasien */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>No</th>
                <th>NIK</th>
                <th>Nama Pasien</th>
                <th>JK</th>
                <th>Tanggal Lahir</th>
                <th>No. HP</th>
                <th>Alamat</th>
                <th style={{ width: '100px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className={styles.emptyText}>
                    Memuat data...
                  </td>
                </tr>
              ) : filteredPasien.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.emptyText}>
                    Data pasien tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredPasien.map((pasien, index) => (
                  <tr key={pasien.id_pasien}>
                    <td>{index + 1}</td>
                    <td>{pasien.nik}</td>
                    <td>
                      <strong>{pasien.nama_pasien}</strong>
                    </td>
                    <td>{pasien.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                    <td>{formatTanggal(pasien.tanggal_lahir)}</td>
                    <td>{pasien.no_hp}</td>
                    <td>{pasien.alamat}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.editBtn}
                          onClick={() => openModal(pasien)}
                          title="Edit Pasien"
                        >
                          <Pencil size={15} color="#ffffff" />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(pasien.id_pasien, pasien.nama_pasien)}
                          title="Hapus Pasien"
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

        {/* Tombol Tambah Pasien */}
        <div className={styles.footerAction}>
          <button className={styles.addBtn} onClick={() => openModal()}>
            <Plus size={16} />
            <span>Tambah Pasien</span>
          </button>
        </div>
      </section>

      {/* Modal Form Tambah / Edit Pasien */}
            {/* Modal Form Tambah / Edit Pasien */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3>{editingPasien ? 'Edit Data Pasien' : 'Tambah Pasien Baru'}</h3>
            <form onSubmit={handleSave} className={styles.modalForm}>
              <label>
                NIK
                <input
                  type="text"
                  maxLength={20}
                  required
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  placeholder="Contoh: 3273011205950001"
                />
              </label>

              <label>
                Nama Pasien
                <input
                  type="text"
                  maxLength={50}
                  required
                  value={formData.nama_pasien}
                  onChange={(e) => setFormData({ ...formData, nama_pasien: e.target.value })}
                  placeholder="Contoh: Andi Pratama"
                />
              </label>

              <div className={styles.formRow}>
                <label>
                  Jenis Kelamin
                  <select
                    value={formData.jenis_kelamin}
                    onChange={(e) =>
                      setFormData({ ...formData, jenis_kelamin: e.target.value as 'L' | 'P' })
                    }
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </label>

                <label>
                  Tanggal Lahir
                  <input
                    type="date"
                    required
                    value={formData.tanggal_lahir}
                    onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                  />
                </label>
              </div>

              <label>
                Nomor HP
                <input
                  type="text"
                  maxLength={15}
                  required
                  value={formData.no_hp}
                  onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                  placeholder="Contoh: 081211112222"
                />
              </label>

              <label>
                Alamat
                <input
                  type="text"
                  maxLength={50}
                  required
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Contoh: Jl. Dago No. 10, Bandung"
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