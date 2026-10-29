import {
  Users,
  Building2,
  MapPin,
  Ruler,
  CalendarDays,
  Shield,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { useAdminMetrics } from '../../hooks/useAdmin';
import { UserRole } from '@lib/shared';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const { data: metrics, isLoading, error } = useAdminMetrics();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '8px' }}>
        <Loader2 className="animate-spin" size={28} />
        <span>Carregando métricas consolidadas da plataforma...</span>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--destructive)' }}>
        Falha ao carregar métricas administrativas. Verifique sua conexão com o backend.
      </div>
    );
  }

  const roleLabels: Record<UserRole, { label: string; desc: string }> = {
    [UserRole.ADMIN]: {
      label: 'Administradores',
      desc: 'Controle total da plataforma',
    },
    [UserRole.PRODUCER]: {
      label: 'Produtores Rurais',
      desc: 'Donos e gestores de fazendas',
    },
    [UserRole.INTERMEDIARY]: {
      label: 'Intermediários',
      desc: 'Cooperativas, consultores e agrônomos',
    },
    [UserRole.VIEWER]: {
      label: 'Visualizadores',
      desc: 'Auditores ESG, bancos e observadores',
    },
  };

  return (
    <div className={styles.container}>
      {/* Grid de Métricas Principais */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Usuários Registrados</span>
            <Users size={18} />
          </div>
          <span className={styles.metricValue}>{metrics.totalUsers}</span>
          <span className={styles.metricFooter}>Cadastros em todas as categorias</span>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Propriedades Rurais</span>
            <Building2 size={18} />
          </div>
          <span className={styles.metricValue}>{metrics.totalProperties}</span>
          <span className={styles.metricFooter}>Fazendas e unidades cadastradas</span>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Talhões Georreferenciados</span>
            <MapPin size={18} />
          </div>
          <span className={styles.metricValue}>{metrics.totalFields}</span>
          <span className={styles.metricFooter}>Polígonos espaciais mapeados</span>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Área Total Monitorada</span>
            <Ruler size={18} />
          </div>
          <span className={styles.metricValue}>
            {metrics.totalMonitoredAreaHa.toFixed(1)} ha
          </span>
          <span className={styles.metricFooter}>Hectares agrícolas sob gestão</span>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Ciclos e Safras</span>
            <CalendarDays size={18} />
          </div>
          <span className={styles.metricValue}>{metrics.totalCropCycles}</span>
          <span className={styles.metricFooter}>Cronogramas e fases ativas</span>
        </div>
      </div>

      {/* Grid de Detalhes: Distribuição de Perfis e Status */}
      <div className={styles.detailsGrid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Distribuição por Perfil de Usuário (RBAC)</h3>
          <div className={styles.roleList}>
            {(Object.keys(roleLabels) as UserRole[]).map((role) => (
              <div key={role} className={styles.roleRow}>
                <div className={styles.roleName}>
                  <Shield size={16} style={{ color: 'var(--primary)' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{roleLabels[role].label}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>
                      {roleLabels[role].desc}
                    </div>
                  </div>
                </div>
                <span className={styles.roleBadge}>
                  {metrics.usersByRole[role] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Status Operacional das Propriedades</h3>
          <div className={styles.roleList}>
            {Object.entries(metrics.propertiesByStatus).map(([status, count]) => (
              <div key={status} className={styles.roleRow}>
                <div className={styles.roleName}>
                  <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
                  <span>{status === 'ACTIVE' ? 'Ativas e Monitoradas' : 'Em Configuração'}</span>
                </div>
                <span className={styles.roleBadge}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
