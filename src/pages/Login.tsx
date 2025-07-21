import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Gift } from 'lucide-react';
import ContactFooter from '../components/layout/ContactFooter';
import { login } from '../lib/auth';
import { useAuthStore } from '../stores/authStore';
import { useActivityStore } from '../stores/activityStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

interface LoginFormValues {
  usernameOrEmail: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { login: loginStore } = useAuthStore();
  const { logActivity } = useActivityStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>();
  
  const onSubmit = async (data: LoginFormValues) => {
    console.log('🚀 Iniciando submit del formulario...');
    setIsLoading(true);
    
    try {
      console.log('📝 Datos del formulario:', data);
      
      const result = await login(data);
      
      if (result) {
        console.log('✅ Login exitoso, guardando en store...');
        
        // Guardar en el store de autenticación
        loginStore(result.user, result.token);
        
        // Log de actividad
        try {
          await logActivity({
            userId: result.user.id,
            username: result.user.username,
            action: 'login',
            targetType: 'system',
            details: `${result.user.username} (${result.user.role}) inició sesión en el sistema`
          });
        } catch (activityError) {
          console.warn('⚠️ Error al registrar actividad:', activityError);
          // No fallar el login por un error de logging
        }
        
        toast.success('¡Bienvenido de nuevo!');
        console.log('🎯 Navegando al dashboard...');
        navigate('/dashboard');
      } else {
        console.log('❌ Login fallido');
        toast.error('Usuario o contraseña incorrectos. Verifique sus credenciales.');
      }
    } catch (error) {
      console.error('💥 Error en login:', error);
      toast.error('Error al iniciar sesión. Por favor intenta de nuevo.');
    } finally {
      console.log('🏁 Finalizando proceso de login...');
      setIsLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Gift className="mx-auto h-16 w-16 text-primary-600 dark:text-primary-400" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Sistema de Giftcards
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Panel de Administración
          </p>
          <div className="mt-2">
            <Link
              to="/"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline text-sm mr-4"
            >
              ← Volver al inicio
            </Link>
            <Link
              to="/buscar"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline text-sm"
            >
              Consulta pública de giftcards →
            </Link>
          </div>
        </div>
        
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="Usuario o Email"
                placeholder="Ingrese su usuario o email"
                {...register('usernameOrEmail', { required: 'Este campo es obligatorio' })}
                error={errors.usernameOrEmail?.message}
                autoComplete="username"
                disabled={isLoading}
              />
              
              <Input
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingrese su contraseña"
                {...register('password', { required: 'Este campo es obligatorio' })}
                error={errors.password?.message}
                autoComplete="current-password"
                disabled={isLoading}
                rightAdornment={
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="focus:outline-none"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                }
              />
              
              <div>
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
                </Button>
              </div>
            </form>
            
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  disabled={isLoading}
                >
                  {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                </button>
              </div>
              
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  disabled={isLoading}
                >
                  {i18n.language === 'es' ? 'English' : 'Español'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ContactFooter />
    </div>
  );
};

export default Login;