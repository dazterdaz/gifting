import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { useGiftcardStore } from '../../stores/giftcardStore';
import { useActivityStore } from '../../stores/activityStore';
import { useAuthStore } from '../../stores/authStore';
import { getCurrentUser } from '../../lib/auth';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import toast from 'react-hot-toast';

interface GiftcardFormValues {
  customNumber?: string;
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
  const { user, ensureFirebaseAuth } = useAuthStore();
  const { createGiftcard } = useGiftcardStore();
  const { logActivity } = useActivityStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<GiftcardFormValues>({
    defaultValues: {
      customNumber: '',
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
    const currentUser = getCurrentUser();
    if (!currentUser) {
      toast.error('No hay usuario autenticado');
      return;
    }
    
    console.log('📝 Iniciando creación de tarjeta de regalo...');
    
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
        duration: data.duration ? parseInt(data.duration.toString()) : 90
      };
      
      // Si se especifica un número personalizado, usarlo
      if (data.customNumber && data.customNumber.trim()) {
        giftcardData.customNumber = data.customNumber.trim();
      };
      
      const newGiftcard = await createGiftcard(giftcardData);
      
      console.log('✅ Tarjeta de regalo creada exitosamente:', newGiftcard.number);
      
      // Intentar registrar actividad, pero no fallar si hay error
      try {
        await logActivity({
          userId: currentUser.id,
          username: currentUser.username,
          action: 'created',
          targetType: 'giftcard',
          targetId: newGiftcard.id,
          details: `Creó giftcard ${newGiftcard.number} con duración de ${data.duration || 90} días`
        });
        console.log('📝 Actividad registrada correctamente');
      } catch (activityError) {
        console.warn('⚠️ Error registrando actividad:', activityError);
      }
      
      toast.success(`¡Tarjeta ${newGiftcard.number} creada exitosamente!`, {
        duration: 3000,
      });
      
      navigate('/giftcards');
      
    } catch (error) {
      console.error('❌ Error en el formulario:', error);
      
      const errorMessage = error.message || 'Error al crear la tarjeta de regalo';
      
      toast.error(errorMessage, {
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
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <h3 className="text-lg font-medium text-amber-900 dark:text-amber-100 mb-4">
                ⚙️ Configuración de la Tarjeta
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Número personalizado (opcional)"
                  {...register('customNumber', {
                    pattern: {
                      value: /^\d{8}$/,
                      message: 'El número debe tener exactamente 8 dígitos'
                    }
                  })}
                  error={errors.customNumber?.message}
                  placeholder="12345678"
                  maxLength={8}
                />
                
                <Select
                  label="Duración de la tarjeta"
                  options={durationOptions}
                  {...register('duration', { required: t('common.required') as string })}
                  error={errors.duration?.message}
                />
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
                💡 Si no especifica un número, se generará automáticamente uno único de 8 dígitos.
              </p>
            </div>
            
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
            
            <div>
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