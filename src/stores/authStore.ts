import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signInWithEmailAndPassword, signOut } from '../lib/firebase';
import { auth } from '../lib/firebase';
import { User } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  firebaseUser: any | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  ensureFirebaseAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      firebaseUser: null,
      login: (user, token) => {
        console.log('🔐 Guardando usuario en store:', user);
        set({ isAuthenticated: true, user, token });
        
        // Autenticar en Firebase en background
        get().ensureFirebaseAuth().catch(error => {
          console.warn('⚠️ Error autenticando en Firebase:', error);
        });
      },
      logout: () => {
        console.log('👋 Limpiando store de autenticación');
        
        // Cerrar sesión en Firebase también
        signOut(auth).catch(error => {
          console.warn('⚠️ Error cerrando sesión en Firebase:', error);
        });
        
        set({ isAuthenticated: false, user: null, token: null });
      },
      updateUser: (userData) => 
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null
        })),
      
      ensureFirebaseAuth: async () => {
        const { user, firebaseUser } = get();
        
        if (!user) {
          console.log('❌ No hay usuario local autenticado');
          return false;
        }
        
        if (firebaseUser) {
          console.log('✅ Usuario ya autenticado en Firebase');
          return true;
        }
        
        try {
          console.log('🔐 Autenticando en Firebase...');
          
          const email = 'demian.83@hotmail.es';
          const password = '@Llamasami1';
          
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          
          console.log('✅ Autenticado en Firebase exitosamente');
          set({ firebaseUser: userCredential.user });
          
          return true;
          
        } catch (error) {
          console.error('❌ Error autenticando en Firebase:', error);
          
          if (error.code === 'auth/user-not-found') {
            console.log('📝 Usuario no existe en Firebase, creando...');
            // El usuario será creado por el proceso de inicialización
            return false;
          }
          
          return false;
        }
      }
    }),
    {
      name: 'daz-auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.isAuthenticated && state?.user) {
          console.log('🔄 Rehidratando sesión para:', state.user.username);
          
          // Intentar autenticar en Firebase después de rehidratar
          setTimeout(() => {
            state.ensureFirebaseAuth().catch(error => {
              console.warn('⚠️ Error en autenticación post-rehidratación:', error);
            });
          }, 1000);
        }
      }
    }
  )
);