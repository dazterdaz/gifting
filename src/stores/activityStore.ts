import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { ActivityLog } from '../types';

interface ActivityState {
  activities: ActivityLog[];
  recentActivities: ActivityLog[];
  loading: boolean;
  error: string | null;
  
  fetchActivities: () => Promise<void>;
  fetchRecentActivities: (limit?: number) => Promise<void>;
  logActivity: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => Promise<void>;
  getActivitiesByTarget: (targetType: string, targetId: string) => ActivityLog[];
  getFilteredActivities: (date?: string, userId?: string) => ActivityLog[];
  clearTodayActivities: () => void;
}

const isSameDay = (date1: string, date2: string) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

export const useActivityStore = create<ActivityState>()((set, get) => ({
  activities: [],
  recentActivities: [],
  loading: false,
  error: null,
  
  fetchActivities: async () => {
    console.log('📊 Cargando actividades desde Supabase...');
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      const activities = data.map(row => ({
        id: row.id,
        userId: row.user_id,
        username: row.username,
        action: row.action,
        targetType: row.target_type,
        targetId: row.target_id,
        details: row.details,
        timestamp: row.timestamp
      }));
      
      console.log('✅ Actividades cargadas desde Supabase:', activities.length);
      
      set({ activities, loading: false });
    } catch (error) {
      console.error('❌ Error cargando actividades desde Supabase:', error);
      set({ error: 'Error al cargar las actividades', loading: false });
    }
  },
  
  fetchRecentActivities: async (limitCount = 5) => {
    console.log('📊 Cargando actividades recientes desde Supabase...');
    
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limitCount);
      
      if (error) throw error;
      
      const recentActivities = data.map(row => ({
        id: row.id,
        userId: row.user_id,
        username: row.username,
        action: row.action,
        targetType: row.target_type,
        targetId: row.target_id,
        details: row.details,
        timestamp: row.timestamp
      }));
      
      console.log('✅ Actividades recientes cargadas desde Supabase:', recentActivities.length);
      
      set({ 
        recentActivities, 
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('❌ Error cargando actividades recientes desde Supabase:', error);
      
      // No fallar completamente, usar array vacío como fallback
      set({ 
        recentActivities: [],
        loading: false,
        error: null
      });
    }
  },
  
  logActivity: async (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    console.log('📝 Registrando actividad en Supabase:', activity.action);
    
    try {
      const newActivity = {
        user_id: activity.userId,
        username: activity.username,
        action: activity.action,
        target_type: activity.targetType,
        target_id: activity.targetId,
        details: activity.details,
        timestamp: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('activities')
        .insert([newActivity])
        .select()
        .single();
      
      if (error) throw error;
      
      const activityWithId: ActivityLog = {
        id: data.id,
        userId: data.user_id,
        username: data.username,
        action: data.action,
        targetType: data.target_type,
        targetId: data.target_id,
        details: data.details,
        timestamp: data.timestamp
      };
      
      console.log('✅ Actividad registrada en Supabase:', activityWithId.details);
      
      // Actualizar estado local
      set(state => ({
        activities: [activityWithId, ...state.activities],
        recentActivities: [activityWithId, ...state.recentActivities].slice(0, 5)
      }));
    } catch (error) {
      console.error('❌ Error registrando actividad en Supabase:', error);
    }
  },
  
  getActivitiesByTarget: (targetType: string, targetId: string) => {
    const { activities } = get();
    return activities
      .filter(a => a.targetType === targetType && a.targetId === targetId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },
  
  getFilteredActivities: (date?: string, userId?: string) => {
    const { activities } = get();
    return activities.filter(activity => {
      if (date && !isSameDay(activity.timestamp, date)) {
        return false;
      }
      if (userId && activity.userId !== userId) {
        return false;
      }
      return true;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },
  
  clearTodayActivities: () => {
    console.log('🧹 Limpiando actividades del día');
  }
}));