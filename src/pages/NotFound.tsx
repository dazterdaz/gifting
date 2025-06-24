import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, X } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFound = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center px-4 py-12">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-error-100 dark:bg-error-900">
          <X className="h-16 w-16 text-error-600 dark:text-error-400" />
        </div>
        
        <h1 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
          404
        </h1>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
          {t('errors.notFound')}
        </p>
        
        <div className="mt-6">
          <Link to="/">
            <Button leftIcon={<Home className="h-5 w-5" />}>
              {t('errors.goHome')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;