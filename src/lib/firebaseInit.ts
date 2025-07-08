import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  Timestamp 
} from './firebase';
import { db } from './firebase';

import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword 
} from './firebase';
import { auth } from './firebase';

// Función para crear usuario de autenticación si no existe
export const ensureAuthUser = async () => {
  try {
    console.log('👤 Verificando/creando usuario de autenticación...');
    
    const email = 'demian.83@hotmail.es';
    const password = '@Llamasami1';
    
    try {
      // Intentar crear el usuario
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Usuario de autenticación creado:', userCredential.user.uid);
      
      // Crear documento de usuario en Firestore
      const userRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        username: 'demian',
        email: email,
        role: 'superadmin',
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now(),
        isActive: true
      });
      
      console.log('✅ Documento de usuario creado en Firestore');
      
      // Cerrar sesión después de crear
      await auth.signOut();
      console.log('👋 Sesión cerrada después de crear usuario');
      
      return userCredential.user;
      
    } catch (createError) {
      if (createError.code === 'auth/email-already-in-use') {
        console.log('ℹ️ Usuario de autenticación ya existe, verificando documento...');
        
        // Verificar que el documento de Firestore también existe
        try {
          const signInResult = await signInWithEmailAndPassword(auth, email, password);
          const currentUser = signInResult.user;
          
          if (currentUser) {
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);
            
            if (!userSnap.exists()) {
              console.log('📝 Creando documento de usuario faltante en Firestore...');
              await setDoc(userRef, {
                username: 'demian',
                email: email,
                role: 'superadmin',
                createdAt: Timestamp.now(),
                lastLogin: Timestamp.now(),
                isActive: true
              });
              console.log('✅ Documento de usuario creado en Firestore');
            } else {
              console.log('ℹ️ Documento de usuario ya existe en Firestore');
            }
            
            // Cerrar sesión después de verificar/crear
            await auth.signOut();
            console.log('👋 Sesión cerrada después de verificación');
            return currentUser;
          }
        } catch (signInError) {
          if (signInError.code === 'auth/wrong-password') {
            console.error('❌ Contraseña incorrecta para usuario existente');
            console.log('🔧 Puede que necesites resetear la contraseña en Firebase Console');
          } else {
            console.warn('⚠️ Error verificando usuario existente:', signInError);
          }
        }
      } else {
        console.error('❌ Error creando usuario de autenticación:', createError);
      }
    }
    return null;
    
  } catch (error) {
    console.error('❌ Error inicializando usuario de autenticación:', error);
    return null;
  }
};

// Función para verificar la conectividad con Firebase
export const checkFirebaseConnection = async () => {
  try {
    const testRef = doc(db, 'test', 'connection');
    await setDoc(testRef, { 
      timestamp: Timestamp.now(),
      test: true 
    });
    
    const testSnap = await getDoc(testRef);
    
    if (testSnap.exists()) {
      console.log('✅ Conexión con Firebase establecida correctamente');
      return true;
    } else {
      throw new Error('No se pudo verificar la conexión');
    }
  } catch (error) {
    console.error('❌ Error de conexión con Firebase:', error);
    return false;
  }
};

// Función para inicializar configuración básica
export const initializeBasicSettings = async () => {
  try {
    console.log('⚙️ Inicializando configuración básica...');
    
    const settingsRef = doc(db, 'settings', 'site-config');
    const settingsSnap = await getDoc(settingsRef);
    
    if (!settingsSnap.exists()) {
      console.log('📝 Creando configuración por defecto...');
      
      const defaultSettings = {
        siteName: 'Daz Giftcard Register',
        logoUrl: '/logo.svg',
        logoColor: '#4F46E5',
        terms: {
          id: 'default-terms',
          content: `
            <h3>Términos y Condiciones - Daz Giftcard Register</h3>
            
            <h4>1. Aceptación de los Términos</h4>
            <p>Al utilizar este sistema de consulta de tarjetas de regalo, usted acepta estar sujeto a estos términos y condiciones.</p>
            
            <h4>2. Uso del Sistema</h4>
            <p>Este sistema está diseñado para consultar el estado y validez de las tarjetas de regalo emitidas por Daz Tattoo.</p>
            
            <h4>3. Privacidad</h4>
            <p>La información consultada es confidencial y solo se muestra información básica del estado de la tarjeta.</p>
            
            <h4>4. Validez de las Tarjetas</h4>
            <p>Las tarjetas de regalo tienen una validez de 90 días desde su fecha de entrega.</p>
            
            <h4>5. Contacto</h4>
            <p>Para cualquier consulta adicional, contacte directamente con Daz Tattoo.</p>
          `,
          createdAt: Timestamp.now(),
          createdBy: 'Sistema',
          isActive: true
        },
        contactInfo: {
          phone: '+56 9 1234 5678',
          whatsapp: '+56 9 1234 5678',
          email: 'contacto@daztattoo.cl',
          address: 'Santiago, Chile'
        },
        testimonials: [
          {
            id: '1',
            name: 'María González',
            text: '¡Increíble experiencia! El regalo perfecto para mi hermana. El proceso fue súper fácil.',
            rating: 5,
            avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
          },
          {
            id: '2',
            name: 'Carlos Ruiz',
            text: 'Regalé una giftcard para un tatuaje y quedó espectacular. Muy profesionales.',
            rating: 5,
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
          },
          {
            id: '3',
            name: 'Ana López',
            text: 'El mejor regalo que he recibido. Mi piercing quedó perfecto y el trato fue excelente.',
            rating: 5,
            avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150'
          }
        ],
        socialLinks: [
          { id: '1', platform: 'Instagram', url: 'https://instagram.com/daztattoo', icon: 'instagram' },
          { id: '2', platform: 'Facebook', url: 'https://facebook.com/daztattoo', icon: 'facebook' },
          { id: '3', platform: 'WhatsApp', url: 'https://wa.me/56912345678', icon: 'whatsapp' }
        ],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      await setDoc(settingsRef, defaultSettings);
      console.log('✅ Configuración por defecto creada');
    } else {
      console.log('ℹ️ Configuración ya existe');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error inicializando configuración:', error);
    return false;
  }
};

// Función principal de inicialización
export const initializeFirebaseCollections = async () => {
  try {
    console.log('🔄 Inicializando Firebase...');
    
    // 1. Verificar conexión
    const isConnected = await checkFirebaseConnection();
    if (!isConnected) {
      console.warn('⚠️ No se pudo establecer conexión con Firebase');
      return false;
    }
    
    // 2. Crear usuario de autenticación
    await ensureAuthUser();
    
    // 3. Inicializar configuración básica
    await initializeBasicSettings();
    
    console.log('🎉 Firebase inicializado correctamente');
    return true;
    
  } catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
    return false;
  }
};

// Estructura de las colecciones para referencia
export const COLLECTIONS = {
  GIFTCARDS: 'giftcards',
  ACTIVITIES: 'activities',
  USERS: 'users',
  CONTACT_MESSAGES: 'contactMessages',
  SETTINGS: 'settings'
};

export default {
  initializeFirebaseCollections,
  checkFirebaseConnection,
  ensureAuthUser,
  COLLECTIONS
};