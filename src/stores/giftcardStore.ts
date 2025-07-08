import { create } from 'zustand';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from '../lib/firebase';
import { db } from '../lib/firebase';
import { Giftcard, GiftcardStatus, GiftcardSearchFilters, PublicGiftcardView } from '../types';
import { generateGiftcardNumber } from '../lib/utils';

// Convertir documento de Firestore a Giftcard
const convertFirestoreToGiftcard = (doc: any): Giftcard => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
    deliveredAt: data.deliveredAt?.toDate?.()?.toISOString() || data.deliveredAt,
    expiresAt: data.expiresAt?.toDate?.()?.toISOString() || data.expiresAt,
    redeemedAt: data.redeemedAt?.toDate?.()?.toISOString() || data.redeemedAt,
    cancelledAt: data.cancelledAt?.toDate?.()?.toISOString() || data.cancelledAt,
    termsAcceptedAt: data.termsAcceptedAt?.toDate?.()?.toISOString() || data.termsAcceptedAt,
  };
};

// Convertir Giftcard a formato Firestore
const convertGiftcardToFirestore = (giftcard: Partial<Giftcard>) => {
  const data = { ...giftcard };
  
  // Convertir fechas a Timestamp de Firestore
  if (data.createdAt) {
    data.createdAt = Timestamp.fromDate(new Date(data.createdAt));
  }
  if (data.deliveredAt) {
    data.deliveredAt = Timestamp.fromDate(new Date(data.deliveredAt));
  }
  if (data.expiresAt) {
    data.expiresAt = Timestamp.fromDate(new Date(data.expiresAt));
  }
  if (data.redeemedAt) {
    data.redeemedAt = Timestamp.fromDate(new Date(data.redeemedAt));
  }
  if (data.cancelledAt) {
    data.cancelledAt = Timestamp.fromDate(new Date(data.cancelledAt));
  }
  if (data.termsAcceptedAt) {
    data.termsAcceptedAt = Timestamp.fromDate(new Date(data.termsAcceptedAt));
  }
  
  // Remover el ID ya que Firestore lo maneja automáticamente
  delete data.id;
  return data;
};

interface GiftcardState {
  giftcards: Giftcard[];
  filteredGiftcards: Giftcard[];
  selectedGiftcard: Giftcard | null;
  filters: GiftcardSearchFilters;
  loading: boolean;
  error: string | null;
  
  fetchGiftcards: () => Promise<void>;
  getGiftcardById: (id: string) => Promise<void>;
  createGiftcard: (giftcardData: any) => Promise<Giftcard>;
  updateGiftcardStatus: (id: string, status: GiftcardStatus, notes?: string, artist?: string) => Promise<void>;
  extendExpiration: (id: string, days: number) => Promise<void>;
  applyFilters: (filters: GiftcardSearchFilters) => void;
  getPublicGiftcardInfo: (number: string) => Promise<PublicGiftcardView | null>;
  clearFilters: () => void;
  deleteGiftcard: (id: string) => Promise<void>;
  acceptTerms: (number: string) => Promise<void>;
}

