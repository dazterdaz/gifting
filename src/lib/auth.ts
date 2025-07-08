import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from './firebase';
import { auth, db, doc, getDoc } from './firebase';
import { useAuthStore } from '../stores/authStore';
import { useActivityStore } from '../stores/activityStore';
import { User, LoginCredentials } from '../types';

export const login = async ({ usernameOrEmail, password }: LoginCredentials): Promise<{ user: User, token: string } | null> => {
  console.log('🔐 Iniciando proceso de login con Firebase Auth...');
  
  try {
    // Convertir username a email si es necesario
    let email = usernameOrEmail;
    if (!usernameOrEmail.includes('@')) {
      // Si es username, convertir a email
      if (usernameOrEmail.toLowerCase() === 'demian') {
        email = 'demian.83@hotmail.es';
      } else {
        console.log('❌ Usuario no reconocido:', usernameOrEmail);
        return null;
      }
    }
    
    console.log('🔍 Intentando autenticar con email:', email);
    console.log('🔑 Usando contraseña:', password ? '***' : 'NO PASSWORD');
    
    // Autenticar con Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    console.log('✅ Autenticación exitosa con Firebase Auth');
    console.log('👤 UID de Firebase:', firebaseUser.uid);
    
    // Obtener datos adicionales del usuario desde Firestore
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      let userData: User;
      
      if (userDoc.exists()) {
        const docData = userDoc.data();
        userData = {
          id: firebaseUser.uid,
          username: docData.username || 'demian',
          email: firebaseUser.email || email,
          role: docData.role || 'superadmin',
          lastLogin: new Date().toISOString()
        };
        console.log('✅ Datos de usuario obtenidos de Firestore');
      } else {
        // Si no existe el documento, crear uno por defecto
        console.log('⚠️ Usuario no encontrado en Firestore, creando documento...');
        
        userData = {
          id: firebaseUser.uid,
          username: 'demian',
          email: firebaseUser.email || email,
          role: 'superadmin',
          lastLogin: new Date().toISOString()
        };
        
        // Intentar crear el documento en Firestore
        try {
          await setDoc(userDocRef, {
            username: userData.username,
            email: userData.email,
            role: userData.role,
            createdAt: Timestamp.fromDate(new Date()),
            lastLogin: Timestamp.fromDate(new Date()),
            isActive: true
          });
          console.log('✅ Documento de usuario creado en Firestore');
        } catch (createDocError) {
          console.warn('⚠️ No se pudo crear documento en Firestore:', createDocError);
        }
      }
      
      // Obtener token de Firebase
      const token = await firebaseUser.getIdToken();
      
      console.log('🎫 Token de Firebase obtenido');
      console.log('👤 Usuario autenticado:', userData);
      
      return { user: userData, token };
      
    } catch (firestoreError) {
      console.error('❌ Error obteniendo datos de Firestore:', firestoreError);
      
      // Como fallback, usar datos básicos de Firebase Auth
      const userData: User = {
        id: firebaseUser.uid,
        username: 'demian',
        email: firebaseUser.email || email,
        role: 'superadmin',
        lastLogin: new Date().toISOString()
      };
      
      const token = await firebaseUser.getIdToken();
      
      console.log('🔄 Usando datos básicos de Firebase Auth como fallback');
      return { user: userData, token };
    }
    
  } catch (error) {
    console.error('❌ Error en autenticación:', error);
    console.error('❌ Código de error:', error.code);
    console.error('❌ Mensaje de error:', error.message);
    
    // Si es error de credenciales inválidas
    if (
      error.code === 'auth/invalid-credential' || 
      error.code === 'auth/user-not-found' || 
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-email'
    ) {
      console.log('❌ Credenciales incorrectas');
      return null;
    }
    
    // Para otros errores, también retornar null
    console.log('❌ Error de autenticación:', error.code);
    return null;
  }
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
  
  try {
    await signOut(auth);
    console.log('✅ Sesión cerrada en Firebase Auth');
  } catch (error) {
    console.error('❌ Error cerrando sesión:', error);
  }
  
  useAuthStore.getState().logout();
};

export const initializeUser = async (): Promise<void> => {
  console.log('🔄 Inicializando autenticación...');
  
  return new Promise((resolve, reject) => {
    // Timeout de seguridad
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Timeout en inicialización de usuario');
      unsubscribe();
      resolve(); // Resolver en lugar de rechazar para no bloquear la app
    }, 5000);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      clearTimeout(timeoutId);
      
      const authStore = useAuthStore.getState();
      
      if (firebaseUser && authStore.isAuthenticated) {
        console.log('✅ Usuario ya autenticado:', authStore.user?.username);
        
        // Actualizar token si es necesario
        try {
          const newToken = await firebaseUser.getIdToken();
          if (newToken !== authStore.token) {
            console.log('🔄 Actualizando token de Firebase');
            authStore.login(authStore.user!, newToken);
          }
        } catch (tokenError) {
          console.warn('⚠️ Error actualizando token:', tokenError);
        }
        
      } else if (!firebaseUser && authStore.isAuthenticated) {
        console.log('⚠️ Usuario desautenticado en Firebase, limpiando estado local');
        authStore.logout();
      } else {
        console.log('ℹ️ No hay sesión activa');
      }
      
      unsubscribe();
      resolve();
    }, reject);
  });
};

export const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<boolean> => {
  // En una aplicación real, esto sería una llamada a la API para actualizar la contraseña
  await new Promise(resolve => setTimeout(resolve, 500));
  return true;
};

// Función para obtener el usuario actual autenticado
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = (): boolean => {
  return auth.currentUser !== null;
};