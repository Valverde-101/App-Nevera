import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Updates from 'expo-updates';
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
  }, [lang]);

  const changeLang = async newLang => {
    setLang(newLang);
    i18n.locale = newLang;
    try {
      await AsyncStorage.setItem('lang', newLang);
    } catch (e) {
      console.error('Failed to save language', e);
    }
    if (Platform.OS === 'web') {
      window.location.reload();
    } else {
      await Updates.reloadAsync();
    }
  };

  const value = useMemo(
    () => ({ lang, setLang: changeLang, t: (scope, options) => i18n.t(scope, options) }),
    [lang],
  );
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;
