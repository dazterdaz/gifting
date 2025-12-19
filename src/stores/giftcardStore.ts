import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Giftcard, GiftcardStatus, GiftcardSearchFilters, PublicGiftcardView } from '../types';
import { generateGiftcardNumber } from '../lib/utils';

// Convertir fila de Supabase a Giftcard
const convertSupabaseToGiftcard = (row: any): Giftcard => {
  return {
    id: row.id,
    number: row.number,
    buyer: {
      name: row.buyer_name,
      email: row.buyer_email,
      phone: row.buyer_phone
    },
    recipient: {
      name: row.recipient_name,
      email: row.recipient_email,
      phone: row.recipient_phone
    },
    amount: row.amount,
    status: row.status,
    createdAt: row.created_at,
    deliveredAt: row.delivered_at,
    expiresAt: row.expires_at,
    redeemedAt: row.redeemed_at,
    cancelledAt: row.cancelled_at,
    notes: row.notes,
    artist: row.artist,
    termsAcceptedAt: row.terms_accepted_at
  };
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
    console.log('🎫 Cargando giftcards desde Supabase...');
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('giftcards')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const giftcards = data.map(convertSupabaseToGiftcard);
      
      console.log('✅ Giftcards cargadas desde Supabase:', giftcards.length);
      
      set({ 
        giftcards, 
        filteredGiftcards: giftcards, 
        loading: false 
      });
    } catch (error) {
      console.error('❌ Error cargando giftcards desde Supabase:', error);
      set({ error: 'Error al cargar las tarjetas de regalo', loading: false });
    }
  },
  
  getGiftcardById: async (id: string) => {
    console.log('🔍 Buscando giftcard en Supabase:', id);
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('giftcards')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        const giftcard = convertSupabaseToGiftcard(data);
        console.log('🎫 Giftcard encontrada:', giftcard.number);
        set({ selectedGiftcard: giftcard, loading: false });
      } else {
        console.log('❌ Giftcard no encontrada');
        set({ selectedGiftcard: null, loading: false });
      }
    } catch (error) {
      console.error('❌ Error buscando giftcard en Supabase:', error);
      set({ error: 'Error al cargar los detalles de la tarjeta', loading: false });
    }
  },
  
  createGiftcard: async (giftcardData: any) => {
    console.log('➕ Creando nueva giftcard en Supabase...');
    set({ loading: true, error: null });
    
    try {
      let giftcardNumber: string;
      
      if (giftcardData.customNumber) {
        // Verificar que el número personalizado no exista
        const { data: existingCard } = await supabase
          .from('giftcards')
          .select('number')
          .eq('number', giftcardData.customNumber)
          .maybeSingle();
        
        if (existingCard) {
          throw new Error(`El número ${giftcardData.customNumber} ya existe. Por favor use otro número.`);
        }
        
        giftcardNumber = giftcardData.customNumber;
        console.log('🔢 Usando número personalizado:', giftcardNumber);
      } else {
        // Generar número automáticamente
        const { data: existingGiftcards } = await supabase
          .from('giftcards')
          .select('number');
        
        const existingNumbers = existingGiftcards?.map(g => g.number) || [];
        giftcardNumber = generateGiftcardNumber(existingNumbers);
        console.log('🎲 Número generado automáticamente:', giftcardNumber);
      }
      
      const newGiftcard = {
        number: giftcardNumber,
        buyer_name: giftcardData.buyer.name,
        buyer_email: giftcardData.buyer.email,
        buyer_phone: giftcardData.buyer.phone,
        recipient_name: giftcardData.recipient.name,
        recipient_email: giftcardData.recipient.email,
        recipient_phone: giftcardData.recipient.phone,
        amount: giftcardData.amount,
        status: 'created_not_delivered' as GiftcardStatus,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('giftcards')
        .insert([newGiftcard])
        .select()
        .single();
      
      if (error) throw error;
      
      const createdGiftcard = convertSupabaseToGiftcard(data);
      
      console.log('✅ Giftcard creada en Supabase:', createdGiftcard.number);
      
      // Actualizar estado local
      set(state => ({ 
        giftcards: [createdGiftcard, ...state.giftcards],
        filteredGiftcards: [createdGiftcard, ...state.filteredGiftcards],
        loading: false 
      }));
      
      return createdGiftcard;
    } catch (error) {
      console.error('❌ Error creando giftcard en Supabase:', error);
      set({ error: 'Error al crear la tarjeta de regalo', loading: false });
      throw error;
    }
  },
  
  updateGiftcardStatus: async (id: string, status: GiftcardStatus, notes?: string, artist?: string) => {
    console.log('🔄 Actualizando estado de giftcard en Supabase:', id, 'a', status);
    set({ error: null });
    
    try {
      const now = new Date().toISOString();
      const updateData: any = { status };
      
      if (status === 'delivered') {
        updateData.delivered_at = now;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 90);
        updateData.expires_at = expiryDate.toISOString();
      } else if (status === 'redeemed') {
        updateData.redeemed_at = now;
        if (notes) updateData.notes = notes;
        if (artist) updateData.artist = artist;
      } else if (status === 'cancelled') {
        updateData.cancelled_at = now;
        if (notes) updateData.notes = notes;
      }
      
      const { error } = await supabase
        .from('giftcards')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      console.log('✅ Estado actualizado en Supabase');
      
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
        };
      });
    } catch (error) {
      console.error('❌ Error actualizando estado en Supabase:', error);
      set({ error: 'Error al actualizar el estado de la tarjeta' });
      throw error;
    }
  },
  
  extendExpiration: async (id: string, days: number) => {
    console.log('📅 Extendiendo vencimiento en Supabase:', id, days, 'días');
    set({ error: null });
    
    try {
      const { selectedGiftcard } = get();
      if (!selectedGiftcard?.expiresAt) {
        throw new Error('La tarjeta no tiene fecha de vencimiento');
      }
      
      const currentExpiry = new Date(selectedGiftcard.expiresAt);
      currentExpiry.setDate(currentExpiry.getDate() + days);
      const newExpiresAt = currentExpiry.toISOString();
      
      const { error } = await supabase
        .from('giftcards')
        .update({ expires_at: newExpiresAt })
        .eq('id', id);
      
      if (error) throw error;
      
      console.log('✅ Vencimiento extendido en Supabase');
      
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
        };
      });
    } catch (error) {
      console.error('❌ Error extendiendo vencimiento en Supabase:', error);
      set({ error: 'Error al extender la fecha de vencimiento' });
      throw error;
    }
  },
  
  deleteGiftcard: async (id: string) => {
    console.log('🗑️ Eliminando giftcard de Supabase:', id);
    set({ error: null });
    
    try {
      const { error } = await supabase
        .from('giftcards')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      console.log('✅ Giftcard eliminada de Supabase');
      
      // Actualizar estado local
      set(state => ({
        giftcards: state.giftcards.filter(g => g.id !== id),
        filteredGiftcards: state.filteredGiftcards.filter(g => g.id !== id),
        selectedGiftcard: state.selectedGiftcard?.id === id ? null : state.selectedGiftcard,
      }));
    } catch (error) {
      console.error('❌ Error eliminando giftcard de Supabase:', error);
      set({ error: 'Error al eliminar la tarjeta de regalo' });
      throw error;
    }
  },
  
  acceptTerms: async (number: string) => {
    console.log('📋 Aceptando términos en Supabase para:', number);
    
    try {
      const termsAcceptedAt = new Date().toISOString();
      
      const { error } = await supabase
        .from('giftcards')
        .update({ terms_accepted_at: termsAcceptedAt })
        .eq('number', number);
      
      if (error) throw error;
      
      console.log('✅ Términos aceptados en Supabase');
      
      // Actualizar estado local
      set(state => {
        const updatedGiftcards = state.giftcards.map(g => 
          g.number === number ? { ...g, termsAcceptedAt } : g
        );
        
        return {
          giftcards: updatedGiftcards,
          filteredGiftcards: updatedGiftcards
        };
      });
    } catch (error) {
      console.error('❌ Error aceptando términos en Supabase:', error);
      throw new Error('Error al aceptar los términos y condiciones');
    }
  },

  getPublicGiftcardInfo: async (number: string): Promise<PublicGiftcardView | null> => {
    console.log('🔍 Consultando giftcard pública en Supabase:', number);
    
    try {
      const { data, error } = await supabase
        .from('giftcards')
        .select('number, amount, status, delivered_at, expires_at, terms_accepted_at')
        .eq('number', number)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No encontrado
          console.log('❌ Giftcard no encontrada en Supabase');
          return null;
        }
        throw error;
      }
      
      console.log('✅ Información pública obtenida de Supabase');
      
      return {
        number: data.number,
        amount: data.amount,
        status: data.status,
        deliveredAt: data.delivered_at,
        expiresAt: data.expires_at,
        termsAcceptedAt: data.terms_accepted_at
      };
    } catch (error) {
      console.error('❌ Error consultando giftcard pública en Supabase:', error);
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