export const useGiftcardStore = create<GiftcardState>()((set, get) => ({
  giftcards: [],
  filteredGiftcards: [],
  selectedGiftcard: null,
  filters: {},
  loading: false,
  error: null,
  
  fetchGiftcards: async () => {
    console.log('🎫 Cargando giftcards desde Firebase...');
    set({ loading: true, error: null });
    
    try {
      const giftcardsRef = collection(db, 'giftcards');
      const q = query(giftcardsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const giftcards = querySnapshot.docs.map(convertFirestoreToGiftcard);
      
      console.log('✅ Giftcards cargadas desde Firebase:', giftcards.length);
      
      set({ 
        giftcards, 
        filteredGiftcards: giftcards, 
        loading: false 
      });
    } catch (error) {
      console.error('❌ Error cargando giftcards desde Firebase:', error);
      set({ error: 'Error al cargar las tarjetas de regalo', loading: false });
    }
  },
  
  getGiftcardById: async (id: string) => {
    console.log('🔍 Buscando giftcard en Firebase:', id);
    set({ loading: true, error: null });
    
    try {
      const docRef = doc(db, 'giftcards', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const giftcard = convertFirestoreToGiftcard(docSnap);
        console.log('🎫 Giftcard encontrada:', giftcard.number);
        set({ selectedGiftcard: giftcard, loading: false });
      } else {
        console.log('❌ Giftcard no encontrada');
        set({ selectedGiftcard: null, loading: false });
      }
    } catch (error) {
      console.error('❌ Error buscando giftcard en Firebase:', error);
      set({ error: 'Error al cargar los detalles de la tarjeta', loading: false });
    }
  },
  
  createGiftcard: async (giftcardData: any) => {
    console.log('➕ Creando nueva giftcard en Firebase...');
    set({ loading: true, error: null });
    
    try {
      let existingNumbers: string[] = [];
      
      try {
        // Intentar obtener números existentes para generar uno único
        const giftcardsRef = collection(db, 'giftcards');
        const querySnapshot = await getDocs(giftcardsRef);
        existingNumbers = querySnapshot.docs.map(doc => doc.data().number || '');
        console.log('📋 Números existentes obtenidos:', existingNumbers.length);
      } catch (fetchError) {
        console.warn('⚠️ No se pudieron obtener números existentes, generando número aleatorio:', fetchError);
        // Si no se pueden obtener los números existentes, usar array vacío
        existingNumbers = [];
      }
      
      const newGiftcard: Omit<Giftcard, 'id'> = {
        number: generateGiftcardNumber(existingNumbers),
        buyer: giftcardData.buyer,
        recipient: giftcardData.recipient,
        amount: giftcardData.amount,
        status: 'created_not_delivered',
        createdAt: new Date().toISOString(),
      };
      
      console.log('🎫 Nueva giftcard preparada:', {
        number: newGiftcard.number,
        amount: newGiftcard.amount,
        status: newGiftcard.status
      });
      
      try {
        // Convertir a formato Firestore y guardar
        const giftcardsRef = collection(db, 'giftcards');
        const firestoreData = convertGiftcardToFirestore(newGiftcard);
        const docRef = await addDoc(giftcardsRef, firestoreData);
        
        const createdGiftcard: Giftcard = {
          ...newGiftcard,
          id: docRef.id
        };
        
        console.log('✅ Giftcard creada en Firebase:', createdGiftcard.number);
        
        // Actualizar estado local
        set(state => ({ 
          giftcards: [createdGiftcard, ...state.giftcards],
          filteredGiftcards: [createdGiftcard, ...state.filteredGiftcards],
          loading: false 
        }));
        
        return createdGiftcard;
        
      } catch (saveError) {
        console.error('❌ Error guardando en Firebase:', saveError);
        
        // Si hay error de permisos o conexión, crear localmente
        if (saveError.code === 'permission-denied' || saveError.code === 'unavailable') {
          console.log('🔄 Creando giftcard localmente debido a problemas de Firebase');
          
          const localGiftcard: Giftcard = {
            ...newGiftcard,
            id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
          };
          
          // Actualizar estado local
          set(state => ({ 
            giftcards: [localGiftcard, ...state.giftcards],
            filteredGiftcards: [localGiftcard, ...state.filteredGiftcards],
            loading: false 
          }));
          
          return localGiftcard;
        } else {
          throw saveError;
        }
      }
      
    } catch (error) {
      console.error('❌ Error creando giftcard en Firebase:', error);
      
      let errorMessage = 'Error al crear la tarjeta de regalo';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Sin permisos para crear tarjetas de regalo';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Servicio no disponible, intente más tarde';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
  
  updateGiftcardStatus: async (id: string, status: GiftcardStatus, notes?: string, artist?: string) => {
    console.log('🔄 Actualizando estado de giftcard en Firebase:', id, 'a', status);
    set({ loading: true, error: null });
    
    try {
      const now = new Date().toISOString();
      const updateData: any = { status };
      
      if (status === 'delivered') {
        updateData.deliveredAt = now;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 90);
        updateData.expiresAt = expiryDate.toISOString();
      } else if (status === 'redeemed') {
        updateData.redeemedAt = now;
        if (notes) updateData.notes = notes;
        if (artist) updateData.artist = artist;
      } else if (status === 'cancelled') {
        updateData.cancelledAt = now;
        if (notes) updateData.notes = notes;
      }
      
      // Actualizar en Firebase
      const docRef = doc(db, 'giftcards', id);
      const firestoreData = convertGiftcardToFirestore(updateData);
      await updateDoc(docRef, firestoreData);
      
      console.log('✅ Estado actualizado en Firebase');
      
      // Actualizar estado local
      set(state => {
        const updatedGiftcards = state.giftcards.map(giftcard => 
          giftcard.id === id ? { ...giftcard, ...updateData } : giftcard
        );
        
        return {
          giftcards: updatedGiftcards,
          filteredGiftcards: updatedGiftcards,
          selectedGiftcard: state.selectedGiftcard?.id === id 
            ? { ...state.selectedGiftcard, ...updateData } 
            : state.selectedGiftcard,
          loading: false
        };
      });
    } catch (error) {
      console.error('❌ Error actualizando estado en Firebase:', error);
      set({ error: 'Error al actualizar el estado de la tarjeta', loading: false });
      throw error;
    }
  },
  
  extendExpiration: async (id: string, days: number) => {
    console.log('📅 Extendiendo vencimiento en Firebase:', id, days, 'días');
    set({ loading: true, error: null });
    
    try {
      const { selectedGiftcard } = get();
      if (!selectedGiftcard?.expiresAt) {
        throw new Error('La tarjeta no tiene fecha de vencimiento');
      }
      
      const currentExpiry = new Date(selectedGiftcard.expiresAt);
      currentExpiry.setDate(currentExpiry.getDate() + days);
      const newExpiresAt = currentExpiry.toISOString();
      
      // Actualizar en Firebase
      const docRef = doc(db, 'giftcards', id);
      await updateDoc(docRef, {
        expiresAt: Timestamp.fromDate(new Date(newExpiresAt))
      });
      
      console.log('✅ Vencimiento extendido en Firebase');
      
      // Actualizar estado local
      set(state => {
        const updatedGiftcards = state.giftcards.map(giftcard => 
          giftcard.id === id ? { ...giftcard, expiresAt: newExpiresAt } : giftcard
        );
        
        return {
          giftcards: updatedGiftcards,
          filteredGiftcards: updatedGiftcards,
          selectedGiftcard: state.selectedGiftcard?.id === id 
            ? { ...state.selectedGiftcard, expiresAt: newExpiresAt } 
            : state.selectedGiftcard,
          loading: false
        };
      });
    } catch (error) {
      console.error('❌ Error extendiendo vencimiento en Firebase:', error);
      set({ error: 'Error al extender la fecha de vencimiento', loading: false });
      throw error;
    }
  },
  
  deleteGiftcard: async (id: string) => {
    console.log('🗑️ Eliminando giftcard de Firebase:', id);
    set({ loading: true, error: null });
    
    try {
      // Eliminar de Firebase
      const docRef = doc(db, 'giftcards', id);
      await deleteDoc(docRef);
      
      console.log('✅ Giftcard eliminada de Firebase');
      
      // Actualizar estado local
      set(state => ({
        giftcards: state.giftcards.filter(g => g.id !== id),
        filteredGiftcards: state.filteredGiftcards.filter(g => g.id !== id),
        selectedGiftcard: state.selectedGiftcard?.id === id ? null : state.selectedGiftcard,
        loading: false
      }));
    } catch (error) {
      console.error('❌ Error eliminando giftcard de Firebase:', error);
      set({ error: 'Error al eliminar la tarjeta de regalo', loading: false });
      throw error;
    }
  },
  
  acceptTerms: async (number: string) => {
    console.log('📋 Aceptando términos en Firebase para:', number);
    
    try {
      // Buscar la giftcard por número
      const giftcardsRef = collection(db, 'giftcards');
      const q = query(giftcardsRef, where('number', '==', number));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Tarjeta no encontrada');
      }
      
      const giftcardDoc = querySnapshot.docs[0];
      const termsAcceptedAt = new Date().toISOString();
      
      // Actualizar en Firebase
      await updateDoc(giftcardDoc.ref, {
        termsAcceptedAt: Timestamp.fromDate(new Date(termsAcceptedAt))
      });
      
      console.log('✅ Términos aceptados en Firebase');
      
      // Actualizar estado local
      set(state => {
        const updatedGiftcards = state.giftcards.map(g => 
          g.id === giftcardDoc.id ? { ...g, termsAcceptedAt } : g
        );
        
        return {
          giftcards: updatedGiftcards,
          filteredGiftcards: updatedGiftcards
        };
      });
    } catch (error) {
      console.error('❌ Error aceptando términos en Firebase:', error);
      throw new Error('Error al aceptar los términos y condiciones');
    }
  },

  getPublicGiftcardInfo: async (number: string): Promise<PublicGiftcardView | null> => {
    console.log('🔍 Consultando giftcard pública en Firebase:', number);
    
    try {
      // Buscar por número en Firebase
      const giftcardsRef = collection(db, 'giftcards');
      const q = query(giftcardsRef, where('number', '==', number));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('❌ Giftcard no encontrada en Firebase');
        return null;
      }
      
      const giftcardDoc = querySnapshot.docs[0];
      const giftcard = convertFirestoreToGiftcard(giftcardDoc);
      
      console.log('✅ Información pública obtenida de Firebase');
      
      return {
        number: giftcard.number,
        amount: giftcard.amount,
        status: giftcard.status,
        deliveredAt: giftcard.deliveredAt,
        expiresAt: giftcard.expiresAt,
        termsAcceptedAt: giftcard.termsAcceptedAt
      };
    } catch (error) {
      console.error('❌ Error consultando giftcard pública en Firebase:', error);
      throw new Error('Error al consultar información de la tarjeta');
    }
  },
  
  applyFilters: (filters: GiftcardSearchFilters) => {
    console.log('🔍 Aplicando filtros:', filters);
    
    const { giftcards } = get();
    let filtered = [...giftcards];
    
    if (filters.number) {
      filtered = filtered.filter(g => g.number.toLowerCase().includes(filters.number!.toLowerCase()));
    }
    
    if (filters.email) {
      filtered = filtered.filter(g => 
        g.buyer.email.toLowerCase().includes(filters.email!.toLowerCase()) || 
        g.recipient.email.toLowerCase().includes(filters.email!.toLowerCase())
      );
    }
    
    if (filters.phone) {
      filtered = filtered.filter(g => 
        g.buyer.phone.includes(filters.phone!) || 
        g.recipient.phone.includes(filters.phone!)
      );
    }
    
    if (filters.status) {
      filtered = filtered.filter(g => g.status === filters.status);
    }
    
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom).getTime();
      filtered = filtered.filter(g => new Date(g.createdAt).getTime() >= fromDate);
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo).getTime();
      filtered = filtered.filter(g => new Date(g.createdAt).getTime() <= toDate);
    }
    
    if (filters.minAmount !== undefined) {
      filtered = filtered.filter(g => g.amount >= filters.minAmount!);
    }
    
    if (filters.maxAmount !== undefined) {
      filtered = filtered.filter(g => g.amount <= filters.maxAmount!);
    }
    
    console.log('✅ Filtros aplicados, resultados:', filtered.length);
    
    set({ filteredGiftcards: filtered, filters });
  },
  
  clearFilters: () => {
    console.log('🧹 Limpiando filtros');
    const { giftcards } = get();
    set({ 
      filteredGiftcards: giftcards,
      filters: {} 
    });
  }
}));