import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import ActivityFilters from './ActivityFilters';
import ActivityList from '../giftcards/ActivityList';
import { useActivityStore } from '../../stores/activityStore';

const GlobalActivity = () => {
  const { activities, getFilteredActivities, clearTodayActivities } = useActivityStore();
  const [filteredActivities, setFilteredActivities] = useState(activities);

  useEffect(() => {
    // Verificar si es un nuevo día y limpiar las actividades si es necesario
    const lastActivity = activities[0];
    if (lastActivity) {
      const today = new Date().toISOString().split('T')[0];
      if (!lastActivity.timestamp.startsWith(today)) {
        clearTodayActivities();
      }
    }
  }, []);

  const handleFilter = ({ date, userId }: { date?: string; userId?: string }) => {
    const filtered = getFilteredActivities(date, userId);
    setFilteredActivities(filtered);
  };

  const handleClearFilters = () => {
    const today = new Date().toISOString().split('T')[0];
    const filtered = getFilteredActivities(today);
    setFilteredActivities(filtered);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Global</CardTitle>
      </CardHeader>
      <CardContent>
        <ActivityFilters onFilter={handleFilter} onClear={handleClearFilters} />
        
        {filteredActivities.length > 0 ? (
          <ActivityList activities={filteredActivities} />
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No hay actividades para mostrar
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GlobalActivity;