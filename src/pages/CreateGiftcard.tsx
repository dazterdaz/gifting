import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { Navigate } from 'react-router-dom';
import GiftcardCreateForm from '../components/giftcards/GiftcardCreateForm';

const CreateGiftcard = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  
  // Verificar permisos
  if (!user || user.role !== 'superadmin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('giftcards.createNew')}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Complete la información para crear una nueva tarjeta de regalo
          </p>
        </div>
      </div>
      
      <GiftcardCreateForm />
    </div>
  );
};

export default CreateGiftcard;