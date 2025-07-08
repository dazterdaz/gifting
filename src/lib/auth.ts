import { useAuthStore } from '../stores/authStore';
import { User, LoginCredentials } from '../types';

export const login = async ({ usernameOrEmail, password }: LoginCredentials): Promise<{ user: User, token: string } | null> => {
  console.log('🔐 Iniciando proceso de login...');
  
  // Simular delay de API más corto
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Usuario hardcodeado para demo
  const demoUser = {
    id: 'admin-demian',
    username: 'demian',
    email: 'demian.83@hotmail.es',
    password: '@Llamasami1',
    role: 'superadmin' as const,
    lastLogin: new Date().toISOString()
  };
  
  console.log('🔍 Verificando credenciales...');
  console.log('Usuario ingresado:', usernameOrEmail);
  console.log('Usuario esperado:', demoUser.username);
  
  // Verificar credenciales (solo username, no email)
  if (usernameOrEmail.toLowerCase() !== demoUser.username.toLowerCase() || password !== demoUser.password) {
    console.log('❌ Credenciales incorrectas');
    return null;
  }
  
  console.log('✅ Credenciales correctas');
  
  // Generate mock token
  const token = `mock-token-${Math.random().toString(36).substring(2, 10)}`;
  
  // Strip password from returned user object
  const { password: _, ...safeUser } = demoUser;
  
  console.log('🎫 Token generado:', token);
  console.log('👤 Usuario autenticado:', safeUser);
  
  return { user: safeUser, token };
};

export const logout = async (): Promise<void> => {
  const user = useAuthStore.getState().user;
  
  if (user) {
    console.log('👋 Cerrando sesión para:', user.username);
  }
  
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
  // En una aplicación real, esto sería una llamada a la API para actualizar la contraseña
  await new Promise(resolve => setTimeout(resolve, 500));
  return true;
};