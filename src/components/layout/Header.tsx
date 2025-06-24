import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, Globe } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { logout } from '../../lib/auth';
import { useAuthStore } from '../../stores/authStore';
import Button from '../ui/Button';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsDropdownOpen(false);
      setIsLangDropdownOpen(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es');
  };
  
  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const toggleLangDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLangDropdownOpen(!isLangDropdownOpen);
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              onClick={toggleSidebar}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-full p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            {/* Language toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={toggleLangDropdown}
                className="rounded-full p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                <Globe className="h-5 w-5" />
              </button>
              
              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                  <div className="py-1" onClick={e => e.stopPropagation()}>
                    <button
                      className={`block px-4 py-2 text-sm w-full text-left ${
                        i18n.language === 'es' 
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => {
                        i18n.changeLanguage('es');
                        setIsLangDropdownOpen(false);
                      }}
                    >
                      {t('layout.header.spanish')}
                    </button>
                    <button
                      className={`block px-4 py-2 text-sm w-full text-left ${
                        i18n.language === 'en' 
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => {
                        i18n.changeLanguage('en');
                        setIsLangDropdownOpen(false);
                      }}
                    >
                      {t('layout.header.english')}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* User dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={toggleDropdown}
                className="flex rounded-full bg-primary-100 dark:bg-gray-700 text-sm focus:outline-none"
              >
                <span className="sr-only">{t('layout.header.profile')}</span>
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                  {user?.username.charAt(0).toUpperCase()}
                </div>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                  <div className="py-1" onClick={e => e.stopPropagation()}>
                    <div className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-medium">{user?.username}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                    <button
                      className="block px-4 py-2 text-sm text-error-600 dark:text-error-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                      onClick={handleLogout}
                    >
                      {t('auth.logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;