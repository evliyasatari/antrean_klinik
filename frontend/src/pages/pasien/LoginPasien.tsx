import { useState } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import LoginForm from '../../components/LoginFormPasien';
import RegisterForm from '../../components/RegisterFormPasien';
import styles from '../pasien/css/Login.module.css';

const Login: FC = () => {
  const navigate = useNavigate();
  const [isLoginTab, setIsLoginTab] = useState<boolean>(true);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.loginCard}>
        <div className={styles.cardContent}>
          
          {/* Header Brand */}
          <div className={styles.brandHeader}>
            <div className={styles.logoBox}>
              <HeartPulse size={26} color="#1e5eff" strokeWidth={2.3} />
            </div>
            <div>
              <h2>Klinik</h2>
              <p>Silakan masuk atau buat akun baru</p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className={styles.divtabs}>
            <div 
              className={isLoginTab ? styles.divtabActive : styles.divtabInactive} 
              onClick={() => setIsLoginTab(true)}
            >
              <span>Masuk</span>
            </div>
            <div 
              className={!isLoginTab ? styles.divtabActive : styles.divtabInactive} 
              onClick={() => setIsLoginTab(false)}
            >
              <span>Daftar</span>
            </div>
          </div>

          {/* Render Form Dinamis */}
          {isLoginTab ? <LoginForm /> : <RegisterForm onSuccess={() => setIsLoginTab(true)} />}

        </div>

        {/* Wave Dekoratif di Bawah Kartu */}
        <div className={styles.waveFooter}>
          <svg className={styles.waveSvg} viewBox="0 0 500 150" preserveAspectRatio="none">
            <path 
              d="M0.00,49.98 C149.99,150.00 349.20,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" 
              style={{ stroke: 'none', fill: '#eaf2ff' }}
            ></path>
          </svg>
        </div>

      </div>
    </div>
  );
};

export default Login;