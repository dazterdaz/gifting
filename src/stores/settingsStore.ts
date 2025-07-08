import { create } from 'zustand';
import { supabase } from '../lib/supabase';
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
    console.log('⚙️ Cargando configuración desde Supabase...');
    set({ error: null });
    
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'site-config')
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No existe, crear configuración por defecto
          console.log('📝 Creando configuración por defecto en Supabase...');
          
          const defaultData = {
            id: 'site-config',
            site_name: defaultSettings.siteName,
            logo_url: defaultSettings.logoUrl,
            logo_color: defaultSettings.logoColor,
            terms_content: defaultSettings.terms?.content,
            contact_info: defaultSettings.contactInfo,
            testimonials: defaultSettings.testimonials,
            social_links: defaultSettings.socialLinks,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const { error: insertError } = await supabase
            .from('settings')
            .insert([defaultData]);
          
          if (insertError) throw insertError;
          
          console.log('✅ Configuración por defecto creada en Supabase');
          set({ settings: defaultSettings });
          return;
        }
        throw error;
      }
      
      if (data) {
        const settings: SiteSettings = {
          siteName: data.site_name,
          logoUrl: data.logo_url,
          logoColor: data.logo_color,
          terms: data.terms_content ? {
            id: 'default-terms',
            content: data.terms_content,
            createdAt: data.created_at,
            createdBy: 'Sistema',
            isActive: true
          } : defaultTerms,
          contactInfo: data.contact_info || defaultSettings.contactInfo,
          testimonials: data.testimonials || defaultSettings.testimonials,
          socialLinks: data.social_links || defaultSettings.socialLinks
        };
        
        console.log('✅ Configuración cargada desde Supabase');
        set({ settings });
      }
    } catch (error) {
      console.error('❌ Error cargando configuración desde Supabase:', error);
      
      // Si hay error, usar configuración por defecto
      console.log('🔄 Usando configuración por defecto debido a problemas de conexión');
      set({ settings: defaultSettings, error: null });
    }
  },

  updateSettings: async (newSettings: Partial<SiteSettings>) => {
    console.log('⚙️ Actualizando configuración en Supabase...');
    set({ error: null });
    
    try {
      const currentSettings = get().settings;
      const updatedSettings = { ...currentSettings, ...newSettings };
      
      const updateData = {
        site_name: updatedSettings.siteName,
        logo_url: updatedSettings.logoUrl,
        logo_color: updatedSettings.logoColor,
        terms_content: updatedSettings.terms?.content,
        contact_info: updatedSettings.contactInfo,
        testimonials: updatedSettings.testimonials,
        social_links: updatedSettings.socialLinks,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('settings')
        .update(updateData)
        .eq('id', 'site-config');
      
      if (error) throw error;
      
      console.log('✅ Configuración actualizada en Supabase');
      
      set({ settings: updatedSettings });
    } catch (error) {
      console.error('❌ Error actualizando configuración en Supabase:', error);
      set({ error: 'Error al actualizar la configuración' });
      throw error;
    }
  },

  uploadLogo: async (file: File) => {
    console.log('📤 Subiendo logo...');
    set({ error: null });
    
    try {
      // Simular subida de archivo convirtiendo a base64
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      console.log('✅ Logo subido correctamente');
      return dataUrl;
    } catch (error) {
      console.error('❌ Error subiendo logo:', error);
      set({ error: 'Error al subir el logo' });
      throw error;
    }
  }
}));