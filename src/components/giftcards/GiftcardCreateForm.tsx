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
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<GiftcardFormValues>({
    defaultValues: {
      amount: 0,
      duration: 90,
      buyerName: '',
      buyerEmail: '',
      buyerPhone: '',
      recipientName: '',
      recipientEmail: '',
      recipientPhone: ''
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
    console.log('📝 Enviando formulario de giftcard:', data);
    
    if (!user) {
      toast.error('Usuario no autenticado');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const giftcardData = {
        buyer: {
          name: data.buyerName.trim(),
          email: data.buyerEmail.trim().toLowerCase(),
          phone: data.buyerPhone.trim()
        },
        recipient: {
          name: data.recipientName.trim(),
          email: data.recipientEmail.trim().toLowerCase(),
          phone: data.recipientPhone.trim()
        },
        amount: Number(data.amount),
        duration: Number(data.duration)
      };
      
      console.log('🎫 Creando giftcard con datos:', giftcardData);
      
      const newGiftcard = await createGiftcard(giftcardData);
      
      console.log('✅ Giftcard creada exitosamente:', newGiftcard);
      
      // Registrar actividad
      try {
        await logActivity({
          userId: user.id,
          username: user.username,
          action: 'created',
          targetType: 'giftcard',
          targetId: newGiftcard.id,
          details: `Creó giftcard ${newGiftcard.number} con duración de ${data.duration} días por $${data.amount.toLocaleString()}`
        });
      } catch (activityError) {
        console.warn('⚠️ Error registrando actividad:', activityError);
        // No fallar por esto
      }
      
      toast.success('¡Giftcard creada exitosamente!', {
        duration: 3000,
      });
      
      // Navegar de vuelta a la lista
      navigate('/giftcards');
      
    } catch (error) {
      console.error('❌ Error creando giftcard:', error);
      
      let errorMessage = 'Error al crear la giftcard';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBack = () => {
    navigate('/giftcards');
  };

  // Observar el valor de duración para mostrar información dinámica
  const watchedDuration = watch('duration');
  
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🎁</span>
            {t('giftcards.createNew')}
          </CardTitle>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent>
            <div className="space-y-8">
              {/* Información del Comprador */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>👤</span>
                  {t('giftcards.details.buyerInfo')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label={t('giftcards.form.buyerName')}
                    placeholder="Nombre completo del comprador"
                    {...register('buyerName', { 
                      required: 'El nombre del comprador es obligatorio',
                      minLength: { value: 2, message: 'El nombre debe tener al menos 2 caracteres' }
                    })}
                    error={errors.buyerName?.message}
                  />
                  <Input
                    label={t('giftcards.form.buyerEmail')}
                    type="email"
                    placeholder="email@ejemplo.com"
                    {...register('buyerEmail', { 
                      required: 'El email del comprador es obligatorio',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Ingrese un email válido'
                      }
                    })}
                    error={errors.buyerEmail?.message}
                  />
                  <Input
                    label={t('giftcards.form.buyerPhone')}
                    placeholder="+56 9 1234 5678"
                    {...register('buyerPhone', { 
                      required: 'El teléfono del comprador es obligatorio',
                      pattern: {
                        value: /^\+?[0-9\s\-\(\)]{8,15}$/,
                        message: 'Ingrese un teléfono válido'
                      }
                    })}
                    error={errors.buyerPhone?.message}
                  />
                </div>
              </div>
              
              {/* Información del Destinatario */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>🎯</span>
                  {t('giftcards.details.recipientInfo')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label={t('giftcards.form.recipientName')}
                    placeholder="Nombre completo del destinatario"
                    {...register('recipientName', { 
                      required: 'El nombre del destinatario es obligatorio',
                      minLength: { value: 2, message: 'El nombre debe tener al menos 2 caracteres' }
                    })}
                    error={errors.recipientName?.message}
                  />
                  <Input
                    label={t('giftcards.form.recipientEmail')}
                    type="email"
                    placeholder="email@ejemplo.com"
                    {...register('recipientEmail', { 
                      required: 'El email del destinatario es obligatorio',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Ingrese un email válido'
                      }
                    })}
                    error={errors.recipientEmail?.message}
                  />
                  <Input
                    label={t('giftcards.form.recipientPhone')}
                    placeholder="+56 9 1234 5678"
                    {...register('recipientPhone', { 
                      required: 'El teléfono del destinatario es obligatorio',
                      pattern: {
                        value: /^\+?[0-9\s\-\(\)]{8,15}$/,
                        message: 'Ingrese un teléfono válido'
                      }
                    })}
                    error={errors.recipientPhone?.message}
                  />
                </div>
              </div>
              
              {/* Configuración de la Giftcard */}
              <div className="pb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>⚙️</span>
                  Configuración de la Tarjeta
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label={t('giftcards.form.amount')}
                    type="number"
                    min="1000"
                    step="1000"
                    placeholder="50000"
                    {...register('amount', { 
                      required: 'El monto es obligatorio',
                      min: { value: 1000, message: 'El monto mínimo es $1.000' },
                      max: { value: 1000000, message: 'El monto máximo es $1.000.000' },
                      valueAsNumber: true
                    })}
                    leftAdornment={<span className="text-gray-400">$</span>}
                    error={errors.amount?.message}
                  />

                  <Select
                    label="Duración de la tarjeta"
                    options={durationOptions}
                    value={watchedDuration?.toString() || '90'}
                    onChange={(value) => {
                      // Actualizar el valor en el formulario
                      register('duration').onChange({
                        target: { value: parseInt(value), name: 'duration' }
                      });
                    }}
                    error={errors.duration?.message}
                  />
                </div>
              </div>
              
              {/* Información de Vencimiento */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <span>📅</span>
                  Información de Vencimiento
                </h4>
                <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <p><strong>• Fecha de vencimiento:</strong> Se establecerá automáticamente cuando la tarjeta sea marcada como "Entregada"</p>
                  <p><strong>• Duración:</strong> La tarjeta será válida por {watchedDuration || 90} días desde la fecha de entrega</p>
                  <p><strong>• Consulta pública:</strong> Los clientes podrán ver cuántos días les quedan al consultar su tarjeta</p>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between bg-gray-50 dark:bg-gray-900/50">
            <Button
              type="button"
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={handleBack}
              disabled={isSubmitting}
            >
              {t('common.back')}
            </Button>
            <Button 
              type="submit" 
              isLoading={isSubmitting}
              leftIcon={<Save className="h-4 w-4" />}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creando...' : t('common.create')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default GiftcardCreateForm;