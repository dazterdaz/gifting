import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useTranslation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkSize();
    window.addEventListener('resize', checkSize);
    
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} isMobile={isMobile} closeSidebar={() => setIsSidebarOpen(false)} />
      
      {/* Mobile sidebar backdrop */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-10" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
        
        <footer className="p-4 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Daz Giftcard Register &copy; {new Date().getFullYear()} | {' '}
            <Link 
              to="/buscar" 
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline"
            >
              {t('giftcards.public.title')}
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;