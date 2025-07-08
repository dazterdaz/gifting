import { create } from 'zustand';
import { dbService } from '../lib/database';
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

// Convertir datos de base de datos a formato de la aplicación
const convertDbToActivity = (dbData: any): ActivityLog => ({
  id: dbData.id,
  userId: dbData.user_id,
  username: dbData.username,
  action: dbData.action,
  targetType: dbData.target_type,
  targetId: dbData.target_id,
  details: dbData.details,
  timestamp: dbData.timestamp
});

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
    console.log('📊 Cargando actividades desde base de datos...');
    set({ loading: true, error: null });
    
    try {
      const dbActivities = await dbService.activities.getAll();
      const activities = dbActivities.map(convertDbToActivity);
      
      console.log('✅ Actividades cargadas desde base de datos:', activities.length);
      
      set({ activities, loading: false });
    } catch (error) {
      console.error('❌ Error cargando actividades desde base de datos:', error);
      set({ error: 'Error al cargar las actividades', loading: false });
    }
  },
  
  fetchRecentActivities: async (limitCount = 5) => {
    console.log('📊 Cargando actividades recientes desde base de datos...');
    set({ loading: true, error: null });
    
    try {
      const dbActivities = await dbService.activities.getRecent(limitCount);
      const recentActivities = dbActivities.map(convertDbToActivity);
      
      console.log('✅ Actividades recientes cargadas desde base de datos:', recentActivities.length);
      
      set({ 
        recentActivities, 
        loading: false 
      });
    } catch (error) {
      console.error('❌ Error cargando actividades recientes desde base de datos:', error);
      set({ error: 'Error al cargar actividades recientes', loading: false });
    }
  },
  
  logActivity: async (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    console.log('📝 Registrando actividad en base de datos:', activity.action);
    
    try {
      await dbService.activities.create(activity);
      
      console.log('✅ Actividad registrada en base de datos:', activity.details);
      
      // Crear objeto completo para el estado local
      const activityWithId: ActivityLog = {
        ...activity,
        id: Math.random().toString(36).substring(2, 15),
        timestamp: new Date().toISOString()
      };
      
      // Actualizar estado local
      set(state => ({
        activities: [activityWithId, ...state.activities],
        recentActivities: [activityWithId, ...state.recentActivities].slice(0, 5)
      }));
    } catch (error) {
      console.error('❌ Error registrando actividad en base de datos:', error);
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
    // Esta función mantiene las actividades para persistencia en base de datos
  }
}));