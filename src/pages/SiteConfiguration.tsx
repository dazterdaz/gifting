import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Plus, Trash, Edit, Home } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useSettingsStore } from '../stores/settingsStore';
import { useAuthStore } from '../stores/authStore';
import { useActivityStore } from '../stores/activityStore';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  avatar: string;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

const SiteConfiguration = () => {
  const { t } = useTranslation();
  const { settings, updateSettings } = useSettingsStore();
  const { user } = useAuthStore();
  const { logActivity } = useActivityStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    phone: '+56 9 1234 5678',
    whatsapp: '+56 9 1234 5678',
    email: 'contacto@daztattoo.cl',
    address: 'Santiago, Chile'
  });
  
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: '1',
      name: 'María González',
      text: '¡Increíble experiencia! El regalo perfecto para mi hermana. El proceso fue súper fácil.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: '2',
      name: 'Carlos Ruiz',
      text: 'Regalé una giftcard para un tatuaje y quedó espectacular. Muy profesionales.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: '3',
      name: 'Ana López',
      text: 'El mejor regalo que he recibido. Mi piercing quedó perfecto y el trato fue excelente.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150'
    }
  ]);
  
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { id: '1', platform: 'Instagram', url: 'https://instagram.com/daztattoo', icon: 'instagram' },
    { id: '2', platform: 'Facebook', url: 'https://facebook.com/daztattoo', icon: 'facebook' },
    { id: '3', platform: 'WhatsApp', url: 'https://wa.me/56912345678', icon: 'whatsapp' }
  ]);
  
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [editingSocialLink, setEditingSocialLink] = useState<SocialLink | null>(null);

  useEffect(() => {
    // Cargar configuración existente si está disponible
    if (settings.contactInfo) {
      setContactInfo(settings.contactInfo);
    }
    if (settings.testimonials) {
      setTestimonials(settings.testimonials);
    }
    if (settings.socialLinks) {
      setSocialLinks(settings.socialLinks);
    }
  }, [settings]);

  const handleSaveContactInfo = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      await updateSettings({ contactInfo });
      
      await logActivity({
        userId: user.id,
        username: user.username,
        action: 'updated',
        targetType: 'system',
        details: 'Actualizó la información de contacto del sitio'
      });
      
      toast.success('Información de contacto actualizada correctamente');
    } catch (error) {
      toast.error('Error al actualizar la información de contacto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveTestimonials = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      await updateSettings({ testimonials });
      
      await logActivity({
        userId: user.id,
        username: user.username,
        action: 'updated',
        targetType: 'system',
        details: 'Actualizó los testimonios del sitio'
      });
      
      toast.success('Testimonios actualizados correctamente');
    } catch (error) {
      toast.error('Error al actualizar los testimonios');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSocialLinks = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      await updateSettings({ socialLinks });
      
      await logActivity({
        userId: user.id,
        username: user.username,
        action: 'updated',
        targetType: 'system',
        details: 'Actualizó los enlaces de redes sociales'
      });
      
      toast.success('Enlaces de redes sociales actualizados correctamente');
    } catch (error) {
      toast.error('Error al actualizar los enlaces');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: Math.random().toString(36).substring(2, 11),
      name: '',
      text: '',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
    };
    setEditingTestimonial(newTestimonial);
  };

  const saveTestimonial = () => {
    if (!editingTestimonial) return;
    
    if (testimonials.find(t => t.id === editingTestimonial.id)) {
      setTestimonials(prev => prev.map(t => t.id === editingTestimonial.id ? editingTestimonial : t));
    } else {
      setTestimonials(prev => [...prev, editingTestimonial]);
    }
    
    setEditingTestimonial(null);
  };

  const deleteTestimonial = (id: string) => {
    if (confirm('¿Estás seguro que deseas eliminar este testimonio?')) {
      setTestimonials(prev => prev.filter(t => t.id !== id));
    }
  };

  const addSocialLink = () => {
    const newLink: SocialLink = {
      id: Math.random().toString(36).substring(2, 11),
      platform: '',
      url: '',
      icon: 'link'
    };
    setEditingSocialLink(newLink);
  };

  const saveSocialLink = () => {
    if (!editingSocialLink) return;
    
    if (socialLinks.find(l => l.id === editingSocialLink.id)) {
      setSocialLinks(prev => prev.map(l => l.id === editingSocialLink.id ? editingSocialLink : l));
    } else {
      setSocialLinks(prev => [...prev, editingSocialLink]);
    }
    
    setEditingSocialLink(null);
  };

  const deleteSocialLink = (id: string) => {
    if (confirm('¿Estás seguro que deseas eliminar este enlace?')) {
      setSocialLinks(prev => prev.filter(l => l.id !== id));
    }
  };

  if (user?.role !== 'superadmin') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          No tienes permisos para acceder a esta página
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <Home className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configuración del Sitio Web
        </h1>
      </div>

      {/* Información de Contacto */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Teléfono"
              value={contactInfo.phone}
              onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+56 9 1234 5678"
            />
            
            <Input
              label="WhatsApp"
              value={contactInfo.whatsapp}
              onChange={(e) => setContactInfo(prev => ({ ...prev, whatsapp: e.target.value }))}
              placeholder="+56 9 1234 5678"
            />
            
            <Input
              label="Email"
              type="email"
              value={contactInfo.email}
              onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
              placeholder="contacto@daztattoo.cl"
            />
            
            <Input
              label="Dirección"
              value={contactInfo.address}
              onChange={(e) => setContactInfo(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Santiago, Chile"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSaveContactInfo}
            isLoading={isSubmitting}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Guardar Información de Contacto
          </Button>
        </CardFooter>
      </Card>

      {/* Testimonios */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lo que dicen nuestros clientes</CardTitle>
            <Button
              onClick={addTestimonial}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Agregar Testimonio
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 className="font-medium">{testimonial.name}</h4>
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingTestimonial(testimonial)}
                    leftIcon={<Edit className="h-4 w-4" />}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTestimonial(testimonial.id)}
                    leftIcon={<Trash className="h-4 w-4" />}
                    className="text-error-600 hover:text-error-700"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.text}"</p>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSaveTestimonials}
            isLoading={isSubmitting}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Guardar Testimonios
          </Button>
        </CardFooter>
      </Card>

      {/* Enlaces de Redes Sociales */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Enlaces de Redes Sociales</CardTitle>
            <Button
              onClick={addSocialLink}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Agregar Enlace
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {socialLinks.map((link) => (
            <div key={link.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{link.platform}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{link.url}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingSocialLink(link)}
                    leftIcon={<Edit className="h-4 w-4" />}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSocialLink(link.id)}
                    leftIcon={<Trash className="h-4 w-4" />}
                    className="text-error-600 hover:text-error-700"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSaveSocialLinks}
            isLoading={isSubmitting}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Guardar Enlaces
          </Button>
        </CardFooter>
      </Card>

      {/* Modal para editar testimonio */}
      {editingTestimonial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              {testimonials.find(t => t.id === editingTestimonial.id) ? 'Editar' : 'Agregar'} Testimonio
            </h3>
            
            <div className="space-y-4">
              <Input
                label="Nombre"
                value={editingTestimonial.name}
                onChange={(e) => setEditingTestimonial(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
              
              <Input
                label="Testimonio"
                as="textarea"
                rows={3}
                value={editingTestimonial.text}
                onChange={(e) => setEditingTestimonial(prev => prev ? { ...prev, text: e.target.value } : null)}
              />
              
              <Input
                label="Calificación (1-5)"
                type="number"
                min="1"
                max="5"
                value={editingTestimonial.rating}
                onChange={(e) => setEditingTestimonial(prev => prev ? { ...prev, rating: parseInt(e.target.value) } : null)}
              />
              
              <Input
                label="URL del Avatar"
                value={editingTestimonial.avatar}
                onChange={(e) => setEditingTestimonial(prev => prev ? { ...prev, avatar: e.target.value } : null)}
              />
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setEditingTestimonial(null)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={saveTestimonial}
                className="flex-1"
              >
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar enlace social */}
      {editingSocialLink && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              {socialLinks.find(l => l.id === editingSocialLink.id) ? 'Editar' : 'Agregar'} Enlace
            </h3>
            
            <div className="space-y-4">
              <Input
                label="Plataforma"
                value={editingSocialLink.platform}
                onChange={(e) => setEditingSocialLink(prev => prev ? { ...prev, platform: e.target.value } : null)}
                placeholder="Instagram, Facebook, etc."
              />
              
              <Input
                label="URL"
                value={editingSocialLink.url}
                onChange={(e) => setEditingSocialLink(prev => prev ? { ...prev, url: e.target.value } : null)}
                placeholder="https://..."
              />
              
              <Input
                label="Icono"
                value={editingSocialLink.icon}
                onChange={(e) => setEditingSocialLink(prev => prev ? { ...prev, icon: e.target.value } : null)}
                placeholder="instagram, facebook, whatsapp, etc."
              />
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setEditingSocialLink(null)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={saveSocialLink}
                className="flex-1"
              >
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteConfiguration;