import { useTranslation } from 'react-i18next';
import { ActivityLog } from '../../types';
import { formatDate } from '../../lib/utils';

interface ActivityListProps {
  activities: ActivityLog[];
  limit?: number;
  showHeader?: boolean;
}

const ActivityList: React.FC<ActivityListProps> = ({ 
  activities, 
  limit = undefined,
  showHeader = true 
}) => {
  const { t } = useTranslation();
  
  const displayActivities = limit ? activities.slice(0, limit) : activities;
  
  if (displayActivities.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        {t('dashboard.noRecentActivity')}
      </div>
    );
  }
  
  return (
    <div className="flow-root">
      {showHeader && (
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
          {t('dashboard.recentActivity')}
        </h3>
      )}
      <ul className="-mb-8">
        {displayActivities.map((activity, idx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {idx !== displayActivities.length - 1 && (
                <span
                  className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <span className="text-primary-600 dark:text-primary-300 font-semibold">
                      {activity.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {activity.username}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(activity.timestamp, 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    <p>{activity.details}</p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityList;