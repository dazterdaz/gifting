import { create } from 'zustand';
import { dbService } from '../lib/database';
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

// Convertir datos de base de datos a formato de la aplicación
const convertDbToUser = (dbData: any): User => ({
  id: dbData.id,
  username: dbData.username,
  email: dbData.email,
  role: dbData.role,
  lastLogin: dbData.last_login
});

export const useUserStore = create<UserState>()((set, get) => ({
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
  
  fetchUsers: async () => {
    console.log('👥 Cargando usuarios desde base de datos...');
    set({ loading: true, error: null });
    
    try {
      const dbUsers = await dbService.users.getAll();
      const users = dbUsers.map(convertDbToUser);
      
      console.log('✅ Usuarios cargados desde base de datos:', users.length);
      
      // Si no hay usuarios, crear el usuario por defecto
      if (users.length === 0) {
        await get().initializeDefaultUser();
        return;
      }
      
      set({ users, loading: false });
    } catch (error) {
      console.error('❌ Error cargando usuarios desde base de datos:', error);
      
      // Intentar crear usuario por defecto como fallback
      console.log('🔄 Intentando crear usuario por defecto debido a error...');
      await get().initializeDefaultUser();
    }
  },
  
  getUserById: async (id: string) => {
    console.log('🔍 Buscando usuario en base de datos:', id);
    set({ loading: true, error: null });
    
    try {
      const dbUser = await dbService.users.getById(id);
      if (dbUser) {
        const user = convertDbToUser(dbUser);
        console.log('👤 Usuario encontrado:', user.username);
        set({ selectedUser: user, loading: false });
      } else {
        console.log('❌ Usuario no encontrado');
        set({ selectedUser: null, loading: false });
      }
    } catch (error) {
      console.error('❌ Error buscando usuario en base de datos:', error);
      set({ error: 'Error al cargar los detalles del usuario', loading: false });
    }
  },
  
  createUser: async (userData: Partial<User> & { password: string }) => {
    console.log('➕ Creando nuevo usuario en base de datos...');
    set({ loading: true, error: null });
    
    try {
      const dbUser = await dbService.users.create(userData);
      const newUser = convertDbToUser(dbUser);
      
      console.log('✅ Usuario creado en base de datos:', newUser.username);
      
      // Actualizar estado local
      set(state => ({ 
        users: [...state.users, newUser],
        loading: false 
      }));
      
      return newUser;
    } catch (error) {
      console.error('❌ Error creando usuario en base de datos:', error);
      set({ error: 'Error al crear el usuario', loading: false });
      throw error;
    }
  },
  
  updateUser: async (id: string, userData: Partial<User>) => {
    console.log('🔄 Actualizando usuario en base de datos:', id);
    set({ loading: true, error: null });
    
    try {
      const dbUser = await dbService.users.update(id, userData);
      const updatedUser = convertDbToUser(dbUser);
      
      console.log('✅ Usuario actualizado en base de datos');
      
      // Actualizar estado local
      set(state => ({
        users: state.users.map(user => 
          user.id === id ? updatedUser : user
        ),
        selectedUser: state.selectedUser?.id === id ? updatedUser : state.selectedUser,
        loading: false
      }));
    } catch (error) {
      console.error('❌ Error actualizando usuario en base de datos:', error);
      set({ error: 'Error al actualizar el usuario', loading: false });
      throw error;
    }
  },
  
  deleteUser: async (id: string) => {
    console.log('🗑️ Eliminando usuario de base de datos:', id);
    set({ loading: true, error: null });
    
    try {
      await dbService.users.delete(id);
      
      console.log('✅ Usuario eliminado de base de datos');
      
      // Actualizar estado local
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
      console.error('❌ Error eliminando usuario de base de datos:', error);
      set({ error: 'Error al eliminar el usuario', loading: false });
      throw error;
    }
  },

  initializeDefaultUser: async () => {
    console.log('🔧 Inicializando usuario por defecto en base de datos...');
    set({ loading: true, error: null });
    
    try {
      // Verificar si el usuario ya existe
      const existingUser = await dbService.users.getById('admin-demian');
      
      if (existingUser) {
        const user = convertDbToUser(existingUser);
        console.log('✅ Usuario por defecto ya existe en base de datos, cargando...');
        set({ users: [user], loading: false });
        return;
      }
      
      // El usuario no existe, crearlo
      const defaultUserData = {
        username: 'demian',
        email: 'demian.83@hotmail.es',
        password: '@Llamasami1',
        role: 'superadmin' as const
      };
      
      const dbUser = await dbService.users.create(defaultUserData);
      const createdUser = convertDbToUser(dbUser);
      
      console.log('✅ Usuario por defecto creado en base de datos');
      
      set({ users: [createdUser], loading: false });
    } catch (error) {
      console.error('❌ Error inicializando usuario por defecto en base de datos:', error);
      
      // Como fallback, usar datos locales temporalmente
      const defaultUser: User = {
        id: 'admin-demian',
        username: 'demian',
        email: 'demian.83@hotmail.es',
        role: 'superadmin',
        lastLogin: new Date().toISOString()
      };
      
      console.log('🔄 Usando usuario por defecto local como fallback');
      set({ users: [defaultUser], loading: false, error: null });
    }
  }
}));