import { useAuthStore } from '../stores/authStore';
import { authService, apiClient } from './api';
import { User, LoginCredentials } from '../types';

export const login = async ({ usernameOrEmail, password }: LoginCredentials): Promise<{ user: User, token: string } | null> => {
  console.log('🔐 Iniciando proceso de login...');
  
  try {
    const result = await authService.login({ usernameOrEmail, password });
    
    if (result) {
      console.log('✅ Credenciales correctas');
      
      // Configurar token en el cliente API
      apiClient.setToken(result.token);
      
      console.log('🎫 Token configurado:', result.token);
      console.log('👤 Usuario autenticado:', result.user);
      
      return result;
    } else {
      console.log('❌ Credenciales incorrectas');
      return null;
    }
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
  
  try {
    await authService.logout();
  } catch (error) {
    console.warn('⚠️ Error al cerrar sesión en el servidor:', error);
  }
  
  // Limpiar token del cliente
  apiClient.setToken(null);
  
  // Limpiar store local
  useAuthStore.getState().logout();
};

export const initializeUser = async (): Promise<void> => {
  const authStore = useAuthStore.getState();
  
  // Check if there's a stored session
  if (authStore.isAuthenticated && authStore.user && authStore.token) {
    console.log('✅ Usuario ya autenticado:', authStore.user.username);
    // Configurar token en el cliente API
    apiClient.setToken(authStore.token);
  } else {
    console.log('ℹ️ No hay sesión activa');
  }
};

export const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<boolean> => {
  // Implementar cuando sea necesario
  await new Promise(resolve => setTimeout(resolve, 500));
  return true;
};