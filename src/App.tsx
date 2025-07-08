import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GiftcardsList from './pages/GiftcardsList';
import GiftcardDetails from './pages/GiftcardDetails';
import CreateGiftcard from './pages/CreateGiftcard';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import GlobalActivityPage from './pages/GlobalActivityPage';
import PublicSearch from './pages/PublicSearch';
import LandingPage from './pages/LandingPage';
import ContactMessages from './pages/ContactMessages';
import SiteConfiguration from './pages/SiteConfiguration';
import NotFound from './pages/NotFound';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext';
import { useAuthStore } from './stores/authStore';
import { useSettingsStore } from './stores/settingsStore';
import { useUserStore } from './stores/userStore';
import { initializeUser } from './lib/auth';
import { initializeFirebaseCollections, checkFirebaseConnection } from './lib/firebaseInit';
import toast from 'react-hot-toast';

function App() {
  const { i18n } = useTranslation();
  const { isAuthenticated, user } = useAuthStore();
  const { settings, fetchSettings } = useSettingsStore();
  const { fetchUsers } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('🚀 Inicializando aplicación...');
        
        // Inicializar usuario primero (no depende de Firebase)
        await initializeUser();
        
        // Luego inicializar Firebase en paralelo con configuración por defecto
        const initPromises = [
          // Configuración con fallback
          fetchSettings().catch(error => {
            console.warn('⚠️ Error cargando configuración, usando por defecto:', error);
            return Promise.resolve();
          }),
          
          // Usuarios con fallback
          fetchUsers().catch(error => {
            console.warn('⚠️ Error cargando usuarios, usando por defecto:', error);
            return Promise.resolve();
          }),
          
          // Firebase init en background (no bloquea la carga)
          Promise.resolve().then(async () => {
            try {
              const isConnected = await checkFirebaseConnection();
              if (isConnected) {
                await initializeFirebaseCollections();
                console.log('✅ Firebase inicializado correctamente');
              }
            } catch (error) {
              console.warn('⚠️ Firebase no disponible, continuando sin él:', error);
            }
          })
        ];
        
        // Esperar máximo 3 segundos para la inicialización
        await Promise.race([
          Promise.all(initPromises),
          new Promise(resolve => setTimeout(resolve, 3000))
        ]);

        console.log('✅ Aplicación inicializada correctamente');
        
      } catch (error) {
        console.error('❌ Error inicializando aplicación:', error);
        // No mostrar error crítico, la app puede funcionar sin Firebase
        console.log('🔄 Continuando con configuración local...');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [fetchSettings, fetchUsers]);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.title = settings.siteName;
  }, [i18n.language, settings.siteName]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-b-2 border-primary-600 rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Inicializando aplicación...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Routes>
        {/* Ruta principal - Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Rutas públicas */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/buscar" element={<PublicSearch />} />
        
        {/* Rutas protegidas del admin */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/giftcards" element={<GiftcardsList />} />
            <Route path="/giftcards/crear" element={user?.role === 'superadmin' ? <CreateGiftcard /> : <Navigate to="/dashboard" replace />} />
            <Route path="/giftcards/:id" element={<GiftcardDetails />} />
            <Route path="/usuarios" element={user?.role === 'superadmin' ? <UserManagement /> : <Navigate to="/dashboard" replace />} />
            <Route path="/mensajes" element={user?.role === 'superadmin' ? <ContactMessages /> : <Navigate to="/dashboard" replace />} />
            <Route path="/actividad" element={user?.role === 'superadmin' ? <GlobalActivityPage /> : <Navigate to="/dashboard" replace />} />
            <Route path="/configuracion-sitio" element={user?.role === 'superadmin' ? <SiteConfiguration /> : <Navigate to="/dashboard" replace />} />
            <Route path="/configuracion" element={user?.role === 'superadmin' ? <Settings /> : <Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;