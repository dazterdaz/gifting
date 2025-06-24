import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface UserState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  
  fetchUsers: () => Promise<void>;
  getUserById: (id: string) => Promise<void>;
  createUser: (userData: Partial<User> & { password: string }) => Promise<User>;
  updateUser: (id: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  initializeDefaultUser: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: [
        {
          id: '1',
          username: 'demian',
          email: 'demian.83@hotmail.es',
          role: 'superadmin',
          lastLogin: new Date().toISOString()
        }
      ],
      selectedUser: null,
      loading: false,
      error: null,
      
      fetchUsers: async () => {
        set({ loading: true, error: null });
        try {
          // Simular carga de usuarios
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const { users } = get();
          
          // Si no hay usuarios, crear el usuario por defecto
          if (users.length === 0) {
            await get().initializeDefaultUser();
            return;
          }
          
          set({ loading: false });
        } catch (error) {
          console.error('Error fetching users:', error);
          set({ error: 'Error al cargar los usuarios', loading: false });
        }
      },
      
      getUserById: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const { users } = get();
          const user = users.find(u => u.id === id) || null;
          set({ selectedUser: user, loading: false });
        } catch (error) {
          console.error('Error fetching user:', error);
          set({ error: 'Error al cargar los detalles del usuario', loading: false });
        }
      },
      
      createUser: async (userData: Partial<User> & { password: string }) => {
        set({ loading: true, error: null });
        try {
          const newUser: User = {
            id: Math.random().toString(36).substring(2, 11),
            username: userData.username!,
            email: userData.email!,
            role: userData.role || 'admin',
            lastLogin: new Date().toISOString()
          };
          
          set(state => ({ 
            users: [...state.users, newUser],
            loading: false 
          }));
          
          return newUser;
        } catch (error) {
          console.error('Error creating user:', error);
          set({ error: 'Error al crear el usuario', loading: false });
          throw error;
        }
      },
      
      updateUser: async (id: string, userData: Partial<User>) => {
        set({ loading: true, error: null });
        try {
          set(state => ({
            users: state.users.map(user => 
              user.id === id ? { ...user, ...userData } : user
            ),
            selectedUser: state.selectedUser?.id === id ? { ...state.selectedUser, ...userData } : state.selectedUser,
            loading: false
          }));
        } catch (error) {
          console.error('Error updating user:', error);
          set({ error: 'Error al actualizar el usuario', loading: false });
        }
      },
      
      deleteUser: async (id: string) => {
        set({ loading: true, error: null });
        try {
          set(state => {
            const updatedUsers = state.users.filter(user => user.id !== id);
            const updatedSelectedUser = state.selectedUser?.id === id ? null : state.selectedUser;
            
            return {
              users: updatedUsers,
              selectedUser: updatedSelectedUser,
              loading: false
            };
          });
        } catch (error) {
          console.error('Error deleting user:', error);
          set({ error: 'Error al eliminar el usuario', loading: false });
          throw error;
        }
      },

      initializeDefaultUser: async () => {
        try {
          const defaultUser: User = {
            id: '1',
            username: 'demian',
            email: 'demian.83@hotmail.es',
            role: 'superadmin',
            lastLogin: new Date().toISOString()
          };
          
          set({ users: [defaultUser], loading: false });
        } catch (error) {
          console.error('Error initializing default user:', error);
          set({ error: 'Error al inicializar usuario por defecto', loading: false });
        }
      }
    }),
    {
      name: 'daz-users-storage',
      version: 1
    }
  )
);