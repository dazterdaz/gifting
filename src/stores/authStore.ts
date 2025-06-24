import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      login: (user, token) => {
        console.log('🔐 Guardando usuario en store:', user);
        set({ isAuthenticated: true, user, token });
      },
      logout: () => {
        console.log('👋 Limpiando store de autenticación');
        set({ isAuthenticated: false, user: null, token: null });
      },
      updateUser: (userData) => 
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null
        })),
    }),
    {
      name: 'daz-auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.isAuthenticated && state?.user) {
          console.log('🔄 Rehidratando sesión para:', state.user.username);
        }
      }
    }
  )
);