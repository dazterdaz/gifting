import { useAuthStore } from '../stores/authStore';
import { dbService } from './database';
import { User, LoginCredentials } from '../types';

export const login = async ({ usernameOrEmail, password }: LoginCredentials): Promise<{ user: User, token: string } | null> => {
  console.log('🔐 Iniciando proceso de login...');
  
  try {
    // Buscar usuario en la base de datos
    const dbUser = await dbService.users.getByUsername(usernameOrEmail);
    
    if (!dbUser) {
      console.log('❌ Usuario no encontrado');
      return null;
    }
    
    // Verificar contraseña
    const isValidPassword = await dbService.users.verifyPassword(password, dbUser.password_hash);
    
    if (!isValidPassword) {
      console.log('❌ Contraseña incorrecta');
      return null;
    }
    
    console.log('✅ Credenciales correctas');
    
    // Actualizar último login
    await dbService.users.update(dbUser.id, { last_login: new Date().toISOString() });
    
    // Generar token (simulado)
    const token = `token-${Math.random().toString(36).substring(2, 10)}`;
    
    // Crear objeto usuario sin contraseña
    const user: User = {
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      role: dbUser.role,
      lastLogin: new Date().toISOString()
    };
    
    console.log('🎫 Token generado:', token);
    console.log('👤 Usuario autenticado:', user);
    
    return { user, token };
  } catch (error) {
    console.error('💥 Error en login:', error);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  const user = useAuthStore.getState().user;
  
  if (user) {
    console.log('👋 Cerrando sesión para:', user.username);
  }
  
  // Limpiar store local
  useAuthStore.getState().logout();
};

export const initializeUser = async (): Promise<void> => {
  const authStore = useAuthStore.getState();
  
  // Check if there's a stored session
  if (authStore.isAuthenticated && authStore.user && authStore.token) {
    console.log('✅ Usuario ya autenticado:', authStore.user.username);
  } else {
    console.log('ℹ️ No hay sesión activa');
  }
};

export const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<boolean> => {
  // Implementar cuando sea necesario
  await new Promise(resolve => setTimeout(resolve, 500));
  return true;
};