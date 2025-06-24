import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGiftcardStore } from '../../stores/giftcardStore';
import { useActivityStore } from '../../stores/activityStore';
import { useAuthStore } from '../../stores/authStore';
import { Giftcard } from '../../types';
import { formatDate } from '../../lib/utils';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import toast from 'react-hot-toast';

interface GiftcardExtendExpiryProps {
  giftcard: Giftcard;
  onComplete: () => void;
}

const GiftcardExtendExpiry: React.FC<GiftcardExtendExpiryProps> = ({ giftcard, onComplete }) => {
  const { t } = useTranslation();
  const { extendExpiration } = useGiftcardStore();
  const { logActivity } = useActivityStore();
  const { user } = useAuthStore();
  
  const [days, setDays] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    if (!giftcard.expiresAt) {
      toast.error('Esta tarjeta no tiene fecha de vencimiento');
      return;
    }
    
    if (days <= 0) {
      toast.error('Por favor ingrese un número válido de días');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await extendExpiration(giftcard.id, days);
      
      // Log the activity
      await logActivity({
        userId: user.id,
        username: user.username,
        action: 'extend_expiry',
        targetType: 'giftcard',
        targetId: giftcard.id,
        details: `Extendió la fecha de vencimiento ${days} días`
      });
      
      toast.success('Fecha de vencimiento extendida correctamente');
      onComplete();
    } catch (error) {
      console.error('Error extending expiration:', error);
      toast.error('Error al extender la fecha de vencimiento');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!giftcard.expiresAt) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500 dark:text-gray-400">
            Esta tarjeta no tiene una fecha de vencimiento establecida.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button onClick={onComplete} variant="outline">
            {t('common.back')}
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('giftcards.details.extendExpiration')}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('giftcards.expirationDate')}
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {formatDate(giftcard.expiresAt)}
              </p>
            </div>
            
            <Input
              type="number"
              label="Días a extender"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              min={1}
              required
            />
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-700">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              La nueva fecha de vencimiento será: {' '}
              <strong>
                {formatDate(new Date(new Date(giftcard.expiresAt).getTime() + days * 24 * 60 * 60 * 1000))}
              </strong>
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onComplete}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
          >
            {t('common.save')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default GiftcardExtendExpiry;