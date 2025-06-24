import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Save, Upload } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useSettingsStore } from '../../stores/settingsStore';
import { useActivityStore } from '../../stores/activityStore';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

interface SettingsFormData {
  siteName: string;
  logoUrl: string;
  logoColor: string;
}

const SiteSettings = () => {
  const { t } = useTranslation();
  const { settings, updateSettings, uploadLogo } = useSettingsStore();
  const { logActivity } = useActivityStore();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<SettingsFormData>({
    defaultValues: {
      siteName: settings.siteName,
      logoUrl: settings.logoUrl,
      logoColor: settings.logoColor
    }
  });

  const watchLogoColor = watch('logoColor');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Formato de archivo no soportado. Use JPG, PNG, GIF o SVG.');
      }

      if (file.size > 2 * 1024 * 1024) {
        throw new Error('El archivo es demasiado grande. Máximo 2MB.');
      }

      const logoUrl = await uploadLogo(file);
      updateSettings({ logoUrl });
      toast.success('Logo subido correctamente');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error(error instanceof Error ? error.message : 'Error al subir el logo');
    }
  };

  const onSubmit = async (data: SettingsFormData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      updateSettings(data);
      
      await logActivity({
        userId: user.id,
        username: user.username,
        action: 'updated',
        targetType: 'system',
        details: 'Actualizó la configuración del sitio'
      });
      
      toast.success('Configuración actualizada correctamente');
      
      document.title = data.siteName;
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Error al actualizar la configuración');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración del Sitio</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <Input
            label="Nombre del Sitio"
            {...register('siteName', { required: 'Este campo es requerido' })}
            error={errors.siteName?.message}
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Logo
            </label>
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant="outline"
                leftIcon={<Upload className="h-4 w-4" />}
                onClick={() => fileInputRef.current?.click()}
              >
                Subir Logo
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <span className="text-sm text-gray-500">
                Formatos soportados: JPG, PNG, GIF, SVG. Máximo 2MB.
              </span>
            </div>
          </div>

          <Input
            type="color"
            label="Color del Logo"
            {...register('logoColor')}
            error={errors.logoColor?.message}
          />
          
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Vista previa:
            </p>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <img
                src={settings.logoUrl}
                alt="Logo preview"
                className="h-12 w-auto"
                style={{ filter: `brightness(0) saturate(100%) ${settings.logoUrl === '/logo.svg' ? `invert(42%) sepia(93%) saturate(1352%) hue-rotate(227deg) brightness(90%) contrast(119%)` : ''}` }}
                onError={(e) => {
                  e.currentTarget.src = '/logo.svg';
                  toast.error('Error al cargar el logo');
                }}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button
            type="submit"
            isLoading={isSubmitting}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Guardar Cambios
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SiteSettings;