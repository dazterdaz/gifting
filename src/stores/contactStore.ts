import { create } from 'zustand';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  orderBy, 
  Timestamp 
} from '../lib/firebase';
import { db } from '../lib/firebase';

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

// Convertir documento de Firestore a ContactMessage
const convertFirestoreToMessage = (doc: any): ContactMessage => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
  };
};

// Convertir ContactMessage a formato Firestore
const convertMessageToFirestore = (message: Partial<ContactMessage>) => {
  const data = { ...message };
  
  if (data.createdAt) {
    data.createdAt = Timestamp.fromDate(new Date(data.createdAt));
  }
  
  delete data.id;
  return data;
};

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
    console.log('📨 Cargando mensajes de contacto desde Firebase...');
    set({ loading: true, error: null });
    
    try {
      const messagesRef = collection(db, 'contactMessages');
      const q = query(messagesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const messages = querySnapshot.docs.map(convertFirestoreToMessage);
      
      console.log('✅ Mensajes cargados desde Firebase:', messages.length);
      set({ messages, loading: false });
    } catch (error) {
      console.error('❌ Error cargando mensajes desde Firebase:', error);
      set({ error: 'Error al cargar los mensajes', loading: false });
    }
  },
  
  sendContactMessage: async (messageData) => {
    console.log('📤 Enviando mensaje de contacto a Firebase...');
    set({ loading: true, error: null });
    
    try {
      const newMessage: Omit<ContactMessage, 'id'> = {
        ...messageData,
        status: 'nuevo',
        createdAt: new Date().toISOString(),
        archived: false
      };
      
      // Guardar en Firebase
      const messagesRef = collection(db, 'contactMessages');
      const firestoreData = convertMessageToFirestore(newMessage);
      const docRef = await addDoc(messagesRef, firestoreData);
      
      const messageWithId: ContactMessage = {
        ...newMessage,
        id: docRef.id
      };
      
      console.log('✅ Mensaje enviado a Firebase correctamente');
      
      set(state => ({
        messages: [messageWithId, ...state.messages],
        loading: false
      }));
    } catch (error) {
      console.error('❌ Error enviando mensaje a Firebase:', error);
      set({ error: 'Error al enviar el mensaje', loading: false });
      throw error;
    }
  },
  
  updateMessageStatus: async (id, status) => {
    console.log('🔄 Actualizando estado del mensaje en Firebase:', id, 'a', status);
    set({ loading: true, error: null });
    
    try {
      // Actualizar en Firebase
      const docRef = doc(db, 'contactMessages', id);
      await updateDoc(docRef, { status });
      
      // Actualizar estado local
      set(state => ({
        messages: state.messages.map(msg =>
          msg.id === id ? { ...msg, status } : msg
        ),
        loading: false
      }));
      
      console.log('✅ Estado actualizado en Firebase correctamente');
    } catch (error) {
      console.error('❌ Error actualizando estado en Firebase:', error);
      set({ error: 'Error al actualizar el estado', loading: false });
      throw error;
    }
  },
  
  archiveMessage: async (id) => {
    console.log('📁 Archivando mensaje en Firebase:', id);
    set({ loading: true, error: null });
    
    try {
      // Actualizar en Firebase
      const docRef = doc(db, 'contactMessages', id);
      await updateDoc(docRef, { archived: true });
      
      // Actualizar estado local
      set(state => ({
        messages: state.messages.map(msg =>
          msg.id === id ? { ...msg, archived: true } : msg
        ),
        loading: false
      }));
      
      console.log('✅ Mensaje archivado en Firebase correctamente');
    } catch (error) {
      console.error('❌ Error archivando mensaje en Firebase:', error);
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