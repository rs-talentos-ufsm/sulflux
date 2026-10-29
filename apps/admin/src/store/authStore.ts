import { create } from 'zustand';
import type { UserResponseDTO } from '@lib/shared';

interface AuthState {
  user: UserResponseDTO | null;
  isAuthenticated: boolean;
  setUser: (user: UserResponseDTO | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
