import i18n from 'i18n-js';
import esSystem from './locales/es/system.json';
import enSystem from './locales/en/system.json';
import esFoods from './locales/es/foods.json';
import enFoods from './locales/en/foods.json';
import esCategories from './locales/es/categories.json';
import enCategories from './locales/en/categories.json';

i18n.fallbacks = true;
i18n.translations = {
  es: { system: esSystem, foods: esFoods, categories: esCategories },
  en: { system: enSystem, foods: enFoods, categories: enCategories },
};

i18n.locale = 'es';

export default i18n;
