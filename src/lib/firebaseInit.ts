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

// Estructura de datos inicial para las colecciones
const initialData = {
  // Configuración del sitio
  settings: {
    id: 'site-config',
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
  },

  // Usuario administrador por defecto
  users: [
    {
      id: 'admin-demian',
      username: 'demian',
      email: 'demian.83@hotmail.es',
      role: 'superadmin',
      createdAt: Timestamp.now(),
      lastLogin: Timestamp.now(),
      isActive: true
    }
  ]
};

// Función para inicializar las colecciones en Firebase
export const initializeFirebaseCollections = async () => {
  try {
    console.log('🔄 Inicializando colecciones de Firebase...');
    
    // 1. Crear usuario de autenticación si no existe
    await initializeAuthUser();

    // 1. Crear configuración del sitio
    const settingsRef = doc(db, 'settings', 'site-config');
    const settingsSnap = await getDoc(settingsRef);
    
    if (!settingsSnap.exists()) {
      await setDoc(settingsRef, initialData.settings);
      console.log('✅ Configuración del sitio creada en Firebase');
    } else {
      console.log('ℹ️ Configuración del sitio ya existe en Firebase');
    }

    // 2. Crear usuario administrador
    for (const user of initialData.users) {
      const userRef = doc(db, 'users', user.id);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, user);
        console.log(`✅ Usuario ${user.username} creado en Firebase`);
      } else {
        console.log(`ℹ️ Usuario ${user.username} ya existe en Firebase`);
      }
    }

    // 3. Crear índices de colecciones (documentos vacíos para inicializar)
    const collections = [
      'giftcards',
      'activities', 
      'contactMessages'
    ];

    for (const collectionName of collections) {
      const initRef = doc(db, collectionName, '_init');
      const initSnap = await getDoc(initRef);
      
      if (!initSnap.exists()) {
        await setDoc(initRef, {
          _initialized: true,
          createdAt: Timestamp.now(),
          description: `Colección ${collectionName} inicializada`
        });
        console.log(`✅ Colección ${collectionName} inicializada en Firebase`);
      } else {
        console.log(`ℹ️ Colección ${collectionName} ya existe en Firebase`);
      }
    }

    console.log('🎉 Todas las colecciones de Firebase han sido inicializadas correctamente');
    
    return true;
  } catch (error) {
    console.error('❌ Error inicializando colecciones de Firebase:', error);
    throw error;
  }
};

// Función para inicializar el usuario de autenticación
const initializeAuthUser = async () => {
  try {
    console.log('👤 Inicializando usuario de autenticación...');
    
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
      
    } catch (createError) {
      if (createError.code === 'auth/email-already-in-use') {
        console.log('ℹ️ Usuario de autenticación ya existe');
        
        // Verificar que el documento de Firestore también existe
        try {
          await signInWithEmailAndPassword(auth, email, password);
          const currentUser = auth.currentUser;
          
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
            }
          }
        } catch (signInError) {
          console.warn('⚠️ Error verificando usuario existente:', signInError);
        }
      } else {
        console.error('❌ Error creando usuario de autenticación:', createError);
        throw createError;
      }
    }
    
  } catch (error) {
    console.error('❌ Error inicializando usuario de autenticación:', error);
    // No fallar la inicialización completa por esto
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

// Estructura de las colecciones para referencia
export const COLLECTIONS = {
  // Tarjetas de regalo
  GIFTCARDS: 'giftcards',
  
  // Registro de actividades
  ACTIVITIES: 'activities',
  
  // Usuarios del sistema
  USERS: 'users',
  
  // Mensajes de contacto
  CONTACT_MESSAGES: 'contactMessages',
  
  // Configuración del sitio
  SETTINGS: 'settings'
};

export default {
  initializeFirebaseCollections,
  checkFirebaseConnection,
  COLLECTIONS
};