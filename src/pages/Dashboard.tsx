import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CreditCard, AlertCircle, TicketCheck, Users, Gift, Clock, ChevronRight, Plus, Settings, Mail } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import ActivityList from '../components/giftcards/ActivityList';
import GiftcardList from '../components/giftcards/GiftcardList';
import { useGiftcardStore } from '../stores/giftcardStore';
import { useActivityStore } from '../stores/activityStore';
import { useAuthStore } from '../stores/authStore';
import { daysUntilExpiration, formatDate } from '../lib/utils';
import { Giftcard } from '../types';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { giftcards, fetchGiftcards, applyFilters, loading } = useGiftcardStore();
  const { recentActivities, fetchRecentActivities } = useActivityStore();
  const [stats, setStats] = useState({
    activeCards: 0,
    expiringSoon: 0,
    totalCards: 0,
    pendingDelivery: 0
  });
  
  const [activeGiftcards, setActiveGiftcards] = useState<Giftcard[]>([]);
  const [pendingGiftcards, setPendingGiftcards] = useState<Giftcard[]>([]);
  const [expiringGiftcards, setExpiringGiftcards] = useState<Giftcard[]>([]);
  
  useEffect(() => {
    console.log('🏠 Inicializando Dashboard...');
    
    const initializeDashboard = async () => {
      try {
        await Promise.all([
          fetchGiftcards(),
          fetchRecentActivities(5)
        ]);
        console.log('✅ Dashboard inicializado correctamente');
      } catch (error) {
        console.error('❌ Error inicializando Dashboard:', error);
      }
    };
    
    initializeDashboard();
  }, [fetchGiftcards, fetchRecentActivities]);
  
  useEffect(() => {
    if (giftcards.length > 0) {
      console.log('📊 Calculando estadísticas del dashboard...');
      
      // Filtrar tarjetas activas (creadas pero no entregadas y entregadas)
      const active = giftcards.filter(g => 
        g.status === 'created_not_delivered' || g.status === 'delivered'
      );
      setActiveGiftcards(active);
      
      // Filtrar tarjetas pendientes de entrega
      const pending = giftcards.filter(g => g.status === 'created_not_delivered');
      setPendingGiftcards(pending);
      
      // Filtrar tarjetas por vencer en los próximos 30 días
      const expiring = giftcards.filter(g => {
        if (g.status !== 'delivered' || !g.expiresAt) return false;
        const daysLeft = daysUntilExpiration(g.expiresAt);
        return daysLeft !== null && daysLeft > 0 && daysLeft <= 30;
      });
      setExpiringGiftcards(expiring);
      
      const newStats = {
        activeCards: active.length,
        expiringSoon: expiring.length,
        totalCards: giftcards.length,
        pendingDelivery: pending.length
      };
      
      console.log('📈 Estadísticas calculadas:', newStats);
      setStats(newStats);
    }
  }, [giftcards]);

  const handleActiveCardsClick = () => {
    console.log('🔍 Navegando a tarjetas activas');
    applyFilters({ 
      status: undefined // Limpiamos el filtro de estado para mostrar ambos tipos
    });
    navigate('/giftcards');
  };

  const handleCardClick = (status: string) => {
    console.log('🔍 Navegando a tarjetas con estado:', status);
    applyFilters({ status });
    navigate('/giftcards');
  };
  
  if (loading && giftcards.length === 0) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin w-12 h-12 border-b-2 border-primary-600 rounded-full"></div>
        <p className="ml-4 text-gray-600 dark:text-gray-400">Cargando panel de control...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.title')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Bienvenido de nuevo, {user?.username}
          </p>
        </div>
        
        {user?.role === 'superadmin' && (
          <div className="flex space-x-3">
            <Button
              variant="outline"
              leftIcon={<Mail className="h-5 w-5" />}
              onClick={() => navigate('/mensajes')}
            >
              Mensajes
            </Button>
            <Button
              leftIcon={<Plus className="h-5 w-5" />}
              onClick={() => navigate('/giftcards/crear')}
            >
              {t('dashboard.createGiftcard')}
            </Button>
          </div>
        )}
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className="bg-gradient-to-br from-primary-500 to-primary-600 text-white hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer" 
          onClick={handleActiveCardsClick}
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="bg-white/20 p-3 rounded-lg">
                <CreditCard className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                Ver todas
              </span>
            </div>
            <div className="mt-4">
              <p className="text-4xl font-bold">{stats.activeCards}</p>
              <p className="mt-1 text-primary-100">{t('dashboard.activeGiftcards')}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="bg-gradient-to-br from-warning-500 to-warning-600 text-white hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer" 
          onClick={() => handleCardClick('delivered')}
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="bg-white/20 p-3 rounded-lg">
                <AlertCircle className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                Ver todas
              </span>
            </div>
            <div className="mt-4">
              <p className="text-4xl font-bold">{stats.expiringSoon}</p>
              <p className="mt-1 text-warning-100">{t('dashboard.expiringSoon')}</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-accent-500 to-accent-600 text-white hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer" 
          onClick={() => handleCardClick('created_not_delivered')}
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="bg-white/20 p-3 rounded-lg">
                <Clock className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                Ver todas
              </span>
            </div>
            <div className="mt-4">
              <p className="text-4xl font-bold">{stats.pendingDelivery}</p>
              <p className="mt-1 text-accent-100">Pendientes de entrega</p>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="bg-gradient-to-br from-secondary-500 to-secondary-600 text-white hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer"
          onClick={() => navigate('/giftcards')}
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="bg-white/20 p-3 rounded-lg">
                <TicketCheck className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                Ver todas
              </span>
            </div>
            <div className="mt-4">
              <p className="text-4xl font-bold">{stats.totalCards}</p>
              <p className="mt-1 text-secondary-100">{t('dashboard.totalGiftcards')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tarjetas activas */}
      {activeGiftcards.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Tarjetas activas
              </h2>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-primary-600 dark:text-primary-400"
                onClick={handleActiveCardsClick}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Ver todas
              </Button>
            </div>
            <GiftcardList giftcards={activeGiftcards.slice(0, 5)} />
          </CardContent>
        </Card>
      )}

      {/* Tarjetas pendientes de entrega */}
      {pendingGiftcards.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Tarjetas pendientes de entrega
              </h2>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-primary-600 dark:text-primary-400"
                onClick={() => handleCardClick('created_not_delivered')}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Ver todas
              </Button>
            </div>
            <GiftcardList giftcards={pendingGiftcards.slice(0, 5)} />
          </CardContent>
        </Card>
      )}

      {/* Tarjetas por vencer */}
      {expiringGiftcards.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Tarjetas por vencer (próximos 30 días)
              </h2>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-primary-600 dark:text-primary-400"
                onClick={() => handleCardClick('delivered')}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Ver todas
              </Button>
            </div>
            <GiftcardList giftcards={expiringGiftcards.slice(0, 5)} />
          </CardContent>
        </Card>
      )}
      
      {/* Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('dashboard.recentActivity')}
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-primary-600 dark:text-primary-400"
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  {t('dashboard.viewAll')}
                </Button>
              </div>
              
              <ActivityList 
                activities={recentActivities} 
                showHeader={false}
                limit={5}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {t('dashboard.quickActions')}
              </h2>
              
              <div className="space-y-3">
                {user?.role === 'superadmin' && (
                  <Button
                    leftIcon={<Gift className="h-5 w-5" />}
                    className="w-full justify-start"
                    onClick={() => navigate('/giftcards/crear')}
                  >
                    {t('dashboard.createGiftcard')}
                  </Button>
                )}
                
                <Button
                  leftIcon={<CreditCard className="h-5 w-5" />}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/giftcards')}
                >
                  {t('giftcards.title')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;