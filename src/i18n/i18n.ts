import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import esTranslation from './locales/es.json';
import enTranslation from './locales/en.json';

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        translation: esTranslation
      },
      en: {
        translation: enTranslation
      }
    },
    lng: 'es', // Default language
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;