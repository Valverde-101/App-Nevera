import { I18n } from 'i18n-js';
import esSystem from './locales/es/system.json';
import enSystem from './locales/en/system.json';
import esFoods from './locales/es/foods.json';
import enFoods from './locales/en/foods.json';
import esCategories from './locales/es/categories.json';
import enCategories from './locales/en/categories.json';
import esDefaults from './locales/es/defaults.json';
import enDefaults from './locales/en/defaults.json';

const i18n = new I18n({
  es: {
    system: esSystem,
    foods: esFoods,
    categories: esCategories,
    units: esDefaults.units,
    locations: esDefaults.locations,
  },
  en: {
    system: enSystem,
    foods: enFoods,
    categories: enCategories,
    units: enDefaults.units,
    locations: enDefaults.locations,
  },
});

i18n.enableFallback = true;
i18n.locale = 'es';

export default i18n;
