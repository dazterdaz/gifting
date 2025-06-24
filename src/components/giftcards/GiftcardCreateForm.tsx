import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { useGiftcardStore } from '../../stores/giftcardStore';
import { useActivityStore } from '../../stores/activityStore';
import { useAuthStore } from '../../stores/authStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import toast from 'react-hot-toast';

interface GiftcardFormValues {
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  amount: number;
  duration: number;
}

const GiftcardCreateForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createGiftcard } = useGiftcardStore();
  const { logActivity } = useActivityStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<GiftcardFormValues>({
    defaultValues: {
      amount: 0,
      duration: 90
    }
  });

  const durationOptions = [
    { value: '7', label: '7 días' },
    { value: '15', label: '15 días' },
    { value: '30', label: '30 días' },
    { value: '60', label: '60 días' },
    { value: '90', label: '90 días' }
  ];
  
  const onSubmit = async (data: GiftcardFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const giftcardData = {
        buyer: {
          name: data.buyerName,
          email: data.buyerEmail,
          phone: data.buyerPhone
        },
        recipient: {
          name: data.recipientName,
          email: data.recipientEmail,
          phone: data.recipientPhone
        },
        amount: data.amount,
        duration: parseInt(data.duration.toString())
      };
      
      const newGiftcard = await createGiftcard(giftcardData);
      
      await logActivity({
        userId: user.id,
        username: user.username,
        action: 'created',
        targetType: 'giftcard',
        targetId: newGiftcard.id,
        details: `Creó giftcard ${newGiftcard.number} con duración de ${data.duration} días`
      });
      
      toast.success(t('common.success'), {
        duration: 3000,
      });
      
      navigate('/giftcards');
      
    } catch (error) {
      console.error('Error creating giftcard:', error);
      toast.error(t('common.error'), {
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('giftcards.createNew')}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <div className="space-y-6">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('giftcards.details.buyerInfo')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label={t('giftcards.form.buyerName')}
                  {...register('buyerName', { required: t('common.required') as string })}
                  error={errors.buyerName?.message}
                />
                <Input
                  label={t('giftcards.form.buyerEmail')}
                  type="email"
                  {...register('buyerEmail', { 
                    required: t('common.required') as string,
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t('common.invalidEmail') as string
                    }
                  })}
                  error={errors.buyerEmail?.message}
                />
                <Input
                  label={t('giftcards.form.buyerPhone')}
                  {...register('buyerPhone', { 
                    required: t('common.required') as string,
                    pattern: {
                      value: /^\+?[0-9]{8,15}$/,
                      message: t('common.invalidPhone') as string
                    }
                  })}
                  error={errors.buyerPhone?.message}
                />
              </div>
            </div>
            
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('giftcards.details.recipientInfo')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label={t('giftcards.form.recipientName')}
                  {...register('recipientName', { required: t('common.required') as string })}
                  error={errors.recipientName?.message}
                />
                <Input
                  label={t('giftcards.form.recipientEmail')}
                  type="email"
                  {...register('recipientEmail', { 
                    required: t('common.required') as string,
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t('common.invalidEmail') as string
                    }
                  })}
                  error={errors.recipientEmail?.message}
                />
                <Input
                  label={t('giftcards.form.recipientPhone')}
                  {...register('recipientPhone', { 
                    required: t('common.required') as string,
                    pattern: {
                      value: /^\+?[0-9]{8,15}$/,
                      message: t('common.invalidPhone') as string
                    }
                  })}
                  error={errors.recipientPhone?.message}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('giftcards.form.amount')}
                type="number"
                min="0"
                step="1000"
                {...register('amount', { 
                  required: t('common.required') as string,
                  min: { value: 1000, message: 'El monto mínimo es 1000' },
                  valueAsNumber: true
                })}
                leftAdornment={<span className="text-gray-400">$</span>}
                error={errors.amount?.message}
              />

              <Select
                label="Duración de la tarjeta"
                options={durationOptions}
                {...register('duration', { required: t('common.required') as string })}
                error={errors.duration?.message}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate('/giftcards')}
          >
            {t('common.back')}
          </Button>
          <Button 
            type="submit" 
            isLoading={isSubmitting}
            leftIcon={<Save className="h-4 w-4" />}
          >
            {t('common.create')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default GiftcardCreateForm;