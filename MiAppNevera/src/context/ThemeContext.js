import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes } from '../theme';

const ThemeContext = createContext({
  theme: themes.dark,
  themeName: 'dark',
  setThemeName: () => {},
});

export const ThemeProvider = ({ children }) => {
  const scheme = Appearance.getColorScheme();
  const [themeName, setThemeName] = useState(scheme === 'light' ? 'light' : 'dark');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('themeName');
        if (stored === 'light' || stored === 'dark') {
          setThemeName(stored);
        }
      } catch (e) {
        console.error('Failed to load theme', e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try { await AsyncStorage.setItem('themeName', themeName); } catch (e) { console.error('Failed to save theme', e); }
    })();
  }, [themeName]);

  const theme = useMemo(() => themes[themeName] || themes.dark, [themeName]);
  const value = useMemo(() => ({ theme, themeName, setThemeName }), [theme, themeName]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext).theme;
export const useThemeController = () => useContext(ThemeContext);

export default ThemeContext;
