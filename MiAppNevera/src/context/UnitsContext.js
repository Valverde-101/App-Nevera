import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from './LanguageContext';
import esDefaults from '../locales/es/defaults.json';
import enDefaults from '../locales/en/defaults.json';

const defaultUnits = Object.keys(esDefaults.units).map(key => ({
  key,
  singular: { es: esDefaults.units[key].singular, en: enDefaults.units[key].singular },
  plural: { es: esDefaults.units[key].plural, en: enDefaults.units[key].plural },
}));

const UnitsContext = createContext();

export const UnitsProvider = ({ children }) => {
  const { lang } = useLanguage();
  const [units, setUnits] = useState(defaultUnits);

  useEffect(() => {
    AsyncStorage.getItem('units').then(stored => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const upgraded = parsed.map(u => ({
              ...u,
              singular:
                typeof u.singular === 'string'
                  ? { es: u.singular, en: u.singular }
                  : u.singular,
              plural:
                typeof u.plural === 'string'
                  ? { es: u.plural, en: u.plural }
                  : u.plural,
            }));
            setUnits(upgraded);
          }
        } catch (e) {
          console.error('Failed to parse units', e);
        }
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('units', JSON.stringify(units)).catch(e => {
      console.error('Failed to save units', e);
    });
  }, [units]);

  const addUnit = useCallback((singular, plural) => {
    const key = plural.toLowerCase();
    setUnits(prev => [
      ...prev,
      {
        key,
        singular: { es: singular, en: singular },
        plural: { es: plural, en: plural },
      },
    ]);
  }, []);

  const updateUnit = useCallback((key, singular, plural) => {
    setUnits(prev =>
      prev.map(u =>
        u.key === key
          ? {
              ...u,
              singular: { es: singular, en: singular },
              plural: { es: plural, en: plural },
            }
          : u,
      ),
    );
  }, []);

  const removeUnit = useCallback(key => {
    setUnits(prev => prev.filter(u => u.key !== key));
  }, []);

  const getLabel = useCallback(
    (quantity, key) => {
      const unit = units.find(u => u.key === key);
      if (!unit) return key;
      const form = Number(quantity) === 1 ? unit.singular : unit.plural;
      if (typeof form === 'string') return form;
      return form[lang] || form.es;
    },
    [units, lang],
  );

  const resetUnits = useCallback(() => {
    setUnits(defaultUnits);
    AsyncStorage.removeItem('units').catch(e => {
      console.error('Failed to clear units', e);
    });
  }, []);

  const localizedUnits = useMemo(
    () =>
      units.map(u => ({
        ...u,
        singular: typeof u.singular === 'string' ? u.singular : u.singular[lang] || u.singular.es,
        plural: typeof u.plural === 'string' ? u.plural : u.plural[lang] || u.plural.es,
      })),
    [units, lang],
  );

  const value = useMemo(
    () => ({ units: localizedUnits, addUnit, updateUnit, removeUnit, getLabel, resetUnits }),
    [localizedUnits, addUnit, updateUnit, removeUnit, getLabel, resetUnits],
  );

  return (
    <UnitsContext.Provider value={value}>
      {children}
    </UnitsContext.Provider>
  );
};

export const useUnits = () => useContext(UnitsContext);
