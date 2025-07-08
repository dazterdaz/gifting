import { create } from 'zustand';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  Timestamp 
} from '../lib/firebase';
import { db } from '../lib/firebase';
import { SiteSettings, TermsAndConditions } from '../types';

// Términos y condiciones por defecto
const defaultTerms: TermsAndConditions = {
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
  createdAt: new Date().toISOString(),
  createdBy: 'Sistema',
  isActive: true
};

// Configuración por defecto
const defaultSettings: SiteSettings = {
  siteName: 'Daz Giftcard Register',
  logoUrl: '/logo.svg',
  logoColor: '#4F46E5',
  terms: defaultTerms,
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
  ]
};

// Convertir configuración a formato Firestore
const convertSettingsToFirestore = (settings: SiteSettings) => {
  const data = { ...settings };
  
  if (data.terms?.createdAt) {
    data.terms.createdAt = Timestamp.fromDate(new Date(data.terms.createdAt));
  }
  
  return data;
};

// Convertir documento de Firestore a configuración
const convertFirestoreToSettings = (data: any): SiteSettings => {
  // Manejar conversión segura de fechas
  if (data.terms?.createdAt) {
    try {
      if (typeof data.terms.createdAt.toDate === 'function') {
        // Es un Timestamp de Firestore
        data.terms.createdAt = data.terms.createdAt.toDate().toISOString();
      } else if (typeof data.terms.createdAt === 'string') {
        // Es una cadena, verificar si es válida
        const parsedDate = new Date(data.terms.createdAt);
        if (isNaN(parsedDate.getTime())) {
          // Fecha inválida, usar fecha actual
          data.terms.createdAt = new Date().toISOString();
        }
      } else {
        // Tipo desconocido, usar fecha actual
        data.terms.createdAt = new Date().toISOString();
      }
    } catch (error) {
      console.warn('⚠️ Error convirtiendo fecha de términos, usando fecha actual:', error);
      data.terms.createdAt = new Date().toISOString();
    }
  }

  // Manejar otras fechas si existen
  if (data.createdAt) {
    try {
      if (typeof data.createdAt.toDate === 'function') {
        data.createdAt = data.createdAt.toDate().toISOString();
      } else if (typeof data.createdAt === 'string') {
        const parsedDate = new Date(data.createdAt);
        if (isNaN(parsedDate.getTime())) {
          data.createdAt = new Date().toISOString();
        }
      }
    } catch (error) {
      console.warn('⚠️ Error convirtiendo createdAt:', error);
      data.createdAt = new Date().toISOString();
    }
  }

  if (data.updatedAt) {
    try {
      if (typeof data.updatedAt.toDate === 'function') {
        data.updatedAt = data.updatedAt.toDate().toISOString();
      } else if (typeof data.updatedAt === 'string') {
        const parsedDate = new Date(data.updatedAt);
        if (isNaN(parsedDate.getTime())) {
          data.updatedAt = new Date().toISOString();
        }
      }
    } catch (error) {
      console.warn('⚠️ Error convirtiendo updatedAt:', error);
      data.updatedAt = new Date().toISOString();
    }
  }
  
  return data;
};

interface SettingsState {
  settings: SiteSettings;
  loading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  uploadLogo: (file: File) => Promise<string>;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  settings: defaultSettings,
  loading: false,
  error: null,

  fetchSettings: async () => {
    console.log('⚙️ Cargando configuración desde Firebase...');
    set({ loading: true, error: null });
    
    try {
      const docRef = doc(db, 'settings', 'site-config');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const rawData = docSnap.data();
        console.log('📄 Datos crudos de Firebase:', rawData);
        
        const settings = convertFirestoreToSettings(rawData);
        console.log('✅ Configuración cargada desde Firebase');
        set({ settings, loading: false });
      } else {
        // Si no existe, crear configuración por defecto
        console.log('📝 Creando configuración por defecto en Firebase...');
        
        try {
          const firestoreData = convertSettingsToFirestore(defaultSettings);
          await setDoc(docRef, firestoreData);
          console.log('✅ Configuración por defecto creada en Firebase');
          set({ settings: defaultSettings, loading: false });
        } catch (createError) {
          console.warn('⚠️ No se pudo crear configuración en Firebase, usando configuración local:', createError);
          set({ settings: defaultSettings, loading: false });
        }
      }
    } catch (error) {
      console.error('❌ Error cargando configuración desde Firebase:', error);
      
      // Si hay error de permisos o conexión, usar configuración por defecto
      if (error.code === 'permission-denied' || error.code === 'unavailable') {
        console.log('🔄 Usando configuración por defecto debido a problemas de conexión/permisos');
        set({ settings: defaultSettings, loading: false, error: null });
      } else {
        set({ 
          error: 'Error al cargar la configuración', 
          loading: false,
          settings: defaultSettings // Usar configuración por defecto como fallback
        });
      }
    }
  },

  updateSettings: async (newSettings: Partial<SiteSettings>) => {
    console.log('⚙️ Actualizando configuración en Firebase...');
    set({ loading: true, error: null });
    
    try {
      const currentSettings = get().settings;
      const updatedSettings = { ...currentSettings, ...newSettings };
      
      // Actualizar en Firebase
      const docRef = doc(db, 'settings', 'site-config');
      const firestoreData = convertSettingsToFirestore(updatedSettings);
      await updateDoc(docRef, firestoreData);
      
      console.log('✅ Configuración actualizada en Firebase');
      
      set({ 
        settings: updatedSettings,
        loading: false 
      });
    } catch (error) {
      console.error('❌ Error actualizando configuración en Firebase:', error);
      set({ error: 'Error al actualizar la configuración', loading: false });
      throw error;
    }
  },

  uploadLogo: async (file: File) => {
    console.log('📤 Subiendo logo...');
    set({ loading: true, error: null });
    
    try {
      // Simular subida de archivo convirtiendo a base64
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      console.log('✅ Logo subido correctamente');
      set({ loading: false });
      return dataUrl;
    } catch (error) {
      console.error('❌ Error subiendo logo:', error);
      set({ error: 'Error al subir el logo', loading: false });
      throw error;
    }
  }
}));