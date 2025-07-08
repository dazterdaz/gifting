import { create } from 'zustand';
import { supabase } from '../lib/supabase';
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

export const useUserStore = create<UserState>()((set, get) => ({
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
  
  fetchUsers: async () => {
    console.log('👥 Cargando usuarios desde Supabase...');
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('username', { ascending: true });
      
      if (error) throw error;
      
      const users = data.map(row => ({
        id: row.id,
        username: row.username,
        email: row.email,
        role: row.role,
        lastLogin: row.last_login
      }));
      
      console.log('✅ Usuarios cargados desde Supabase:', users.length);
      
      // Si no hay usuarios, crear el usuario por defecto
      if (users.length === 0) {
        console.log('📝 No hay usuarios, creando usuario por defecto...');
        await get().initializeDefaultUser();
        return;
      }
      
      set({ users, loading: false });
    } catch (error) {
      console.error('❌ Error cargando usuarios desde Supabase:', error);
      
      // Para cualquier error, usar usuario por defecto local
      console.log('🔄 Usando usuario por defecto local debido a error de Supabase');
      const defaultUser: User = {
        id: 'admin-demian',
        username: 'demian',
        email: 'demian.83@hotmail.es',
        role: 'superadmin',
        lastLogin: new Date().toISOString()
      };
      set({ users: [defaultUser], loading: false, error: null });
    }
  },
  
  getUserById: async (id: string) => {
    console.log('🔍 Buscando usuario en Supabase:', id);
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        const user = {
          id: data.id,
          username: data.username,
          email: data.email,
          role: data.role,
          lastLogin: data.last_login
        };
        console.log('👤 Usuario encontrado:', user.username);
        set({ selectedUser: user, loading: false });
      } else {
        console.log('❌ Usuario no encontrado');
        set({ selectedUser: null, loading: false });
      }
    } catch (error) {
      console.error('❌ Error buscando usuario en Supabase:', error);
      set({ error: 'Error al cargar los detalles del usuario', loading: false });
    }
  },
  
  createUser: async (userData: Partial<User> & { password: string }) => {
    console.log('➕ Creando nuevo usuario en Supabase...');
    set({ loading: true, error: null });
    
    try {
      const newUser = {
        username: userData.username!,
        email: userData.email!,
        role: userData.role || 'admin',
        last_login: new Date().toISOString(),
        created_at: new Date().toISOString(),
        is_active: true
      };
      
      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();
      
      if (error) throw error;
      
      const createdUser: User = {
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
        lastLogin: data.last_login
      };
      
      console.log('✅ Usuario creado en Supabase:', createdUser.username);
      
      // Actualizar estado local
      set(state => ({ 
        users: [...state.users, createdUser],
        loading: false 
      }));
      
      return createdUser;
    } catch (error) {
      console.error('❌ Error creando usuario en Supabase:', error);
      set({ error: 'Error al crear el usuario', loading: false });
      throw error;
    }
  },
  
  updateUser: async (id: string, userData: Partial<User>) => {
    console.log('🔄 Actualizando usuario en Supabase:', id);
    set({ loading: true, error: null });
    
    try {
      const updateData = {
        username: userData.username,
        email: userData.email,
        role: userData.role,
        last_login: userData.lastLogin
      };
      
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      console.log('✅ Usuario actualizado en Supabase');
      
      // Actualizar estado local
      set(state => ({
        users: state.users.map(user => 
          user.id === id ? { ...user, ...userData } : user
        ),
        selectedUser: state.selectedUser?.id === id ? { ...state.selectedUser, ...userData } : state.selectedUser,
        loading: false
      }));
    } catch (error) {
      console.error('❌ Error actualizando usuario en Supabase:', error);
      set({ error: 'Error al actualizar el usuario', loading: false });
      throw error;
    }
  },
  
  deleteUser: async (id: string) => {
    console.log('🗑️ Eliminando usuario de Supabase:', id);
    set({ loading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      console.log('✅ Usuario eliminado de Supabase');
      
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
      console.error('❌ Error eliminando usuario de Supabase:', error);
      set({ error: 'Error al eliminar el usuario', loading: false });
      throw error;
    }
  },

  initializeDefaultUser: async () => {
    console.log('🔧 Inicializando usuario por defecto en Supabase...');
    set({ loading: true, error: null });
    
    try {
      // Primero verificar si el usuario ya existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('username', 'demian')
        .single();
      
      if (existingUser) {
        // El usuario ya existe, simplemente cargarlo
        const user = {
          id: existingUser.id,
          username: existingUser.username,
          email: existingUser.email,
          role: existingUser.role,
          lastLogin: existingUser.last_login
        };
        console.log('✅ Usuario por defecto ya existe en Supabase, cargando...');
        set({ users: [user], loading: false });
        return;
      }
      
      // El usuario no existe, crearlo
      const defaultUser = {
        id: 'admin-demian',
        username: 'demian',
        email: 'demian.83@hotmail.es',
        role: 'superadmin',
        last_login: new Date().toISOString(),
        created_at: new Date().toISOString(),
        is_active: true
      };
      
      const { data, error } = await supabase
        .from('users')
        .insert([defaultUser])
        .select()
        .single();
      
      if (error) throw error;
      
      const createdUser: User = {
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
        lastLogin: data.last_login
      };
      
      console.log('✅ Usuario por defecto creado en Supabase');
      
      set({ users: [createdUser], loading: false });
    } catch (error) {
      console.error('❌ Error inicializando usuario por defecto en Supabase:', error);
      
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