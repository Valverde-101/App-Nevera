
// SettingsScreen.js – dark–premium v2.2.12
import React, { useLayoutEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../context/LangContext';

export default function SettingsScreen({ navigation }) {
  const palette = useTheme();
  const { t } = useTranslation();
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={Platform.OS === 'web'}>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ThemeSettings')}>
          <Text style={styles.itemTitle}>{t('screen.settings.theme_title')}</Text>
          <Text style={styles.itemDesc}>{t('screen.settings.theme_desc')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('UnitSettings')}>
          <Text style={styles.itemTitle}>{t('screen.settings.unit_title')}</Text>
          <Text style={styles.itemDesc}>{t('screen.settings.unit_desc')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('CurrencySettings')}>
          <Text style={styles.itemTitle}>{t('screen.settings.currency_title')}</Text>
          <Text style={styles.itemDesc}>{t('screen.settings.currency_desc')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('LocationSettings')}>
          <Text style={styles.itemTitle}>{t('screen.settings.location_title')}</Text>
          <Text style={styles.itemDesc}>{t('screen.settings.location_desc')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('UserData')}>
          <Text style={styles.itemTitle}>{t('screen.settings.user_title')}</Text>
          <Text style={styles.itemDesc}>{t('screen.settings.user_desc')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('LanguageSettings')}>
          <Text style={styles.itemTitle}>{t('screen.settings.language_title')}</Text>
          <Text style={styles.itemDesc}>{t('screen.settings.language_desc')}</Text>
        </TouchableOpacity>
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
  itemTitle: { color: palette.text, fontWeight: '700', marginBottom: 4 },
  itemDesc: { color: palette.textDim },
});

