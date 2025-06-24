import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import SiteSettings from '../components/settings/SiteSettings';
import TermsEditor from '../components/settings/TermsEditor';

const Settings = () => {
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
        Configuración
      </h1>
      
      <div className="grid grid-cols-1 gap-6">
        <SiteSettings />
        <TermsEditor />
      </div>
    </div>
  );
};

export default Settings;