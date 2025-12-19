import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ContactFooter from './ContactFooter';
import { useEffect } from 'react';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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
        
        <ContactFooter />
      </div>
    </div>
  );
};

export default Layout;