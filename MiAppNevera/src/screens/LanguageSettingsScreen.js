import React, { useLayoutEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../context/LangContext';

export default function LanguageSettingsScreen() {
  const palette = useTheme();
  const { lang, setLanguage, t } = useTranslation();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const nav = useNavigation();

  useLayoutEffect(() => {
    nav.setOptions?.({
      headerStyle: { backgroundColor: palette.surface },
      headerTintColor: palette.text,
      headerTitleStyle: { color: palette.text },
      headerShadowVisible: false,
      title: t('screen.language.title'),
    });
  }, [nav, palette, t, lang]);

  const languages = [
    { key: 'es', label: t('screen.language.spanish') },
    { key: 'en', label: t('screen.language.english') },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={Platform.OS === 'web'}>
        {languages.map(l => (
          <TouchableOpacity key={l.key} style={styles.item} onPress={() => setLanguage(l.key)}>
            <Text style={styles.itemTitle}>{l.label}</Text>
            {lang === l.key ? <Text style={styles.current}>{t('screen.language.current')}</Text> : null}
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
