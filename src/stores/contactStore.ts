import { create } from 'zustand';
import { dbService } from '../lib/database';

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

// Convertir datos de base de datos a formato de la aplicación
const convertDbToMessage = (dbData: any): ContactMessage => ({
  id: dbData.id,
  name: dbData.name,
  whatsapp: dbData.whatsapp,
  email: dbData.email,
  message: dbData.message,
  status: dbData.status,
  createdAt: dbData.created_at,
  archived: dbData.archived
});

export const useContactStore = create<ContactState>()((set, get) => ({
  messages: [],
  loading: false,
  error: null,
  
  fetchMessages: async () => {
    console.log('📨 Cargando mensajes de contacto desde base de datos...');
    set({ loading: true, error: null });
    
    try {
      const dbMessages = await dbService.contactMessages.getAll();
      const messages = dbMessages.map(convertDbToMessage);
      
      console.log('✅ Mensajes cargados desde base de datos:', messages.length);
      set({ messages, loading: false });
    } catch (error) {
      console.error('❌ Error cargando mensajes desde base de datos:', error);
      set({ error: 'Error al cargar los mensajes', loading: false });
    }
  },
  
  sendContactMessage: async (messageData) => {
    console.log('📤 Enviando mensaje de contacto a base de datos...');
    set({ loading: true, error: null });
    
    try {
      await dbService.contactMessages.create(messageData);
      
      console.log('✅ Mensaje enviado a base de datos correctamente');
      
      // Crear objeto completo para el estado local
      const newMessage: ContactMessage = {
        ...messageData,
        id: Math.random().toString(36).substring(2, 15),
        status: 'nuevo',
        createdAt: new Date().toISOString(),
        archived: false
      };
      
      set(state => ({
        messages: [newMessage, ...state.messages],
        loading: false
      }));
    } catch (error) {
      console.error('❌ Error enviando mensaje a base de datos:', error);
      set({ error: 'Error al enviar el mensaje', loading: false });
      throw error;
    }
  },
  
  updateMessageStatus: async (id, status) => {
    console.log('🔄 Actualizando estado del mensaje en base de datos:', id, 'a', status);
    set({ loading: true, error: null });
    
    try {
      await dbService.contactMessages.updateStatus(id, status);
      
      // Actualizar estado local
      set(state => ({
        messages: state.messages.map(msg =>
          msg.id === id ? { ...msg, status } : msg
        ),
        loading: false
      }));
      
      console.log('✅ Estado actualizado en base de datos correctamente');
    } catch (error) {
      console.error('❌ Error actualizando estado en base de datos:', error);
      set({ error: 'Error al actualizar el estado', loading: false });
      throw error;
    }
  },
  
  archiveMessage: async (id) => {
    console.log('📁 Archivando mensaje en base de datos:', id);
    set({ loading: true, error: null });
    
    try {
      await dbService.contactMessages.archive(id);
      
      // Actualizar estado local
      set(state => ({
        messages: state.messages.map(msg =>
          msg.id === id ? { ...msg, archived: true } : msg
        ),
        loading: false
      }));
      
      console.log('✅ Mensaje archivado en base de datos correctamente');
    } catch (error) {
      console.error('❌ Error archivando mensaje en base de datos:', error);
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