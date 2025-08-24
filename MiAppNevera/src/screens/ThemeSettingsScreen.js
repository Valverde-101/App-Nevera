import React, { useLayoutEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme, useThemeController } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function ThemeSettingsScreen() {
  const palette = useTheme();
  const { themeName, setThemeName } = useThemeController();
  const { t, lang } = useLanguage();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const nav = useNavigation();

  useLayoutEffect(() => {
    nav.setOptions?.({
      title: t('system.navigation.themeSettings'),
      headerStyle: { backgroundColor: palette.surface },
      headerTintColor: palette.text,
      headerTitleStyle: { color: palette.text },
      headerShadowVisible: false,
    });
  }, [nav, palette, t, lang]);

  const themes = [
    { key: 'dark', label: t('system.theme.dark') },
    { key: 'light', label: t('system.theme.light') },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={Platform.OS === 'web'}>
        {themes.map(theme => (
          <TouchableOpacity key={theme.key} style={styles.item} onPress={() => setThemeName(theme.key)}>
            <Text style={styles.itemTitle}>{theme.label}</Text>
            {themeName === theme.key ? <Text style={styles.current}>{t('system.theme.current')}</Text> : null}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  scroll: {
    ...(Platform.OS === 'web' ? {
      scrollbarWidth: 'thin',
      scrollbarColor: `${palette.accent} ${palette.surface2}`,
      scrollbarGutter: 'stable both-edges',
      overscrollBehavior: 'contain',
    } : {}),
  },
  item: { backgroundColor: palette.surface2, borderWidth: 1, borderColor: palette.border, borderRadius: 12, padding: 14, marginBottom: 12 },
  itemTitle: { color: palette.text, fontWeight: '700' },
  current: { color: palette.accent, marginTop: 4 },
});
