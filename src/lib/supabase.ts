import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🟢 Supabase inicializado correctamente');

// Tipos de base de datos
export interface Database {
  public: {
    Tables: {
      giftcards: {
        Row: {
          id: string;
          number: string;
          buyer_name: string;
          buyer_email: string;
          buyer_phone: string;
          recipient_name: string;
          recipient_email: string;
          recipient_phone: string;
          amount: number;
          status: 'created_not_delivered' | 'delivered' | 'redeemed' | 'cancelled';
          created_at: string;
          delivered_at?: string;
          expires_at?: string;
          redeemed_at?: string;
          cancelled_at?: string;
          notes?: string;
          artist?: string;
          terms_accepted_at?: string;
        };
        Insert: {
          id?: string;
          number: string;
          buyer_name: string;
          buyer_email: string;
          buyer_phone: string;
          recipient_name: string;
          recipient_email: string;
          recipient_phone: string;
          amount: number;
          status?: 'created_not_delivered' | 'delivered' | 'redeemed' | 'cancelled';
          created_at?: string;
          delivered_at?: string;
          expires_at?: string;
          redeemed_at?: string;
          cancelled_at?: string;
          notes?: string;
          artist?: string;
          terms_accepted_at?: string;
        };
        Update: {
          id?: string;
          number?: string;
          buyer_name?: string;
          buyer_email?: string;
          buyer_phone?: string;
          recipient_name?: string;
          recipient_email?: string;
          recipient_phone?: string;
          amount?: number;
          status?: 'created_not_delivered' | 'delivered' | 'redeemed' | 'cancelled';
          created_at?: string;
          delivered_at?: string;
          expires_at?: string;
          redeemed_at?: string;
          cancelled_at?: string;
          notes?: string;
          artist?: string;
          terms_accepted_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          action: string;
          target_type: 'giftcard' | 'user' | 'system' | 'terms';
          target_id?: string;
          details?: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          action: string;
          target_type: 'giftcard' | 'user' | 'system' | 'terms';
          target_id?: string;
          details?: string;
          timestamp?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          action?: string;
          target_type?: 'giftcard' | 'user' | 'system' | 'terms';
          target_id?: string;
          details?: string;
          timestamp?: string;
        };
      };
      users: {
        Row: {
          id: string;
          username: string;
          email: string;
          role: 'superadmin' | 'admin';
          last_login?: string;
          created_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          username: string;
          email: string;
          role?: 'superadmin' | 'admin';
          last_login?: string;
          created_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          role?: 'superadmin' | 'admin';
          last_login?: string;
          created_at?: string;
          is_active?: boolean;
        };
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          whatsapp: string;
          email: string;
          message: string;
          status: 'nuevo' | 'leido' | 'contactado' | 'pagado';
          created_at: string;
          archived: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          whatsapp: string;
          email: string;
          message: string;
          status?: 'nuevo' | 'leido' | 'contactado' | 'pagado';
          created_at?: string;
          archived?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          whatsapp?: string;
          email?: string;
          message?: string;
          status?: 'nuevo' | 'leido' | 'contactado' | 'pagado';
          created_at?: string;
          archived?: boolean;
        };
      };
      settings: {
        Row: {
          id: string;
          site_name: string;
          logo_url: string;
          logo_color: string;
          terms_content?: string;
          contact_info?: any;
          testimonials?: any;
          social_links?: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          site_name: string;
          logo_url: string;
          logo_color: string;
          terms_content?: string;
          contact_info?: any;
          testimonials?: any;
          social_links?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          site_name?: string;
          logo_url?: string;
          logo_color?: string;
          terms_content?: string;
          contact_info?: any;
          testimonials?: any;
          social_links?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}