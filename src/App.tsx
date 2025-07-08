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
import { initializeFirebaseCollections } from './lib/firebaseInit';
import toast from 'react-hot-toast';

function App() {
  const { i18n } = useTranslation();
  const { isAuthenticated, user } = useAuthStore();
  const { settings, fetchSettings } = useSettingsStore();
  const { fetchUsers } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      console.log('🚀 Inicializando aplicación...');
      
      // Timeout de seguridad para evitar carga infinita
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ Timeout de inicialización alcanzado, continuando...');
        setIsLoading(false);
      }, 10000); // 10 segundos máximo
      
      try {
        // Inicializar Firebase primero
        console.log('🔥 Inicializando Firebase...');
        await Promise.race([
          initializeFirebaseCollections(),
          new Promise(resolve => setTimeout(() => {
            console.warn('⚠️ Timeout inicializando Firebase, continuando...');
            resolve(false);
          }, 5000))
        ]);
        
        // Inicializar en paralelo con timeouts individuales
        const initPromises = [
          // Inicializar usuario con timeout
          Promise.race([
            initializeUser(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout initializeUser')), 3000))
          ]).catch(error => {
            console.warn('⚠️ Error/timeout inicializando usuario:', error.message);
          }),
          
          // Cargar configuración con timeout
          Promise.race([
            fetchSettings(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout fetchSettings')), 3000))
          ]).catch(error => {
            console.warn('⚠️ Error/timeout cargando configuración:', error.message);
          }),
          
          // Cargar usuarios con timeout
          Promise.race([
            fetchUsers(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout fetchUsers')), 3000))
          ]).catch(error => {
            console.warn('⚠️ Error/timeout cargando usuarios:', error.message);
          })
        ];
        
        // Esperar máximo 5 segundos por todas las inicializaciones
        await Promise.race([
          Promise.all(initPromises),
          new Promise(resolve => setTimeout(resolve, 3000))
        ]);
        
        console.log('✅ Aplicación inicializada correctamente');
        
      } catch (error) {
        console.error('❌ Error inicializando aplicación:', error);
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

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
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
            Conectando con Firebase...
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