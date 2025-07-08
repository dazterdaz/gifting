import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Clock, Edit, Printer, Gift, RefreshCw, Trash } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';
import ActivityList from './ActivityList';
import GiftcardStatusChange from './GiftcardStatusChange';
import GiftcardExtendExpiry from './GiftcardExtendExpiry';
import { useGiftcardStore } from '../../stores/giftcardStore';
import { useActivityStore } from '../../stores/activityStore';
import { useAuthStore } from '../../stores/authStore';
import { formatDate, formatCurrency, daysUntilExpiration } from '../../lib/utils';
import toast from 'react-hot-toast';

type ActivePanel = 'details' | 'changeStatus' | 'extendExpiry';

const GiftcardDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { selectedGiftcard, getGiftcardById, loading, deleteGiftcard } = useGiftcardStore();
  const { activities, getActivitiesByTarget } = useActivityStore();
  const [giftcardActivities, setGiftcardActivities] = useState<any[]>([]);
  const [activePanel, setActivePanel] = useState<ActivePanel>('details');
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    if (id) {
      getGiftcardById(id);
    }
  }, [id]);
  
  useEffect(() => {
    if (selectedGiftcard) {
      const activities = getActivitiesByTarget('giftcard', selectedGiftcard.id);
      setGiftcardActivities(activities);
    }
  }, [selectedGiftcard, activities]);
  
  const handleBack = () => {
    navigate('/giftcards');
  };
  
  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async () => {
    if (!selectedGiftcard || !user) return;

    if (confirm('¿Estás seguro que deseas eliminar permanentemente esta tarjeta? Esta acción no se puede deshacer.')) {
      setIsDeleting(true);
      try {
        await deleteGiftcard(selectedGiftcard.id);
        await logActivity({
          userId: user.id,
          username: user.username,
          action: 'deleted',
          targetType: 'giftcard',
          targetId: selectedGiftcard.id,
          details: `Eliminó permanentemente la tarjeta ${selectedGiftcard.number}`
        });
        
        toast.success('Tarjeta eliminada permanentemente');
        navigate('/giftcards');
      } catch (error) {
        console.error('Error deleting giftcard:', error);
        toast.error('Error al eliminar la tarjeta');
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin-slow w-12 h-12 border-b-2 border-primary-600 rounded-full"></div>
      </div>
    );
  }
  
  if (!selectedGiftcard) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Giftcard no encontrada</p>
        <Button onClick={handleBack} variant="outline" className="mt-4">
          {t('common.back')}
        </Button>
      </div>
    );
  }
  
  const daysLeft = daysUntilExpiration(selectedGiftcard.expiresAt);
  const isExpired = daysLeft !== null && daysLeft <= 0;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('giftcards.details.title')}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer className="h-4 w-4" />}
            onClick={handlePrint}
          >
            Imprimir
          </Button>
          
          {user?.role === 'superadmin' && (
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash className="h-4 w-4" />}
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Eliminar
            </Button>
          )}
        </div>
      </div>
      
      {activePanel === 'details' && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden print:shadow-none">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center justify-center p-3 bg-primary-100 dark:bg-primary-900 rounded-full">
                    <Gift className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedGiftcard.number}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(selectedGiftcard.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={selectedGiftcard.status} className="ml-0 sm:ml-4" />
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('giftcards.amount')}</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(selectedGiftcard.amount)}
                  </span>
                </div>
              </div>
              
              {selectedGiftcard.status === 'delivered' && selectedGiftcard.expiresAt && (
                <div className="mt-4 p-3 rounded-md bg-gray-50 dark:bg-gray-900/50 flex items-center gap-2">
                  <Clock className={`h-5 w-5 ${isExpired ? 'text-error-500' : 'text-gray-500 dark:text-gray-400'}`} />
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {t('giftcards.expirationDate')}: {formatDate(selectedGiftcard.expiresAt)}
                    </span>
                    {daysLeft !== null && (
                      <span className={`ml-2 text-sm font-medium ${
                        isExpired 
                          ? 'text-error-600 dark:text-error-400' 
                          : daysLeft <= 15 
                            ? 'text-warning-600 dark:text-warning-400' 
                            : 'text-gray-600 dark:text-gray-300'
                      }`}>
                        {isExpired 
                          ? t('giftcards.expired')
                          : `${daysLeft} ${daysLeft === 1 ? 'día restante' : 'días restantes'}`}
                      </span>
                    )}
                    
                    {/* Información adicional sobre el vencimiento */}
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {selectedGiftcard.duration && (
                        <span>Duración original: {selectedGiftcard.duration} días • </span>
                      )}
                      Entregada: {selectedGiftcard.deliveredAt && formatDate(selectedGiftcard.deliveredAt)}
                    </div>
                  </div>
                </div>
              )}
              
              {selectedGiftcard.status === 'created_not_delivered' && selectedGiftcard.duration && (
                <div className="mt-4 p-3 rounded-md bg-blue-50 dark:bg-blue-900/50 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <div>
                    <span className="text-sm text-blue-600 dark:text-blue-300">
                      <strong>Duración configurada:</strong> {selectedGiftcard.duration} días
                    </span>
                    <div className="mt-1 text-xs text-blue-500 dark:text-blue-400">
                      La fecha de vencimiento se establecerá automáticamente cuando la tarjeta sea marcada como "Entregada"
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t('giftcards.details.buyerInfo')}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('giftcards.form.buyerName')}
                    </label>
                    <p className="mt-1 text-base text-gray-900 dark:text-white">
                      {selectedGiftcard.buyer.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('giftcards.form.buyerEmail')}
                    </label>
                    <p className="mt-1 text-base text-gray-900 dark:text-white">
                      {selectedGiftcard.buyer.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('giftcards.form.buyerPhone')}
                    </label>
                    <p className="mt-1 text-base text-gray-900 dark:text-white">
                      {selectedGiftcard.buyer.phone}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t('giftcards.details.recipientInfo')}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('giftcards.form.recipientName')}
                    </label>
                    <p className="mt-1 text-base text-gray-900 dark:text-white">
                      {selectedGiftcard.recipient.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('giftcards.form.recipientEmail')}
                    </label>
                    <p className="mt-1 text-base text-gray-900 dark:text-white">
                      {selectedGiftcard.recipient.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('giftcards.form.recipientPhone')}
                    </label>
                    <p className="mt-1 text-base text-gray-900 dark:text-white">
                      {selectedGiftcard.recipient.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {(selectedGiftcard.notes || selectedGiftcard.artist) && (
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t('giftcards.details.additionalNotes')}
                </h3>
                
                {selectedGiftcard.artist && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('giftcards.details.artist')}
                    </label>
                    <p className="mt-1 text-base text-gray-900 dark:text-white">
                      {selectedGiftcard.artist}
                    </p>
                  </div>
                )}
                
                {selectedGiftcard.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('giftcards.form.notes')}
                    </label>
                    <p className="mt-1 text-base text-gray-900 dark:text-white">
                      {selectedGiftcard.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 print:hidden">
              <div className="flex flex-wrap gap-2 justify-end">
                {(selectedGiftcard.status === 'created_not_delivered' || selectedGiftcard.status === 'delivered') && (
                  <Button 
                    variant="primary"
                    leftIcon={<Edit className="h-4 w-4" />}
                    onClick={() => setActivePanel('changeStatus')}
                  >
                    {t('giftcards.details.changeStatus')}
                  </Button>
                )}
                
                {user?.role === 'superadmin' && selectedGiftcard.status === 'delivered' && selectedGiftcard.expiresAt && (
                  <Button 
                    variant="outline"
                    leftIcon={<RefreshCw className="h-4 w-4" />}
                    onClick={() => setActivePanel('extendExpiry')}
                  >
                    {t('giftcards.details.extendExpiration')}
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle>{t('giftcards.details.statusHistory')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityList activities={giftcardActivities} />
            </CardContent>
          </Card>
        </>
      )}
      
      {activePanel === 'changeStatus' && (
        <GiftcardStatusChange 
          giftcard={selectedGiftcard} 
          onComplete={() => setActivePanel('details')} 
        />
      )}
      
      {activePanel === 'extendExpiry' && (
        <GiftcardExtendExpiry
          giftcard={selectedGiftcard}
          onComplete={() => setActivePanel('details')}
        />
      )}
    </div>
  );
};

export default GiftcardDetails;