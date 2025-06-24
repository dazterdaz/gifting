import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, ArrowUpDown, Edit, Trash } from 'lucide-react';
import { Giftcard } from '../../types';
import { formatDate, formatCurrency, daysUntilExpiration, isAboutToExpire, cn } from '../../lib/utils';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { useGiftcardStore } from '../../stores/giftcardStore';
import { useActivityStore } from '../../stores/activityStore';
import GiftcardStatusChange from './GiftcardStatusChange';
import toast from 'react-hot-toast';

interface GiftcardListProps {
  giftcards: Giftcard[];
  loading?: boolean;
}

const GiftcardList: React.FC<GiftcardListProps> = ({ giftcards, loading = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { deleteGiftcard } = useGiftcardStore();
  const { logActivity } = useActivityStore();
  const [sortField, setSortField] = useState<keyof Giftcard>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [sortedGiftcards, setSortedGiftcards] = useState<Giftcard[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedGiftcard, setSelectedGiftcard] = useState<Giftcard | null>(null);
  
  useEffect(() => {
    const sorted = [...giftcards].sort((a, b) => {
      if (sortField === 'amount') {
        return sortDirection === 'asc' 
          ? a.amount - b.amount 
          : b.amount - a.amount;
      } else {
        const aValue = a[sortField]?.toString() || '';
        const bValue = b[sortField]?.toString() || '';
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
    });
    
    setSortedGiftcards(sorted);
  }, [giftcards, sortField, sortDirection]);
  
  const handleSort = (field: keyof Giftcard) => {
    setSortDirection(current => 
      field === sortField 
        ? current === 'asc' ? 'desc' : 'asc' 
        : 'asc'
    );
    setSortField(field);
  };
  
  const viewDetails = (id: string) => {
    navigate(`/giftcards/${id}`);
  };

  const handleDelete = async (giftcard: Giftcard) => {
    if (!user) return;

    if (confirm(`¿Estás seguro que deseas eliminar permanentemente la tarjeta ${giftcard.number}? Esta acción no se puede deshacer.`)) {
      setDeletingId(giftcard.id);
      try {
        await deleteGiftcard(giftcard.id);
        await logActivity({
          userId: user.id,
          username: user.username,
          action: 'deleted',
          targetType: 'giftcard',
          targetId: giftcard.id,
          details: `Eliminó permanentemente la tarjeta ${giftcard.number}`
        });
        
        toast.success('Tarjeta eliminada permanentemente');
      } catch (error) {
        console.error('Error deleting giftcard:', error);
        toast.error('Error al eliminar la tarjeta');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleStatusChange = (giftcard: Giftcard) => {
    setSelectedGiftcard(giftcard);
  };

  const handleStatusChangeComplete = () => {
    setSelectedGiftcard(null);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin-slow w-12 h-12 border-b-2 border-primary-600 rounded-full"></div>
      </div>
    );
  }
  
  if (sortedGiftcards.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">{t('giftcards.search.noResults')}</p>
      </div>
    );
  }

  if (selectedGiftcard) {
    return (
      <GiftcardStatusChange
        giftcard={selectedGiftcard}
        onComplete={handleStatusChangeComplete}
      />
    );
  }
  
  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('number')}
            >
              <div className="flex items-center space-x-1">
                <span>{t('giftcards.number')}</span>
                {sortField === 'number' && (
                  <ArrowUpDown className="h-4 w-4" />
                )}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center space-x-1">
                <span>{t('common.status')}</span>
                {sortField === 'status' && (
                  <ArrowUpDown className="h-4 w-4" />
                )}
              </div>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('giftcards.buyer')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('giftcards.recipient')}
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('amount')}
            >
              <div className="flex items-center space-x-1">
                <span>{t('giftcards.amount')}</span>
                {sortField === 'amount' && (
                  <ArrowUpDown className="h-4 w-4" />
                )}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('createdAt')}
            >
              <div className="flex items-center space-x-1">
                <span>{t('giftcards.creationDate')}</span>
                {sortField === 'createdAt' && (
                  <ArrowUpDown className="h-4 w-4" />
                )}
              </div>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('giftcards.expirationDate')}
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">{t('common.actions')}</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {sortedGiftcards.map((giftcard) => {
            const daysLeft = daysUntilExpiration(giftcard.expiresAt);
            const isExpiringSoon = daysLeft !== null && daysLeft > 0 && isAboutToExpire(giftcard.expiresAt);
            const isExpired = daysLeft !== null && daysLeft <= 0;
            
            return (
              <tr key={giftcard.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {giftcard.number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <StatusBadge status={giftcard.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  <div>{giftcard.buyer.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{giftcard.buyer.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  <div>{giftcard.recipient.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{giftcard.recipient.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {formatCurrency(giftcard.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {formatDate(giftcard.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {giftcard.expiresAt ? (
                    <div>
                      <div className={cn(
                        isExpired ? 'text-error-600 dark:text-error-400' : 
                        isExpiringSoon ? 'text-warning-600 dark:text-warning-400' : 
                        'text-gray-700 dark:text-gray-300'
                      )}>
                        {formatDate(giftcard.expiresAt)}
                      </div>
                      {daysLeft !== null && (
                        <div className="text-xs mt-1">
                          {daysLeft > 0 ? (
                            <span 
                              className={cn(
                                isExpiringSoon ? 'text-warning-600 dark:text-warning-400 font-medium' : 'text-gray-500 dark:text-gray-400'
                              )}
                            >
                              {daysLeft} {t('giftcards.daysLeft')}
                            </span>
                          ) : (
                            <span className="text-error-600 dark:text-error-400 font-medium">
                              {t('giftcards.expired')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Eye className="h-4 w-4" />}
                      onClick={() => viewDetails(giftcard.id)}
                    >
                      Ver detalles
                    </Button>

                    {(giftcard.status === 'created_not_delivered' || giftcard.status === 'delivered') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Edit className="h-4 w-4" />}
                        onClick={() => handleStatusChange(giftcard)}
                      >
                        Cambiar estado
                      </Button>
                    )}

                    {user?.role === 'superadmin' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-error-600 hover:text-error-800 dark:text-error-400 dark:hover:text-error-300"
                        leftIcon={<Trash className="h-4 w-4" />}
                        onClick={() => handleDelete(giftcard)}
                        isLoading={deletingId === giftcard.id}
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default GiftcardList;