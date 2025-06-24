import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CreditCard, LayoutDashboard, Users, X, Settings, Activity, Mail, Globe, Home } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import { useSettingsStore } from '../../stores/settingsStore';

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isMobile, closeSidebar }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  return (
    <aside 
      className={cn(
        'bg-primary-900 text-white w-64 flex-shrink-0 flex flex-col z-20 transition-all duration-300 ease-in-out',
        isMobile ? 'fixed inset-y-0 left-0 transform' : 'relative',
        isOpen ? 'translate-x-0' : isMobile ? '-translate-x-full' : 'w-0'
      )}
    >
      {isMobile && (
        <button
          className="absolute right-4 top-4 text-white focus:outline-none"
          onClick={closeSidebar}
        >
          <X className="h-6 w-6" />
        </button>
      )}
      
      <div className="p-4 flex items-center justify-center">
        <Link to="/dashboard" className="flex items-center space-x-2" onClick={isMobile ? closeSidebar : undefined}>
          <img src={settings.logoUrl} alt="Logo" className="h-8 w-8" onError={(e) => {
            e.currentTarget.src = '/logo.svg';
          }} />
          <h1 className="text-xl font-bold">{settings.siteName}</h1>
        </Link>
      </div>
      
      <div className="border-t border-primary-800 mt-4 pt-4">
        <nav className="flex-1 px-2 space-y-1">
          <Link
            to="/"
            className={cn(
              'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isActive('/')
                ? 'bg-primary-800 text-white'
                : 'text-primary-100 hover:bg-primary-800 hover:text-white'
            )}
            onClick={isMobile ? closeSidebar : undefined}
          >
            <Home className="mr-3 h-5 w-5" />
            Página Principal
          </Link>
          
          <Link
            to="/dashboard"
            className={cn(
              'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isActive('/dashboard')
                ? 'bg-primary-800 text-white'
                : 'text-primary-100 hover:bg-primary-800 hover:text-white'
            )}
            onClick={isMobile ? closeSidebar : undefined}
          >
            <LayoutDashboard className="mr-3 h-5 w-5" />
            {t('layout.sidebar.dashboard')}
          </Link>
          
          <Link
            to="/giftcards"
            className={cn(
              'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isActive('/giftcards')
                ? 'bg-primary-800 text-white'
                : 'text-primary-100 hover:bg-primary-800 hover:text-white'
            )}
            onClick={isMobile ? closeSidebar : undefined}
          >
            <CreditCard className="mr-3 h-5 w-5" />
            {t('layout.sidebar.giftcards')}
          </Link>
          
          {user?.role === 'superadmin' && (
            <>
              <Link
                to="/usuarios"
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive('/usuarios')
                    ? 'bg-primary-800 text-white'
                    : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                )}
                onClick={isMobile ? closeSidebar : undefined}
              >
                <Users className="mr-3 h-5 w-5" />
                {t('layout.sidebar.users')}
              </Link>

              <Link
                to="/mensajes"
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive('/mensajes')
                    ? 'bg-primary-800 text-white'
                    : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                )}
                onClick={isMobile ? closeSidebar : undefined}
              >
                <Mail className="mr-3 h-5 w-5" />
                Mensajes de Contacto
              </Link>

              <Link
                to="/actividad"
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive('/actividad')
                    ? 'bg-primary-800 text-white'
                    : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                )}
                onClick={isMobile ? closeSidebar : undefined}
              >
                <Activity className="mr-3 h-5 w-5" />
                Actividad Global
              </Link>

              <Link
                to="/configuracion-sitio"
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive('/configuracion-sitio')
                    ? 'bg-primary-800 text-white'
                    : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                )}
                onClick={isMobile ? closeSidebar : undefined}
              >
                <Globe className="mr-3 h-5 w-5" />
                Configuración Web
              </Link>

              <Link
                to="/configuracion"
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive('/configuracion')
                    ? 'bg-primary-800 text-white'
                    : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                )}
                onClick={isMobile ? closeSidebar : undefined}
              >
                <Settings className="mr-3 h-5 w-5" />
                {t('layout.sidebar.settings')}
              </Link>
            </>
          )}
        </nav>
      </div>
      
      <div className="p-4 border-t border-primary-800 mt-auto">
        <div className="flex flex-col space-y-2">
          <div className="text-xs text-primary-300 uppercase tracking-wider font-semibold mb-1">
            {user?.role === 'superadmin' ? 'Super Admin' : 'Administrador'}
          </div>
          <div className="text-sm font-medium">{user?.username}</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;