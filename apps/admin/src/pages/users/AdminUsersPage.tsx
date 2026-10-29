import { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import {
  useAdminUsers,
  useUpdateUserRole,
  useToggleUserStatus,
} from '../../hooks/useAdmin';
import { UserRole } from '@lib/shared';
import { toast } from 'sonner';
import styles from './AdminUsersPage.module.css';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const {
    data: usersData,
    isLoading,
    isFetching,
  } = useAdminUsers({
    page,
    limit: 10,
    search: search.trim() || undefined,
    role: (roleFilter as UserRole) || undefined,
  });

  const updateRole = useUpdateUserRole();
  const toggleStatus = useToggleUserStatus();

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateRole.mutateAsync({ userId, role: newRole });
      toast.success('Papel do usuário atualizado com sucesso!');
    } catch {
      toast.error('Erro ao atualizar papel do usuário.');
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleStatus.mutateAsync({ userId, isActive: !currentStatus });
      toast.success(`Usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`);
    } catch {
      toast.error('Erro ao alterar status do usuário.');
    }
  };

  const users = usersData?.data || [];
  const meta = usersData?.meta;

  return (
    <div className={styles.container}>
      {/* Barra de Filtros */}
      <div className={styles.filtersBar}>
        <input
          type="text"
          placeholder="Buscar usuário por nome ou e-mail..."
          className={styles.searchInput}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <select
          className={styles.filterSelect}
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Todos os Papéis</option>
          <option value={UserRole.ADMIN}>Admin</option>
          <option value={UserRole.PRODUCER}>Produtor</option>
          <option value={UserRole.INTERMEDIARY}>Intermediários</option>
          <option value={UserRole.VIEWER}>Visualizador</option>
        </select>
      </div>

      {/* Tabela de Usuários */}
      <div className={styles.tableContainer}>
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '8px' }}>
            <Loader2 className="animate-spin" size={24} />
            <span>Carregando usuários...</span>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            Nenhum usuário encontrado com os filtros selecionados.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Usuário</th>
                <th className={styles.th}>Papel no Sistema (RBAC)</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Data de Cadastro</th>
                <th className={styles.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className={styles.td}>
                    <div className={styles.userCell}>
                      <span className={styles.userName}>{user.name}</span>
                      <span className={styles.userEmail}>{user.email}</span>
                    </div>
                  </td>

                  <td className={styles.td}>
                    <select
                      className={styles.roleSelect}
                      value={user.role}
                      disabled={updateRole.isPending}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value as UserRole)
                      }
                    >
                      <option value={UserRole.ADMIN}>Admin</option>
                      <option value={UserRole.PRODUCER}>Produtor</option>
                      <option value={UserRole.INTERMEDIARY}>Intermediários</option>
                      <option value={UserRole.VIEWER}>Visualizador</option>
                    </select>
                  </td>

                  <td className={styles.td}>
                    {user.isActive ? (
                      <span className={styles.statusActive}>
                        <CheckCircle2 size={14} /> Ativo
                      </span>
                    ) : (
                      <span className={styles.statusInactive}>
                        <XCircle size={14} /> Inativo
                      </span>
                    )}
                  </td>

                  <td className={styles.td}>
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </td>

                  <td className={styles.td}>
                    <button
                      type="button"
                      className={styles.statusBtn}
                      disabled={toggleStatus.isPending}
                      onClick={() => handleToggleStatus(user.id, user.isActive)}
                    >
                      {user.isActive ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginação */}
      {meta && (
        <div className={styles.pagination}>
          <span>
            Mostrando página {meta.currentPage} de {meta.totalPages} ({meta.totalItems} usuários no total)
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={styles.statusBtn}
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>
            <button
              type="button"
              className={styles.statusBtn}
              disabled={page >= meta.totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
