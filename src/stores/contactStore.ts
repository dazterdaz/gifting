import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface ContactMessage {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  message: string;
  status: 'nuevo' | 'leido' | 'contactado' | 'pagado';
  createdAt: string;
  archived: boolean;
}

interface ContactState {
  messages: ContactMessage[];
  loading: boolean;
  error: string | null;
  
  fetchMessages: () => Promise<void>;
  sendContactMessage: (messageData: Omit<ContactMessage, 'id' | 'createdAt' | 'status' | 'archived'>) => Promise<void>;
  updateMessageStatus: (id: string, status: ContactMessage['status']) => Promise<void>;
  archiveMessage: (id: string) => Promise<void>;
  getActiveMessages: () => ContactMessage[];
  getArchivedMessages: () => ContactMessage[];
}

export const useContactStore = create<ContactState>()((set, get) => ({
  messages: [],
  loading: false,
  error: null,
  
  fetchMessages: async () => {
    console.log('📨 Cargando mensajes de contacto desde Supabase...');
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const messages = data.map(row => ({
        id: row.id,
        name: row.name,
        whatsapp: row.whatsapp,
        email: row.email,
        message: row.message,
        status: row.status,
        createdAt: row.created_at,
        archived: row.archived
      }));
      
      console.log('✅ Mensajes cargados desde Supabase:', messages.length);
      set({ messages, loading: false });
    } catch (error) {
      console.error('❌ Error cargando mensajes desde Supabase:', error);
      set({ error: 'Error al cargar los mensajes', loading: false });
    }
  },
  
  sendContactMessage: async (messageData) => {
    console.log('📤 Enviando mensaje de contacto a Supabase...');
    set({ loading: true, error: null });
    
    try {
      const newMessage = {
        name: messageData.name,
        whatsapp: messageData.whatsapp,
        email: messageData.email,
        message: messageData.message,
        status: 'nuevo' as const,
        created_at: new Date().toISOString(),
        archived: false
      };
      
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([newMessage])
        .select()
        .single();
      
      if (error) throw error;
      
      const messageWithId: ContactMessage = {
        id: data.id,
        name: data.name,
        whatsapp: data.whatsapp,
        email: data.email,
        message: data.message,
        status: data.status,
        createdAt: data.created_at,
        archived: data.archived
      };
      
      console.log('✅ Mensaje enviado a Supabase correctamente');
      
      set(state => ({
        messages: [messageWithId, ...state.messages],
        loading: false
      }));
    } catch (error) {
      console.error('❌ Error enviando mensaje a Supabase:', error);
      set({ error: 'Error al enviar el mensaje', loading: false });
      throw error;
    }
  },
  
  updateMessageStatus: async (id, status) => {
    console.log('🔄 Actualizando estado del mensaje en Supabase:', id, 'a', status);
    set({ loading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      // Actualizar estado local
      set(state => ({
        messages: state.messages.map(msg =>
          msg.id === id ? { ...msg, status } : msg
        ),
        loading: false
      }));
      
      console.log('✅ Estado actualizado en Supabase correctamente');
    } catch (error) {
      console.error('❌ Error actualizando estado en Supabase:', error);
      set({ error: 'Error al actualizar el estado', loading: false });
      throw error;
    }
  },
  
  archiveMessage: async (id) => {
    console.log('📁 Archivando mensaje en Supabase:', id);
    set({ loading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ archived: true })
        .eq('id', id);
      
      if (error) throw error;
      
      // Actualizar estado local
      set(state => ({
        messages: state.messages.map(msg =>
          msg.id === id ? { ...msg, archived: true } : msg
        ),
        loading: false
      }));
      
      console.log('✅ Mensaje archivado en Supabase correctamente');
    } catch (error) {
      console.error('❌ Error archivando mensaje en Supabase:', error);
      set({ error: 'Error al archivar el mensaje', loading: false });
      throw error;
    }
  },
  
  getActiveMessages: () => {
    const { messages } = get();
    return messages.filter(msg => !msg.archived);
  },
  
  getArchivedMessages: () => {
    const { messages } = get();
    return messages.filter(msg => msg.archived);
  }
}));