import { useState } from 'react';
import { X, Phone, Mail, MessageSquare } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import Button from '../ui/Button';

const ContactFooter = () => {
  const { settings } = useSettingsStore();
  const [showPopup, setShowPopup] = useState(false);

  const handleContactClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const contactInfo = settings.contactInfo || {
    phone: '+56 9 1234 5678',
    whatsapp: '+56 9 1234 5678',
    email: 'contacto@daztattoo.cl'
  };

  return (
    <>
      <footer className="p-4 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Sistema de Giftcards &copy; {new Date().getFullYear()} | {' '}
          <button
            onClick={handleContactClick}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline cursor-pointer"
          >
            ¿Quieres un sistema como este? Da clic aquí
          </button>
        </p>
      </footer>

      {/* Popup de contacto */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                💻 Desarrollo de Sistemas
              </h3>
              <button
                onClick={handleClosePopup}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                ¿Te interesa tener un sistema como este para tu negocio? 
                Contáctanos para más información.
              </p>

              <div className="space-y-3">
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <div className="bg-blue-500 rounded-full p-2">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Teléfono</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{contactInfo.phone}</p>
                  </div>
                </a>

                <a
                  href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <div className="bg-green-500 rounded-full p-2">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">WhatsApp</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{contactInfo.whatsapp}</p>
                  </div>
                </a>

                <a
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                >
                  <div className="bg-purple-500 rounded-full p-2">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{contactInfo.email}</p>
                  </div>
                </a>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mt-6">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  🚀 Desarrollamos sistemas personalizados para tu negocio<br />
                  Gestión de inventarios, ventas, clientes y más
                </p>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Button
                onClick={handleClosePopup}
                variant="outline"
                className="w-full"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContactFooter;