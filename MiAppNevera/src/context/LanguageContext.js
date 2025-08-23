import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../locales/en.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import ja from '../locales/ja.json';

const dictionaries = { en, es, fr, ja };

const LanguageContext = createContext({
  language: 'es',
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('es');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('language');
        if (stored && dictionaries[stored]) {
          setLanguage(stored);
        }
      } catch (e) {
        console.error('Failed to load language', e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try { await AsyncStorage.setItem('language', language); } catch (e) { console.error('Failed to save language', e); }
    })();
  }, [language]);

  const t = useMemo(() => {
    const dict = dictionaries[language] || {};
    return (key) => key.split('.').reduce((o, k) => (o ? o[k] : null), dict) || key;
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
export const useTranslation = () => useContext(LanguageContext).t;

export default LanguageContext;
