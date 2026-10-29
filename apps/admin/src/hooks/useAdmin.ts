import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/api';
import type {
  AdminMetricsResponseDTO,
  PaginatedUsersDTO,
  AdminUserFilterDTO,
  UserRole,
} from '@lib/shared';

export function useAdminMetrics() {
  return useQuery<AdminMetricsResponseDTO>({
    queryKey: ['admin', 'metrics'],
    queryFn: async () => {
      const { data } = await api.get('/admin/metrics');
      return data;
    },
  });
}

export function useAdminUsers(filters: AdminUserFilterDTO) {
  return useQuery<PaginatedUsersDTO>({
    queryKey: ['admin', 'users', filters],
    queryFn: async () => {
      const { data } = await api.get('/admin/users', {
        params: filters,
      });
      return data;
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: UserRole;
    }) => {
      const { data } = await api.patch(`/admin/users/${userId}/role`, {
        role,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    },
  });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      isActive,
    }: {
      userId: string;
      isActive: boolean;
    }) => {
      const { data } = await api.patch(`/admin/users/${userId}/status`, {
        isActive,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    },
  });
}
