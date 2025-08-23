import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import es from '../locales/es.json';
import en from '../locales/en.json';

const LANG_KEY = 'app_lang';
const resources = { es, en };

const LangContext = createContext({
  lang: 'es',
  setLanguage: () => {},
  t: (k, vars) => k,
});

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('es');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(LANG_KEY);
        if (stored && resources[stored]) setLang(stored);
      } catch (e) {
        // ignore
      }
      setReady(true);
    })();
  }, []);

  const setLanguage = async (newLang) => {
    setLang(newLang);
    try {
      await AsyncStorage.setItem(LANG_KEY, newLang);
    } catch (e) {
      // ignore
    }
  };

  const t = (key, vars = {}) => {
    let str = resources[lang][key] || key;
    Object.keys(vars).forEach(k => {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k]);
    });
    return str;
  };

  if (!ready) return null;

  return (
    <LangContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useTranslation = () => useContext(LangContext);
