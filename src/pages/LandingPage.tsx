import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Gift, 
  Search, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Facebook, 
  Star,
  ChevronLeft,
  ChevronRight,
  Zap,
  Heart,
  Sparkles,
  Shield,
  Clock,
  Users,
  Settings,
  X,
  Send,
  Home
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { useSettingsStore } from '../stores/settingsStore';
import { useContactStore } from '../stores/contactStore';
import toast from 'react-hot-toast';

const LandingPage = () => {
  const { settings } = useSettingsStore();
  const { sendContactMessage } = useContactStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    whatsapp: '',
    email: ''
  });

  const slides = [
    {
      id: 1,
      title: "El Regalo Perfecto",
      subtitle: "Giftcards Daz Tattoo",
      description: "Regala una experiencia única de arte corporal con nuestras tarjetas de regalo",
      image: "https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=1200",
      color: "from-purple-600 to-pink-600"
    },
    {
      id: 2,
      title: "Arte y Profesionalismo",
      subtitle: "Tatuajes y Piercings de Calidad",
      description: "Nuestros artistas especializados crearán la obra perfecta para ti",
      image: "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=1200",
      color: "from-blue-600 to-purple-600"
    },
    {
      id: 3,
      title: "Fácil y Seguro",
      subtitle: "Sistema de Giftcards Digital",
      description: "Compra, consulta y usa tus giftcards de forma rápida y segura",
      image: "https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg?auto=compress&cs=tinysrgb&w=1200",
      color: "from-pink-600 to-red-600"
    }
  ];

  const features = [
    {
      icon: <Gift className="h-8 w-8" />,
      title: "Regalo Perfecto",
      description: "Ideal para cumpleaños, graduaciones o cualquier ocasión especial"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "100% Seguro",
      description: "Equipos esterilizados y protocolos de seguridad certificados"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Sin Vencimiento Rápido",
      description: "90 días para usar tu giftcard desde la fecha de entrega"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Artistas Profesionales",
      description: "Equipo de artistas con años de experiencia y reconocimiento"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.name || !contactForm.whatsapp || !contactForm.email) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendContactMessage({
        name: contactForm.name,
        whatsapp: contactForm.whatsapp,
        email: contactForm.email,
        message: 'Solicitud de información sobre giftcards'
      });

      toast.success('¡Mensaje enviado! Te contactaremos a la brevedad.');
      setContactForm({ name: '', whatsapp: '', email: '' });
      setShowContactForm(false);
    } catch (error) {
      toast.error('Error al enviar el mensaje. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCallToAction = () => {
    setShowContactForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="relative z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={settings.logoUrl} 
                alt="Logo" 
                className="h-10 w-10"
                onError={(e) => {
                  e.currentTarget.src = '/logo.svg';
                }}
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {settings.siteName}
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#inicio" className="hover:text-purple-400 transition-colors">Inicio</a>
              <a href="#giftcards" className="hover:text-purple-400 transition-colors">Giftcards</a>
              <a href="#consulta" className="hover:text-purple-400 transition-colors">Consultar</a>
              <a href="#terminos" className="hover:text-purple-400 transition-colors">Términos</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Slider */}
      <section id="inicio" className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="absolute inset-0 bg-black/50 z-10" />
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} opacity-60 z-20`} />
            </div>
          ))}
        </div>

        <div className="relative z-30 h-full flex items-center justify-center">
          <div className="text-center max-w-4xl mx-auto px-4">
            <div className="mb-6">
              <Sparkles className="h-16 w-16 mx-auto text-yellow-400 animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              {slides[currentSlide].title}
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-purple-200 font-medium">
              {slides[currentSlide].subtitle}
            </p>
            <p className="text-lg mb-8 text-gray-300 max-w-2xl mx-auto">
              {slides[currentSlide].description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold"
                leftIcon={<Phone className="h-5 w-5" />}
                onClick={handleCallToAction}
              >
                Contactar para Giftcard
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg"
                leftIcon={<Search className="h-5 w-5" />}
                onClick={() => document.getElementById('consulta')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Consultar Mi Giftcard
              </Button>
            </div>
          </div>
        </div>

        {/* Slider Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
          <div className="flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </section>

      {/* Giftcards Section */}
      <section id="giftcards" className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Giftcards
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Regala una experiencia única de arte corporal. Nuestras giftcards son el regalo perfecto 
              para quienes buscan expresarse a través del arte del tatuaje y piercing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 transform hover:-translate-y-2">
                <CardContent className="p-6 text-center">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-white">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-8 border border-purple-500/20">
            <h3 className="text-2xl font-bold mb-4 text-white">¿Cómo adquirir una Giftcard?</h3>
            <p className="text-lg text-gray-300 mb-6">
              Para adquirir una giftcard, comunícate directamente con nuestro estudio. 
              Te asesoraremos sobre los montos disponibles y el proceso de compra.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                leftIcon={<Phone className="h-5 w-5" />}
                onClick={handleCallToAction}
              >
                Contactar para Giftcard
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-white">Lo que dicen nuestros clientes</h2>
            <p className="text-xl text-gray-400">Experiencias reales de quienes han regalado y recibido nuestras giftcards</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {settings.testimonials?.map((testimonial, index) => (
              <Card key={index} className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-white">{testimonial.name}</h4>
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            )) || [
              {
                name: "María González",
                text: "¡Increíble experiencia! El regalo perfecto para mi hermana. El proceso fue súper fácil.",
                rating: 5,
                avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150"
              },
              {
                name: "Carlos Ruiz",
                text: "Regalé una giftcard para un tatuaje y quedó espectacular. Muy profesionales.",
                rating: 5,
                avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150"
              },
              {
                name: "Ana López",
                text: "El mejor regalo que he recibido. Mi piercing quedó perfecto y el trato fue excelente.",
                rating: 5,
                avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-white">{testimonial.name}</h4>
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Consulta Pública */}
      <section id="consulta" className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
              <div className="mb-6">
                <Search className="h-16 w-16 mx-auto text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold mb-6 text-white">Consulta tu Giftcard</h2>
              <p className="text-lg text-gray-300 mb-8">
                Ingresa el número de tu giftcard para verificar su estado, monto disponible y fecha de vencimiento.
              </p>
              
              <Link to="/buscar">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full sm:w-auto px-8 py-4 text-lg"
                  leftIcon={<Search className="h-5 w-5" />}
                >
                  Consultar Mi Giftcard
                </Button>
              </Link>
              
              <p className="text-sm text-gray-400 mt-4">
                Consulta rápida y segura • Sin registro requerido
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Términos y Condiciones */}
      <section id="terminos" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <FileText className="h-16 w-16 mx-auto text-purple-400 mb-4" />
              <h2 className="text-3xl font-bold mb-6 text-white">Términos y Condiciones</h2>
              <p className="text-lg text-gray-300">
                Conoce los términos de uso de nuestras giftcards y el sistema de consulta
              </p>
            </div>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-8">
                {settings.terms && (
                  <div 
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: settings.terms.content }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img 
                src={settings.logoUrl} 
                alt="Logo" 
                className="h-8 w-8"
                onError={(e) => {
                  e.currentTarget.src = '/logo.svg';
                }}
              />
              <span className="text-xl font-bold text-white">{settings.siteName}</span>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400 mb-2">
                &copy; {new Date().getFullYear()} Daz Tattoo. Todos los derechos reservados.
              </p>
              <Link 
                to="/login" 
                className="text-xs text-gray-600 hover:text-gray-500 transition-colors inline-flex items-center"
              >
                <Settings className="h-3 w-3 mr-1" />
                Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Contactar para Giftcard</h3>
              <button
                onClick={() => setShowContactForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <Input
                label="Nombre completo"
                value={contactForm.name}
                onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Tu nombre completo"
                required
              />

              <Input
                label="WhatsApp"
                value={contactForm.whatsapp}
                onChange={(e) => setContactForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="+56 9 1234 5678"
                required
              />

              <Input
                label="Email"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="tu@email.com"
                required
              />

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>📞 Te contactaremos a la brevedad</strong><br />
                  Nuestro equipo se comunicará contigo para asesorarte sobre los montos disponibles y el proceso de compra.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  leftIcon={<Send className="h-4 w-4" />}
                  className="flex-1"
                >
                  Enviar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Botón para volver al inicio en todas las subpáginas */}
      <Link
        to="/"
        className="fixed bottom-4 left-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 shadow-lg transition-colors z-40"
        title="Volver al inicio"
      >
        <Home className="h-5 w-5" />
      </Link>
    </div>
  );
};

export default LandingPage;