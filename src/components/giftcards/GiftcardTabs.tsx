import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab } from '@headlessui/react';
import { GiftcardStatus } from '../../types';
import { cn } from '../../lib/utils';

interface GiftcardTabsProps {
  onTabChange: (status: GiftcardStatus | 'disabled') => void;
  initialTab?: number;
}

const GiftcardTabs: React.FC<GiftcardTabsProps> = ({ onTabChange, initialTab = 0 }) => {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(initialTab);
  
  const handleTabChange = (index: number) => {
    setSelectedIndex(index);
    
    switch(index) {
      case 0:
        onTabChange('created_not_delivered');
        break;
      case 1:
        onTabChange('delivered');
        break;
      case 2:
        onTabChange('disabled');
        break;
      default:
        onTabChange('created_not_delivered');
    }
  };
  
  return (
    <div className="w-full">
      <Tab.Group selectedIndex={selectedIndex} onChange={handleTabChange}>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
          <Tab
            className={({ selected }) =>
              cn(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none',
                selected
                  ? 'bg-white dark:bg-gray-700 shadow text-primary-700 dark:text-primary-300'
                  : 'text-gray-700 dark:text-gray-400 hover:bg-white/[0.12] hover:text-primary-600 dark:hover:text-primary-400'
              )
            }
          >
            {t('giftcards.status.created_not_delivered')}
          </Tab>
          <Tab
            className={({ selected }) =>
              cn(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none',
                selected
                  ? 'bg-white dark:bg-gray-700 shadow text-primary-700 dark:text-primary-300'
                  : 'text-gray-700 dark:text-gray-400 hover:bg-white/[0.12] hover:text-primary-600 dark:hover:text-primary-400'
              )
            }
          >
            {t('giftcards.status.delivered')}
          </Tab>
          <Tab
            className={({ selected }) =>
              cn(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none',
                selected
                  ? 'bg-white dark:bg-gray-700 shadow text-primary-700 dark:text-primary-300'
                  : 'text-gray-700 dark:text-gray-400 hover:bg-white/[0.12] hover:text-primary-600 dark:hover:text-primary-400'
              )
            }
          >
            {t('giftcards.tabs.disabled')}
          </Tab>
        </Tab.List>
      </Tab.Group>
    </div>
  );
};

export default GiftcardTabs;