import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  LogOut,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.wrapper}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <ShieldCheck size={20} />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>Sulflux</span>
            <span className={styles.brandBadge}>Painel Admin</span>
          </div>
        </div>

        <nav className={styles.nav}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/users"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            <Users size={18} />
            <span>Gestão de Usuários</span>
          </NavLink>

          <a
            href="http://localhost:5174"
            target="_blank"
            rel="noreferrer"
            className={styles.navItem}
          >
            <Building2 size={18} />
            <span>App Produtor (5174)</span>
            <ExternalLink size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />
          </a>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name || 'Administrador'}</span>
            <span className={styles.userRole}>{user?.role || 'ADMIN'}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted-foreground)',
              padding: '6px',
            }}
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.main}>
        <header className={styles.header}>
          <h2 className={styles.headerTitle}>Painel Administrativo Sulflux</h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
            Porta 5184 · Ambiente de Gestão e Governança
          </span>
        </header>

        <section className={styles.content}>
          <Outlet />
        </section>
      </main>
    </div>
  );
}
