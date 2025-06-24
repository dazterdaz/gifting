import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, CreditCard, Mail, Phone } from 'lucide-react';
import { GiftcardSearchFilters } from '../../types';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

interface SearchFiltersProps {
  onSearch: (filters: GiftcardSearchFilters) => void;
  onClear: () => void;
  initialStatus?: string;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, onClear, initialStatus }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<GiftcardSearchFilters>({
    status: initialStatus
  });
  
  const handleInputChange = (key: keyof GiftcardSearchFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };
  
  const handleClear = () => {
    setFilters({ status: initialStatus });
    onClear();
  };
  
  const statusOptions = [
    { value: '', label: t('giftcards.search.byStatus') },
    { value: 'created_not_delivered', label: t('giftcards.status.created_not_delivered') },
    { value: 'delivered', label: t('giftcards.status.delivered') },
    { value: 'redeemed', label: t('giftcards.status.redeemed') },
    { value: 'cancelled', label: t('giftcards.status.cancelled') }
  ];
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder={t('giftcards.search.byNumber')}
            value={filters.number || ''}
            onChange={e => handleInputChange('number', e.target.value)}
            leftAdornment={<CreditCard className="h-5 w-5 text-gray-400" />}
          />
          
          <Input
            placeholder={t('giftcards.search.byEmail')}
            value={filters.email || ''}
            onChange={e => handleInputChange('email', e.target.value)}
            leftAdornment={<Mail className="h-5 w-5 text-gray-400" />}
          />
          
          <Input
            placeholder={t('giftcards.search.byPhone')}
            value={filters.phone || ''}
            onChange={e => handleInputChange('phone', e.target.value)}
            leftAdornment={<Phone className="h-5 w-5 text-gray-400" />}
          />
          
          <Select
            options={statusOptions}
            value={filters.status || ''}
            onChange={value => handleInputChange('status', value)}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            leftIcon={<X className="h-4 w-4" />}
          >
            {t('common.cancel')}
          </Button>
          
          <Button
            type="submit"
            leftIcon={<Search className="h-4 w-4" />}
          >
            {t('common.search')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SearchFilters;