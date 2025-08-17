import React, { createContext, useContext, useState, useMemo } from 'react';
import { Appearance } from 'react-native';
import { themes } from '../theme';

const ThemeContext = createContext({
  theme: themes.dark,
  themeName: 'dark',
  setThemeName: () => {},
});

export const ThemeProvider = ({ children }) => {
  const scheme = Appearance.getColorScheme();
  const [themeName, setThemeName] = useState(scheme === 'light' ? 'light' : 'dark');
  const theme = useMemo(() => themes[themeName] || themes.dark, [themeName]);
  const value = useMemo(() => ({ theme, themeName, setThemeName }), [theme, themeName]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext).theme;
export const useThemeController = () => useContext(ThemeContext);

export default ThemeContext;
