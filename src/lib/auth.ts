import { useAuthStore } from '../stores/authStore';
import { useActivityStore } from '../stores/activityStore';
import { User, LoginCredentials } from '../types';

export const login = async ({ usernameOrEmail, password }: LoginCredentials): Promise<{ user: User, token: string } | null> => {
  console.log('🔐 Iniciando proceso de login...');
  
  // Simulating API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Usuario hardcodeado para el sistema
  const systemUser = {
    id: 'admin-demian',
    username: 'demian',
    email: 'demian.83@hotmail.es',
    password: '@Llamasami1',
    role: 'superadmin' as const,
    lastLogin: new Date().toISOString()
  };
  
  console.log('🔍 Verificando credenciales...');
  
  // Verificar credenciales (username o email)
  const isValidUsername = usernameOrEmail.toLowerCase() === systemUser.username.toLowerCase();
  const isValidEmail = usernameOrEmail.toLowerCase() === systemUser.email.toLowerCase();
  const isValidPassword = password === systemUser.password;
  
  if ((!isValidUsername && !isValidEmail) || !isValidPassword) {
    console.log('❌ Credenciales incorrectas');
    return null;
  }
  
  console.log('✅ Credenciales correctas');
  
  // Generate mock token
  const token = `token-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`;
  
  // Strip password from returned user object
  const { password: _, ...safeUser } = systemUser;
  
  console.log('🎫 Token generado');
  console.log('👤 Usuario autenticado:', safeUser.username);
  
  return { user: safeUser, token };
};

export const logout = async (): Promise<void> => {
  const user = useAuthStore.getState().user;
  
  if (user) {
    console.log('👋 Cerrando sesión para:', user.username);
    
    // Registrar logout en actividades si es posible
    try {
      const { logActivity } = useActivityStore.getState();
      await logActivity({
        userId: user.id,
        username: user.username,
        action: 'logout',
        targetType: 'system',
        details: `${user.username} cerró sesión`
      });
    } catch (activityError) {
      console.warn('⚠️ Error registrando logout:', activityError);
    }
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

export const changePassword = async (_userId: string, _currentPassword: string, _newPassword: string): Promise<boolean> => {
  // En una aplicación real, esto sería una llamada a la API para actualizar la contraseña
  await new Promise(resolve => setTimeout(resolve, 500));
  return true;
};

// Función para obtener el usuario actual autenticado
export const getCurrentUser = (): User | null => {
  return useAuthStore.getState().user;
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = (): boolean => {
  return useAuthStore.getState().isAuthenticated;
};