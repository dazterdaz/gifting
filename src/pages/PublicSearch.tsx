import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ExternalLink, Gift, CheckCircle, FileText, Home } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import StatusBadge from '../components/ui/StatusBadge';
import { useGiftcardStore } from '../stores/giftcardStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useActivityStore } from '../stores/activityStore';
import { PublicGiftcardView } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const PublicSearch = () => {
  const { t } = useTranslation();
  const { getPublicGiftcardInfo, acceptTerms } = useGiftcardStore();
  const { settings, fetchSettings } = useSettingsStore();
  const { logActivity } = useActivityStore();
  
  const [giftcardNumber, setGiftcardNumber] = useState('');
  const [giftcardInfo, setGiftcardInfo] = useState<PublicGiftcardView | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showTerms, setShowTerms] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializePublicPage = async () => {
      console.log('🌐 Inicializando página pública...');
      setIsLoading(true);
      
      try {
        await fetchSettings();
        console.log('✅ Página pública inicializada');
      } catch (error) {
        console.error('❌ Error inicializando página pública:', error);
        toast.error('Error al cargar la página');
      } finally {
        setIsLoading(false);
      }
    };

    initializePublicPage();
  }, [fetchSettings]);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 Iniciando búsqueda pública...');
    console.log('Términos aceptados:', termsAccepted);
    console.log('Número ingresado:', giftcardNumber);
    
    if (!termsAccepted) {
      toast.error('Debe aceptar los términos y condiciones primero');
      return;
    }
    
    if (!giftcardNumber.trim()) {
      toast.error('Por favor ingrese un número de tarjeta');
      return;
    }
    
    setIsSearching(true);
    setGiftcardInfo(null);
    setNotFound(false);
    
    try {
      console.log('🔍 Buscando tarjeta:', giftcardNumber.trim());
      
      const info = await getPublicGiftcardInfo(giftcardNumber.trim());
      
      if (info) {
        console.log('✅ Tarjeta encontrada:', info);
        setGiftcardInfo(info);
        
        // Registrar aceptación de términos
        try {
          await acceptTerms(giftcardNumber.trim());
          await logActivity({
            userId: 'public',
            username: 'Consulta Pública',
            action: 'terms_accepted',
            targetType: 'giftcard',
            targetId: info.number,
            details: `Términos y condiciones aceptados para consulta de giftcard ${info.number}`
          });
        } catch (termsError) {
          console.warn('⚠️ Error registrando términos:', termsError);
          // No fallar la búsqueda por esto
        }
        
        toast.success('¡Tarjeta encontrada!');
      } else {
        console.log('❌ Tarjeta no encontrada');
        setNotFound(true);
        toast.error('Tarjeta de regalo no encontrada');
      }
    } catch (error) {
      console.error('💥 Error en búsqueda:', error);
      setNotFound(true);
      toast.error('Error al consultar la tarjeta. Intente nuevamente.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAcceptTerms = async () => {
    console.log('📋 Aceptando términos y condiciones...');
    setShowTerms(false);
    setTermsAccepted(true);
    toast.success('Términos aceptados. Ahora puede consultar su tarjeta de regalo.');
  };

  const handleNewSearch = () => {
    console.log('🔄 Nueva búsqueda');
    setGiftcardNumber('');
    setGiftcardInfo(null);
    setNotFound(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-b-2 border-primary-600 rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando consulta pública...
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Botón para volver al inicio */}
      <Link
        to="/"
        className="fixed top-4 left-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-3 shadow-lg transition-colors z-40"
        title="Volver al inicio"
      >
        <Home className="h-5 w-5" />
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src={settings.logoUrl} 
            alt="Logo" 
            className="mx-auto h-16 w-16"
            onError={(e) => {
              e.currentTarget.src = '/logo.svg';
            }}
          />
          <h1 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
            Sistema de Giftcards
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('giftcards.public.title')}
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              {t('giftcards.public.title')}
            </CardTitle>
          </CardHeader>
          
          {showTerms && settings.terms ? (
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-medium text-blue-900 dark:text-blue-100">
                    Términos y Condiciones
                  </h3>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-h-48 overflow-y-auto prose dark:prose-invert prose-sm">
                  <div dangerouslySetInnerHTML={{ __html: settings.terms.content }} />
                </div>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>📋 Importante:</strong> Para consultar su tarjeta de regalo, debe leer y aceptar los términos y condiciones.
                </p>
              </div>
              
              <Button
                onClick={handleAcceptTerms}
                className="w-full"
                leftIcon={<CheckCircle className="h-4 w-4" />}
              >
                He leído y acepto los términos y condiciones
              </Button>
            </CardContent>
          ) : (
            <form onSubmit={handleSearch}>
              <CardContent className="space-y-4">
                {termsAccepted && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <p className="text-sm text-green-800 dark:text-green-200">
                        <strong>✅ Términos aceptados.</strong> Ahora puede consultar su tarjeta de regalo.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Número de tarjeta de regalo
                  </label>
                  <Input
                    placeholder="Ej: 12345678"
                    value={giftcardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // Solo números
                      if (value.length <= 8) {
                        setGiftcardNumber(value);
                      }
                    }}
                    leftAdornment={<Gift className="h-5 w-5 text-gray-400" />}
                    disabled={isSearching}
                    maxLength={8}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Ingrese el número de 8 dígitos de su tarjeta de regalo
                  </p>
                </div>
                
                {giftcardInfo && (
                  <div className="mt-6 space-y-4 bg-primary-50 dark:bg-primary-900/30 p-4 rounded-md border border-primary-100 dark:border-primary-800">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-primary-900 dark:text-primary-100">
                        {t('giftcards.public.result.title')}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNewSearch}
                      >
                        Nueva consulta
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('giftcards.number')}</span>
                        <span className="font-mono font-medium text-gray-900 dark:text-white">{giftcardInfo.number}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('giftcards.public.result.status')}</span>
                        <StatusBadge status={giftcardInfo.status} />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('giftcards.public.result.amount')}</span>
                        <span className="font-bold text-lg text-gray-900 dark:text-white">{formatCurrency(giftcardInfo.amount)}</span>
                      </div>
                      
                      {giftcardInfo.deliveredAt && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{t('giftcards.public.result.deliveryDate')}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{formatDate(giftcardInfo.deliveredAt)}</span>
                        </div>
                      )}
                      
                      {giftcardInfo.expiresAt && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{t('giftcards.public.result.expirationDate')}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{formatDate(giftcardInfo.expiresAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {notFound && (
                  <div className="mt-4 p-4 bg-error-50 dark:bg-error-900/30 rounded-md border border-error-100 dark:border-error-800 text-center">
                    <p className="text-error-600 dark:text-error-400 font-medium">
                      {t('giftcards.public.result.notFound')}
                    </p>
                    <p className="text-sm text-error-500 dark:text-error-400 mt-1">
                      Verifique que el número sea correcto e intente nuevamente
                    </p>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <a
                  href="/"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Volver al inicio
                </a>
                
                <Button 
                  type="submit" 
                  isLoading={isSearching}
                  leftIcon={<Search className="h-4 w-4" />}
                  disabled={!giftcardNumber.trim() || isSearching}
                >
                  {isSearching ? 'Consultando...' : t('giftcards.public.checkStatus')}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>

        {/* Información adicional */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ¿Problemas con su consulta? Contacte directamente con el administrador
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicSearch;