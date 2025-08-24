import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

const LanguageContext = createContext({
  lang: 'es',
  setLang: () => {},
  t: (k, opts) => i18n.t(k, opts),
});

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('es');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('lang');
        if (stored === 'es' || stored === 'en') {
          setLang(stored);
        }
      } catch (e) {
        console.error('Failed to load language', e);
      }
    })();
  }, []);

  useEffect(() => {
    i18n.locale = lang;
    (async () => {
      try { await AsyncStorage.setItem('lang', lang); } catch (e) { console.error('Failed to save language', e); }
    })();
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t: (scope, options) => i18n.t(scope, options) }), [lang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;
