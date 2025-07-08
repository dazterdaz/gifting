import { create } from 'zustand';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc, 
  query, 
  orderBy, 
  Timestamp 
} from '../lib/firebase';
import { db } from '../lib/firebase';
import { User } from '../types';

// Convertir documento de Firestore a User
const convertFirestoreToUser = (doc: any): User => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    lastLogin: data.lastLogin?.toDate?.()?.toISOString() || data.lastLogin,
  };
};

// Convertir User a formato Firestore
const convertUserToFirestore = (user: Partial<User>) => {
  const data = { ...user };
  
  if (data.lastLogin) {
    data.lastLogin = Timestamp.fromDate(new Date(data.lastLogin));
  }
  
  delete data.id;
  return data;
};

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
    console.log('👥 Cargando usuarios desde Firebase...');
    
    // Establecer usuario por defecto inmediatamente
    const defaultUser: User = {
      id: 'admin-demian',
      username: 'demian',
      email: 'demian.83@hotmail.es',
      role: 'superadmin',
      lastLogin: new Date().toISOString()
    };
    
    set({ users: [defaultUser], loading: true, error: null });
    
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('username', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const users = querySnapshot.docs.map(convertFirestoreToUser);
      
      console.log('✅ Usuarios cargados desde Firebase:', users.length);
      
      // Si no hay usuarios, crear el usuario por defecto
      if (users.length > 0) {
        set({ users, loading: false });
      } else {
        // Mantener usuario por defecto si no hay usuarios en Firebase
        console.log('ℹ️ No hay usuarios en Firebase, manteniendo usuario por defecto');
        set({ loading: false });
      }
    } catch (error) {
      console.error('❌ Error cargando usuarios desde Firebase:', error);
      
      // Si hay error, mantener usuario por defecto
      if ((error as any).code === 'permission-denied') {
        console.log('🔄 Manteniendo usuario por defecto debido a permisos');
        set({ loading: false, error: null });
      } else {
        console.log('🔄 Error de conexión, manteniendo usuario por defecto');
        set({ loading: false, error: null });
      }
    }
  },
  
  getUserById: async (id: string) => {
    console.log('🔍 Buscando usuario en Firebase:', id);
    set({ loading: true, error: null });
    
    try {
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const user = convertFirestoreToUser(docSnap);
        console.log('👤 Usuario encontrado:', user.username);
        set({ selectedUser: user, loading: false });
      } else {
        console.log('❌ Usuario no encontrado');
        set({ selectedUser: null, loading: false });
      }
    } catch (error) {
      console.error('❌ Error buscando usuario en Firebase:', error);
      set({ error: 'Error al cargar los detalles del usuario', loading: false });
    }
  },
  
  createUser: async (userData: Partial<User> & { password: string }) => {
    console.log('➕ Creando nuevo usuario en Firebase...');
    set({ loading: true, error: null });
    
    try {
      const newUser: Omit<User, 'id'> = {
        username: userData.username!,
        email: userData.email!,
        role: userData.role || 'admin',
        lastLogin: new Date().toISOString()
      };
      
      // Guardar en Firebase
      const usersRef = collection(db, 'users');
      const firestoreData = convertUserToFirestore(newUser);
      const docRef = await addDoc(usersRef, firestoreData);
      
      const createdUser: User = {
        ...newUser,
        id: docRef.id
      };
      
      console.log('✅ Usuario creado en Firebase:', createdUser.username);
      
      // Actualizar estado local
      set(state => ({ 
        users: [...state.users, createdUser],
        loading: false 
      }));
      
      return createdUser;
    } catch (error) {
      console.error('❌ Error creando usuario en Firebase:', error);
      set({ error: 'Error al crear el usuario', loading: false });
      throw error;
    }
  },
  
  updateUser: async (id: string, userData: Partial<User>) => {
    console.log('🔄 Actualizando usuario en Firebase:', id);
    set({ loading: true, error: null });
    
    try {
      // Actualizar en Firebase
      const docRef = doc(db, 'users', id);
      const firestoreData = convertUserToFirestore(userData);
      await updateDoc(docRef, firestoreData);
      
      console.log('✅ Usuario actualizado en Firebase');
      
      // Actualizar estado local
      set(state => ({
        users: state.users.map(user => 
          user.id === id ? { ...user, ...userData } : user
        ),
        selectedUser: state.selectedUser?.id === id ? { ...state.selectedUser, ...userData } : state.selectedUser,
        loading: false
      }));
    } catch (error) {
      console.error('❌ Error actualizando usuario en Firebase:', error);
      set({ error: 'Error al actualizar el usuario', loading: false });
      throw error;
    }
  },
  
  deleteUser: async (id: string) => {
    console.log('🗑️ Eliminando usuario de Firebase:', id);
    set({ loading: true, error: null });
    
    try {
      // Eliminar de Firebase
      const docRef = doc(db, 'users', id);
      await deleteDoc(docRef);
      
      console.log('✅ Usuario eliminado de Firebase');
      
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
      console.error('❌ Error eliminando usuario de Firebase:', error);
      set({ error: 'Error al eliminar el usuario', loading: false });
      throw error;
    }
  },

  initializeDefaultUser: async () => {
    console.log('🔧 Inicializando usuario por defecto en Firebase...');
    
    const defaultUser: User = {
      id: 'admin-demian',
      username: 'demian',
      email: 'demian.83@hotmail.es',
      role: 'superadmin',
      lastLogin: new Date().toISOString()
    };
    
    // Establecer usuario por defecto inmediatamente
    set({ users: [defaultUser], loading: true, error: null });
    
    try {
      // Primero verificar si el usuario ya existe
      const docRef = doc(db, 'users', 'admin-demian');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // El usuario ya existe, simplemente cargarlo
        const existingUser = convertFirestoreToUser(docSnap);
        set({ users: [existingUser], loading: false });
        return;
      }
      
      // El usuario no existe, crearlo
      
      // Crear en Firebase con ID específico (solo si no existe)
      const { id, ...userWithoutId } = defaultUser;
      const firestoreData = convertUserToFirestore(userWithoutId);
      await setDoc(docRef, firestoreData);
      
      console.log('✅ Usuario por defecto creado en Firebase');
      
      set({ users: [defaultUser], loading: false });
    } catch (error) {
      console.error('❌ Error inicializando usuario por defecto en Firebase:', error);
      
      // Como fallback, usar datos locales temporalmente
      console.log('🔄 Usando usuario por defecto local como fallback');
      set({ users: [defaultUser], loading: false, error: null });
    }
  }
}));