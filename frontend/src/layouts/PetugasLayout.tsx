import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, List, Hospital, Users, Stethoscope, 
  History, LogOut, HeartPulse, Menu, X
} from 'lucide-react';
import styles from './PetugasLayout.module.css';

export default function PetugasLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/petugas/login');
  };

  // Fungsi untuk menutup sidebar otomatis saat menu diklik di mode mobile
  const handleMenuClick = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Overlay hitam transparan saat sidebar terbuka di mobile */}
      {isSidebarOpen && (
        <div 
          className={styles.sidebarOverlay} 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Sidebar Kiri */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logo}>
          <HeartPulse size={26} />
          <b>Klinik</b>
        </div>

        <nav className={styles.menuList}>
          <NavLink 
            to="/petugas/dashboard" 
            onClick={handleMenuClick}
            className={({ isActive }) => isActive ? styles.menuItemActive : styles.menuItem}
          >
            <LayoutGrid size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/petugas/poli" 
            onClick={handleMenuClick}
            className={({ isActive }) => isActive ? styles.menuItemActive : styles.menuItem}
          >
            <Hospital size={18} />
            <span>Kelola Poli</span>
          </NavLink>

          <NavLink 
            to="/petugas/pasien" 
            onClick={handleMenuClick}
            className={({ isActive }) => isActive ? styles.menuItemActive : styles.menuItem}
          >
            <Users size={18} />
            <span>Kelola Pasien</span>
          </NavLink>

          <NavLink 
            to="/petugas/dokter" 
            onClick={handleMenuClick}
            className={({ isActive }) => isActive ? styles.menuItemActive : styles.menuItem}
          >
            <Stethoscope size={18} />
            <span>Kelola Dokter</span>
          </NavLink>

          <NavLink 
            to="/petugas/antrean" 
            onClick={handleMenuClick}
            className={({ isActive }) => isActive ? styles.menuItemActive : styles.menuItem}
          >
            <List size={18} />
            <span>Daftar Antrean</span>
          </NavLink>

          <NavLink 
            to="/petugas/riwayat" 
            onClick={handleMenuClick}
            className={({ isActive }) => isActive ? styles.menuItemActive : styles.menuItem}
          >
            <History size={18} />
            <span>Riwayat Antrean</span>
          </NavLink>

          {/* <NavLink 
            to="/petugas/pengaturan" 
            onClick={handleMenuClick}
            className={({ isActive }) => isActive ? styles.menuItemActive : styles.menuItem}
          >
            <Settings size={18} />
            <span>Pengaturan</span>
          </NavLink> */}
        </nav>

        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Area Konten Utama */}
      <main className={styles.mainContent}>
        {/* Tombol Hamburger Mobile di bagian atas konten */}
        <div className={styles.mobileHeader}>
          <button 
            className={styles.menuToggleBtn} 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle Menu"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className={styles.mobileBrand}>Panel Petugas</span>
        </div>

        <Outlet />
      </main>
    </div>
  );
}