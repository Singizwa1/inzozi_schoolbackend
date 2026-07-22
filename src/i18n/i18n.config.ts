import i18n from 'i18next';
import fs from 'fs';
import path from 'path';

// Load translation files
const loadLocales = () => {
  const locales: Record<string, { translation: any }> = {};
  const localeDirs = ['en', 'fr', 'rw']; 

  localeDirs.forEach(lang => {
    const filePath = path.join(__dirname, 'locales', lang, 'translation.json');
    if (fs.existsSync(filePath)) {
      locales[lang] = {
        translation: JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      };
    }
  });

  return locales;
};

// Initialize i18next
i18n.init({
  resources: loadLocales(),
  lng: 'en', // default language
  fallbackLng: 'en',
  debug: false,
  interpolation: {
    escapeValue: false // React already escapes
  }
});

export default i18n;