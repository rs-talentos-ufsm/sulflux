import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminDashboard from '../src/pages/dashboard/AdminDashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserRole } from '@lib/shared';

// Mock do hook useAdminMetrics
vi.mock('../src/hooks/useAdmin', () => ({
  useAdminMetrics: vi.fn(() => ({
    data: {
      totalUsers: 42,
      totalProperties: 12,
      totalFields: 38,
      totalMonitoredAreaHa: 1450.5,
      totalCropCycles: 55,
      usersByRole: {
        [UserRole.ADMIN]: 2,
        [UserRole.PRODUCER]: 25,
        [UserRole.INTERMEDIARY]: 10,
        [UserRole.VIEWER]: 5,
      },
      propertiesByStatus: {
        ACTIVE: 10,
        CONFIGURE: 2,
      },
    },
    isLoading: false,
    error: null,
  })),
}));

describe('AdminDashboard Component', () => {
  it('deve renderizar as métricas principais do painel de administração', () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <AdminDashboard />
      </QueryClientProvider>,
    );

    // Verifica cards de totais
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('38')).toBeInTheDocument();
    expect(screen.getByText('1450.5 ha')).toBeInTheDocument();
    expect(screen.getByText('55')).toBeInTheDocument();

    // Verifica seções de perfis
    expect(screen.getByText('Distribuição por Perfil de Usuário (RBAC)')).toBeInTheDocument();
    expect(screen.getByText('Produtores Rurais')).toBeInTheDocument();
    expect(screen.getByText('Intermediários')).toBeInTheDocument();
    expect(screen.getByText('Visualizadores')).toBeInTheDocument();
  });
});
