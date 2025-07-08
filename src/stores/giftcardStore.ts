import { create } from 'zustand';
import { giftcardService } from '../lib/api';
import { Giftcard, GiftcardStatus, GiftcardSearchFilters, PublicGiftcardView } from '../types';
import { generateGiftcardNumber } from '../lib/utils';

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
    console.log('🎫 Cargando giftcards desde API...');
    set({ loading: true, error: null });
    
    try {
      const giftcards = await giftcardService.getAll();
      
      console.log('✅ Giftcards cargadas desde API:', giftcards.length);
      
      set({ 
        giftcards, 
        filteredGiftcards: giftcards, 
        loading: false 
      });
    } catch (error) {
      console.error('❌ Error cargando giftcards desde API:', error);
      set({ error: 'Error al cargar las tarjetas de regalo', loading: false });
    }
  },
  
  getGiftcardById: async (id: string) => {
    console.log('🔍 Buscando giftcard en API:', id);
    set({ loading: true, error: null });
    
    try {
      const giftcard = await giftcardService.getById(id);
      console.log('🎫 Giftcard encontrada:', giftcard.number);
      set({ selectedGiftcard: giftcard, loading: false });
    } catch (error) {
      console.error('❌ Error buscando giftcard en API:', error);
      set({ selectedGiftcard: null, error: 'Error al cargar los detalles de la tarjeta', loading: false });
    }
  },
  
  createGiftcard: async (giftcardData: any) => {
    console.log('➕ Creando nueva giftcard en API...');
    set({ loading: true, error: null });
    
    try {
      const newGiftcard = await giftcardService.create(giftcardData);
      
      console.log('✅ Giftcard creada en API:', newGiftcard.number);
      
      // Actualizar estado local
      set(state => ({ 
        giftcards: [newGiftcard, ...state.giftcards],
        filteredGiftcards: [newGiftcard, ...state.filteredGiftcards],
        loading: false 
      }));
      
      return newGiftcard;
    } catch (error) {
      console.error('❌ Error creando giftcard en API:', error);
      set({ error: 'Error al crear la tarjeta de regalo', loading: false });
      throw error;
    }
  },
  
  updateGiftcardStatus: async (id: string, status: GiftcardStatus, notes?: string, artist?: string) => {
    console.log('🔄 Actualizando estado de giftcard en API:', id, 'a', status);
    set({ loading: true, error: null });
    
    try {
      const updatedGiftcard = await giftcardService.updateStatus(id, status, notes, artist);
      
      console.log('✅ Estado actualizado en API');
      
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
      console.error('❌ Error actualizando estado en API:', error);
      set({ error: 'Error al actualizar el estado de la tarjeta', loading: false });
      throw error;
    }
  },
  
  extendExpiration: async (id: string, days: number) => {
    console.log('📅 Extendiendo vencimiento en API:', id, days, 'días');
    set({ loading: true, error: null });
    
    try {
      const updatedGiftcard = await giftcardService.extendExpiry(id, days);
      
      console.log('✅ Vencimiento extendido en API');
      
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
      console.error('❌ Error extendiendo vencimiento en API:', error);
      set({ error: 'Error al extender la fecha de vencimiento', loading: false });
      throw error;
    }
  },
  
  deleteGiftcard: async (id: string) => {
    console.log('🗑️ Eliminando giftcard de API:', id);
    set({ loading: true, error: null });
    
    try {
      await giftcardService.delete(id);
      
      console.log('✅ Giftcard eliminada de API');
      
      // Actualizar estado local
      set(state => ({
        giftcards: state.giftcards.filter(g => g.id !== id),
        filteredGiftcards: state.filteredGiftcards.filter(g => g.id !== id),
        selectedGiftcard: state.selectedGiftcard?.id === id ? null : state.selectedGiftcard,
        loading: false
      }));
    } catch (error) {
      console.error('❌ Error eliminando giftcard de API:', error);
      set({ error: 'Error al eliminar la tarjeta de regalo', loading: false });
      throw error;
    }
  },
  
  acceptTerms: async (number: string) => {
    console.log('📋 Aceptando términos en API para:', number);
    
    try {
      await giftcardService.acceptTerms(number);
      console.log('✅ Términos aceptados en API');
    } catch (error) {
      console.error('❌ Error aceptando términos en API:', error);
      throw new Error('Error al aceptar los términos y condiciones');
    }
  },

  getPublicGiftcardInfo: async (number: string): Promise<PublicGiftcardView | null> => {
    console.log('🔍 Consultando giftcard pública en API:', number);
    
    try {
      const giftcard = await giftcardService.getPublic(number);
      console.log('✅ Información pública obtenida de API');
      return giftcard;
    } catch (error) {
      console.error('❌ Error consultando giftcard pública en API:', error);
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