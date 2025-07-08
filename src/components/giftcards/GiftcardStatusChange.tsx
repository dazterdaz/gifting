import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGiftcardStore } from '../../stores/giftcardStore';
import { useActivityStore } from '../../stores/activityStore';
import { useAuthStore } from '../../stores/authStore';
import { Giftcard, GiftcardStatus } from '../../types';
import { translateStatus } from '../../lib/utils';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import toast from 'react-hot-toast';

interface GiftcardStatusChangeProps {
  giftcard: Giftcard;
  onComplete: () => void;
}

const GiftcardStatusChange: React.FC<GiftcardStatusChangeProps> = ({ giftcard, onComplete }) => {
  const { t, i18n } = useTranslation();
  const { updateGiftcardStatus } = useGiftcardStore();
  const { logActivity } = useActivityStore();
  const { user } = useAuthStore();
  
  const [status, setStatus] = useState<GiftcardStatus>(giftcard.status);
  const [notes, setNotes] = useState('');
  const [artist, setArtist] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Determinar las opciones de estado disponibles según el estado actual y el rol
  const getAvailableStatuses = () => {
    const statuses: GiftcardStatus[] = [];
    const isSuperAdmin = user?.role === 'superadmin';
    
    switch (giftcard.status) {
      case 'created_not_delivered':
        // Solo puede avanzar a entregada
        statuses.push('created_not_delivered', 'delivered');
        // Solo superadmin puede anular desde este estado
        if (isSuperAdmin) {
          statuses.push('cancelled');
        }
        break;
      case 'delivered':
        // Solo puede avanzar a cobrada
        statuses.push('delivered', 'redeemed');
        // Solo superadmin puede anular desde este estado
        if (isSuperAdmin) {
          statuses.push('cancelled');
        }
        break;
      case 'redeemed':
      case 'cancelled':
        // Estados finales - solo superadmin puede modificar
        if (isSuperAdmin) {
          statuses.push('created_not_delivered', 'delivered', 'redeemed', 'cancelled');
        } else {
          statuses.push(giftcard.status);
        }
        break;
    }
    
    return statuses.map(status => ({
      value: status,
      label: translateStatus(status, i18n.language)
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    if (status === giftcard.status) {
      toast.error('No se ha cambiado el estado');
      return;
    }
    
    // Validar campos requeridos
    if (status === 'redeemed' && !artist) {
      toast.error('Por favor ingrese el nombre del artista');
      return;
    }
    
    if ((status === 'redeemed' || status === 'cancelled') && !notes) {
      toast.error('Por favor ingrese una nota explicativa');
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log('🔄 Cambiando estado de giftcard:', giftcard.id, 'de', giftcard.status, 'a', status);
      
      await updateGiftcardStatus(giftcard.id, status, notes, artist);
      
      // Registrar la actividad
      try {
        await logActivity({
          userId: user.id,
          username: user.username,
          action: 'status_change',
          targetType: 'giftcard',
          targetId: giftcard.id,
          details: `Cambió estado de ${translateStatus(giftcard.status, i18n.language)} a ${translateStatus(status, i18n.language)}`
        });
      } catch (activityError) {
        console.warn('⚠️ Error registrando actividad:', activityError);
        // No fallar por esto
      }
      
      toast.success('Estado actualizado correctamente');
      
      // Pequeño delay para asegurar que el estado se actualice
      setTimeout(() => {
        onComplete();
      }, 100);
      
    } catch (error) {
      console.error('Error updating status:', error);
      
      let errorMessage = 'Error al actualizar el estado';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSuperAdmin = user?.role === 'superadmin';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('giftcards.details.changeStatus')}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <Select
            label={t('common.status')}
            options={getAvailableStatuses()}
            value={status}
            onChange={setStatus}
          />
          
          {status === 'redeemed' && (
            <Input
              label={t('giftcards.form.artist')}
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              required
            />
          )}
          
          {(status === 'redeemed' || status === 'cancelled') && (
            <div>
              <Input
                label={t('giftcards.form.notes')}
                as="textarea"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
              />
            </div>
          )}
          
          {!isSuperAdmin && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Como administrador, solo puedes avanzar al siguiente estado en la secuencia:
                Creada → Entregada → Cobrada
              </p>
            </div>
          )}
          
          {(status === 'redeemed' || status === 'cancelled') && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-700">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {t('giftcards.confirmations.statusChangeWarning')}
              </p>
            </div>
          )}
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
            variant={status === 'cancelled' ? 'danger' : status === 'redeemed' ? 'success' : 'primary'}
            isLoading={isSubmitting}
          >
            {t('common.save')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default GiftcardStatusChange;