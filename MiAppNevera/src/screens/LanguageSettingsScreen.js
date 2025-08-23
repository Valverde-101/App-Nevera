import React, { useLayoutEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, useTranslation } from '../context/LanguageContext';

export default function LanguageSettingsScreen() {
  const palette = useTheme();
  const { language, setLanguage } = useLanguage();
  const t = useTranslation();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const nav = useNavigation();

  useLayoutEffect(() => {
    nav.setOptions?.({
      headerStyle: { backgroundColor: palette.surface },
      headerTintColor: palette.text,
      headerTitleStyle: { color: palette.text },
      headerShadowVisible: false,
    });
  }, [nav, palette]);

  const langs = [
    { key: 'es', label: t('languageSettings.spanish') },
    { key: 'en', label: t('languageSettings.english') },
    { key: 'fr', label: t('languageSettings.french') },
    { key: 'ja', label: t('languageSettings.japanese') },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={Platform.OS === 'web'}>
        {langs.map(l => (
          <TouchableOpacity key={l.key} style={styles.item} onPress={() => setLanguage(l.key)}>
            <Text style={styles.itemTitle}>{l.label}</Text>
            {language === l.key ? <Text style={styles.current}>{t('themeSettings.current')}</Text> : null}
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
