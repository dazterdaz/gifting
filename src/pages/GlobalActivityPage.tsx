import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import GlobalActivity from '../components/activity/GlobalActivity';

const GlobalActivityPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  if (user?.role !== 'superadmin') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          No tienes permisos para acceder a esta página
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Actividad Global
      </h1>
      
      <GlobalActivity />
    </div>
  );
};

export default GlobalActivityPage;