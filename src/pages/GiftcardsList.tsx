import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Download } from 'lucide-react';
import Button from '../components/ui/Button';
import GiftcardTabs from '../components/giftcards/GiftcardTabs';
import GiftcardList from '../components/giftcards/GiftcardList';
import SearchFilters from '../components/giftcards/SearchFilters';
import { GiftcardStatus, GiftcardSearchFilters } from '../types';
import { useGiftcardStore } from '../stores/giftcardStore';
import { useAuthStore } from '../stores/authStore';
import { exportToPDF, exportToCSV } from '../lib/utils';

const GiftcardsList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    giftcards, 
    filteredGiftcards, 
    loading, 
    fetchGiftcards, 
    applyFilters, 
    clearFilters 
  } = useGiftcardStore();
  
  const [activeTab, setActiveTab] = useState<GiftcardStatus | 'disabled'>('created_not_delivered');
  const [displayedGiftcards, setDisplayedGiftcards] = useState(filteredGiftcards);
  
  useEffect(() => {
    const loadGiftcards = async () => {
      console.log('📋 Cargando lista de giftcards...');
      await fetchGiftcards();
    };
    
    loadGiftcards();
  }, []);
  
  useEffect(() => {
    // Filter giftcards based on the active tab
    let tabFiltered = [...filteredGiftcards];
    
    if (activeTab === 'disabled') {
      tabFiltered = tabFiltered.filter(g => g.status === 'redeemed' || g.status === 'cancelled');
    } else {
      tabFiltered = tabFiltered.filter(g => g.status === activeTab);
    }
    
    setDisplayedGiftcards(tabFiltered);
  }, [filteredGiftcards, activeTab]);
  
  const handleTabChange = (tab: GiftcardStatus | 'disabled') => {
    setActiveTab(tab);
    clearFilters(); // Clear any existing filters when changing tabs
  };
  
  const handleSearch = (filters: GiftcardSearchFilters) => {
    // Si hay un estado activo en el tab, lo mantenemos
    if (activeTab !== 'disabled') {
      filters.status = activeTab;
    }
    applyFilters(filters);
  };
  
  const handleExportPDF = () => {
    exportToPDF(displayedGiftcards, i18n.language);
  };
  
  const handleExportCSV = () => {
    exportToCSV(displayedGiftcards, i18n.language);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('giftcards.title')}
        </h1>
        
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={handleExportPDF}
            >
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={handleExportCSV}
            >
              CSV
            </Button>
          </div>
          
          {user?.role === 'superadmin' && (
            <Button 
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => navigate('/giftcards/crear')}
            >
              {t('giftcards.createNew')}
            </Button>
          )}
        </div>
      </div>
      
      <GiftcardTabs 
        onTabChange={handleTabChange} 
        initialTab={activeTab === 'created_not_delivered' ? 0 : activeTab === 'delivered' ? 1 : 2} 
      />
      
      <SearchFilters onSearch={handleSearch} onClear={clearFilters} />
      
      <GiftcardList giftcards={displayedGiftcards} loading={loading} />
    </div>
  );
};

export default GiftcardsList;