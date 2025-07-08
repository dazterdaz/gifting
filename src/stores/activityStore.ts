import { create } from 'zustand';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  Timestamp 
} from '../lib/firebase';
import { db } from '../lib/firebase';
import { ActivityLog } from '../types';

// Convertir documento de Firestore a ActivityLog
const convertFirestoreToActivity = (doc: any): ActivityLog => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp,
  };
};

// Convertir ActivityLog a formato Firestore
const convertActivityToFirestore = (activity: Partial<ActivityLog>) => {
  const data = { ...activity };
  
  if (data.timestamp) {
    data.timestamp = Timestamp.fromDate(new Date(data.timestamp));
  }
  
  delete data.id;
  return data;
};

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
    console.log('📊 Cargando actividades desde Firebase...');
    set({ loading: true, error: null });
    
    try {
      const activitiesRef = collection(db, 'activities');
      const q = query(activitiesRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const activities = querySnapshot.docs.map(convertFirestoreToActivity);
      
      console.log('✅ Actividades cargadas desde Firebase:', activities.length);
      
      set({ activities, loading: false });
    } catch (error) {
      console.error('❌ Error cargando actividades desde Firebase:', error);
      set({ error: 'Error al cargar las actividades', loading: false });
    }
  },
  
  fetchRecentActivities: async (limitCount = 5) => {
    console.log('📊 Cargando actividades recientes desde Firebase...');
    
    try {
      const activitiesRef = collection(db, 'activities');
      const q = query(
        activitiesRef, 
        orderBy('timestamp', 'desc'), 
        firestoreLimit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      
      const recentActivities = querySnapshot.docs.map(convertFirestoreToActivity);
      
      console.log('✅ Actividades recientes cargadas desde Firebase:', recentActivities.length);
      
      set({ 
        recentActivities, 
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('❌ Error cargando actividades recientes desde Firebase:', error);
      
      // No fallar completamente, usar array vacío como fallback
      set({ 
        recentActivities: [],
        loading: false,
        error: null // No mostrar error al usuario
      });
    }
  },
  
  logActivity: async (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    console.log('📝 Registrando actividad en Firebase:', activity.action);
    
    try {
      const newActivity: Omit<ActivityLog, 'id'> = {
        ...activity,
        timestamp: new Date().toISOString()
      };
      
      // Guardar en Firebase
      const activitiesRef = collection(db, 'activities');
      const firestoreData = convertActivityToFirestore(newActivity);
      const docRef = await addDoc(activitiesRef, firestoreData);
      
      const activityWithId: ActivityLog = {
        ...newActivity,
        id: docRef.id
      };
      
      console.log('✅ Actividad registrada en Firebase:', activityWithId.details);
      
      // Actualizar estado local
      set(state => ({
        activities: [activityWithId, ...state.activities],
        recentActivities: [activityWithId, ...state.recentActivities].slice(0, 5)
      }));
    } catch (error) {
      console.error('❌ Error registrando actividad en Firebase:', error);
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
    // Esta función mantiene las actividades para persistencia en Firebase
  }
}));