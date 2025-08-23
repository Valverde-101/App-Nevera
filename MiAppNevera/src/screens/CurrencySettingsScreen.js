import React, { useLayoutEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { currencyOptions, useCurrencyController } from '../context/CurrencyContext';
import { useTranslation } from '../context/LanguageContext';

export default function CurrencySettingsScreen() {
  const palette = useTheme();
  const { currencyKey, setCurrencyKey } = useCurrencyController();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const nav = useNavigation();
  const t = useTranslation();

  useLayoutEffect(() => {
    nav.setOptions?.({
      headerStyle: { backgroundColor: palette.surface },
      headerTintColor: palette.text,
      headerTitleStyle: { color: palette.text },
      headerShadowVisible: false,
    });
  }, [nav, palette]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={Platform.OS === 'web'}>
        {currencyOptions.map(c => (
          <TouchableOpacity key={c.key} style={styles.item} onPress={() => setCurrencyKey(c.key)}>
            <Text style={styles.itemTitle}>{`${t(c.labelKey)} (${c.symbol})`}</Text>
            {currencyKey === c.key ? <Text style={styles.current}>{t('themeSettings.current')}</Text> : null}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = palette => StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  scroll: {
    ...(Platform.OS === 'web'
      ? {
          scrollbarWidth: 'thin',
          scrollbarColor: `${palette.accent} ${palette.surface2}`,
          scrollbarGutter: 'stable both-edges',
          overscrollBehavior: 'contain',
        }
      : {}),
  },
  item: { backgroundColor: palette.surface2, borderWidth: 1, borderColor: palette.border, borderRadius: 12, padding: 14, marginBottom: 12 },
  itemTitle: { color: palette.text, fontWeight: '700' },
  current: { color: palette.accent, marginTop: 4 },
});

