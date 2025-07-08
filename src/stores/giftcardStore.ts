import { create } from 'zustand';
import { dbService } from '../lib/database';
import { Giftcard, GiftcardStatus, GiftcardSearchFilters, PublicGiftcardView } from '../types';

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

// Convertir datos de base de datos a formato de la aplicación
const convertDbToGiftcard = (dbData: any): Giftcard => ({
  id: dbData.id,
  number: dbData.number,
  buyer: {
    name: dbData.buyer_name,
    email: dbData.buyer_email,
    phone: dbData.buyer_phone
  },
  recipient: {
    name: dbData.recipient_name,
    email: dbData.recipient_email,
    phone: dbData.recipient_phone
  },
  amount: parseFloat(dbData.amount),
  duration: dbData.duration,
  status: dbData.status,
  createdAt: dbData.created_at,
  deliveredAt: dbData.delivered_at,
  expiresAt: dbData.expires_at,
  redeemedAt: dbData.redeemed_at,
  cancelledAt: dbData.cancelled_at,
  notes: dbData.notes,
  artist: dbData.artist,
  termsAcceptedAt: dbData.terms_accepted_at
});

export const useGiftcardStore = create<GiftcardState>()((set, get) => ({
  giftcards: [],
  filteredGiftcards: [],
  selectedGiftcard: null,
  filters: {},
  loading: false,
  error: null,
  
  fetchGiftcards: async () => {
    console.log('🎫 Cargando giftcards desde base de datos...');
    set({ loading: true, error: null });
    
    try {
      const dbGiftcards = await dbService.giftcards.getAll();
      const giftcards = dbGiftcards.map(convertDbToGiftcard);
      
      console.log('✅ Giftcards cargadas desde base de datos:', giftcards.length);
      
      set({ 
        giftcards, 
        filteredGiftcards: giftcards, 
        loading: false 
      });
    } catch (error) {
      console.error('❌ Error cargando giftcards desde base de datos:', error);
      set({ error: 'Error al cargar las tarjetas de regalo', loading: false });
    }
  },
  
  getGiftcardById: async (id: string) => {
    console.log('🔍 Buscando giftcard en base de datos:', id);
    set({ loading: true, error: null });
    
    try {
      const dbGiftcard = await dbService.giftcards.getById(id);
      if (dbGiftcard) {
        const giftcard = convertDbToGiftcard(dbGiftcard);
        console.log('🎫 Giftcard encontrada:', giftcard.number);
        set({ selectedGiftcard: giftcard, loading: false });
      } else {
        console.log('❌ Giftcard no encontrada');
        set({ selectedGiftcard: null, loading: false });
      }
    } catch (error) {
      console.error('❌ Error buscando giftcard en base de datos:', error);
      set({ selectedGiftcard: null, error: 'Error al cargar los detalles de la tarjeta', loading: false });
    }
  },
  
  createGiftcard: async (giftcardData: any) => {
    console.log('➕ Creando nueva giftcard en base de datos...');
    set({ loading: true, error: null });
    
    try {
      const dbGiftcard = await dbService.giftcards.create(giftcardData);
      const newGiftcard = convertDbToGiftcard(dbGiftcard);
      
      console.log('✅ Giftcard creada en base de datos:', newGiftcard.number);
      
      // Actualizar estado local
      set(state => ({ 
        giftcards: [newGiftcard, ...state.giftcards],
        filteredGiftcards: [newGiftcard, ...state.filteredGiftcards],
        loading: false 
      }));
      
      return newGiftcard;
    } catch (error) {
      console.error('❌ Error creando giftcard en base de datos:', error);
      set({ error: 'Error al crear la tarjeta de regalo', loading: false });
      throw error;
    }
  },
  
  updateGiftcardStatus: async (id: string, status: GiftcardStatus, notes?: string, artist?: string) => {
    console.log('🔄 Actualizando estado de giftcard en base de datos:', id, 'a', status);
    set({ loading: true, error: null });
    
    try {
      const dbGiftcard = await dbService.giftcards.updateStatus(id, status, notes, artist);
      const updatedGiftcard = convertDbToGiftcard(dbGiftcard);
      
      console.log('✅ Estado actualizado en base de datos');
      
      // Actualizar estado local
      set(state => {
        const updatedGiftcards = state.giftcards.map(giftcard => 
          giftcard.id === id ? updatedGiftcard : giftcard
        );
        
        return {
          giftcards: updatedGiftcards,
          filteredGiftcards: updatedGiftcards,
          selectedGiftcard: state.selectedGiftcard?.id === id 
            ? updatedGiftcard 
            : state.selectedGiftcard,
          loading: false
        };
      });
    } catch (error) {
      console.error('❌ Error actualizando estado en base de datos:', error);
      set({ error: 'Error al actualizar el estado de la tarjeta', loading: false });
      throw error;
    }
  },
  
  extendExpiration: async (id: string, days: number) => {
    console.log('📅 Extendiendo vencimiento en base de datos:', id, days, 'días');
    set({ loading: true, error: null });
    
    try {
      const dbGiftcard = await dbService.giftcards.extendExpiry(id, days);
      const updatedGiftcard = convertDbToGiftcard(dbGiftcard);
      
      console.log('✅ Vencimiento extendido en base de datos');
      
      // Actualizar estado local
      set(state => {
        const updatedGiftcards = state.giftcards.map(giftcard => 
          giftcard.id === id ? updatedGiftcard : giftcard
        );
        
        return {
          giftcards: updatedGiftcards,
          filteredGiftcards: updatedGiftcards,
          selectedGiftcard: state.selectedGiftcard?.id === id 
            ? updatedGiftcard 
            : state.selectedGiftcard,
          loading: false
        };
      });
    } catch (error) {
      console.error('❌ Error extendiendo vencimiento en base de datos:', error);
      set({ error: 'Error al extender la fecha de vencimiento', loading: false });
      throw error;
    }
  },
  
  deleteGiftcard: async (id: string) => {
    console.log('🗑️ Eliminando giftcard de base de datos:', id);
    set({ loading: true, error: null });
    
    try {
      await dbService.giftcards.delete(id);
      
      console.log('✅ Giftcard eliminada de base de datos');
      
      // Actualizar estado local
      set(state => ({
        giftcards: state.giftcards.filter(g => g.id !== id),
        filteredGiftcards: state.filteredGiftcards.filter(g => g.id !== id),
        selectedGiftcard: state.selectedGiftcard?.id === id ? null : state.selectedGiftcard,
        loading: false
      }));
    } catch (error) {
      console.error('❌ Error eliminando giftcard de base de datos:', error);
      set({ error: 'Error al eliminar la tarjeta de regalo', loading: false });
      throw error;
    }
  },
  
  acceptTerms: async (number: string) => {
    console.log('📋 Aceptando términos en base de datos para:', number);
    
    try {
      await dbService.giftcards.acceptTerms(number);
      console.log('✅ Términos aceptados en base de datos');
    } catch (error) {
      console.error('❌ Error aceptando términos en base de datos:', error);
      throw new Error('Error al aceptar los términos y condiciones');
    }
  },

  getPublicGiftcardInfo: async (number: string): Promise<PublicGiftcardView | null> => {
    console.log('🔍 Consultando giftcard pública en base de datos:', number);
    
    try {
      const dbGiftcard = await dbService.giftcards.getPublicInfo(number);
      if (!dbGiftcard) {
        console.log('❌ Giftcard no encontrada en base de datos');
        return null;
      }
      
      console.log('✅ Información pública obtenida de base de datos');
      
      return {
        number: dbGiftcard.number,
        amount: parseFloat(dbGiftcard.amount),
        status: dbGiftcard.status,
        deliveredAt: dbGiftcard.delivered_at,
        expiresAt: dbGiftcard.expires_at,
        termsAcceptedAt: dbGiftcard.terms_accepted_at
      };
    } catch (error) {
      console.error('❌ Error consultando giftcard pública en base de datos:', error);
      return null;
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