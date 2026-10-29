import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { api } from '../../api/api';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'sonner';
import styles from './AdminLoginPage.module.css';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Preencha seu e-mail e senha.');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data.user);

      if (data.user?.role !== 'ADMIN') {
        toast.error('Acesso restrito: usuário logado não possui perfil de Administrador.');
        return;
      }

      toast.success('Autenticado no painel de administração!');
      navigate('/');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ||
          'Falha na autenticação. Verifique suas credenciais.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <ShieldCheck size={24} />
          </div>
          <h1 className={styles.title}>Sulflux Admin</h1>
          <p className={styles.subtitle}>
            Acesso restrito para administradores da plataforma
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>E-mail institucional</label>
            <input
              type="email"
              className={styles.input}
              placeholder="admin@sulflux.ufsm.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Senha de acesso</label>
            <input
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Entrando...
              </>
            ) : (
              'Acessar Painel de Administração'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
