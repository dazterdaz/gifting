import { useTranslation } from 'react-i18next';
import GiftcardCreateForm from '../components/giftcards/GiftcardCreateForm';

const CreateGiftcard = () => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t('giftcards.createNew')}
      </h1>
      
      <GiftcardCreateForm />
    </div>
  );
};

export default CreateGiftcard;