
// SettingsScreen.js – dark–premium v2.2.12
import React, { useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const palette = {
  bg: '#121316', surface: '#191b20', surface2: '#20242c', surface3: '#262b35',
  text: '#ECEEF3', textDim: '#A8B1C0', border: '#2c3038', accent: '#F2B56B',
};

export default function SettingsScreen({ navigation }) {
  const nav = useNavigation();
  useLayoutEffect(() => {
    nav.setOptions?.({
      headerStyle: { backgroundColor: palette.surface },
      headerTintColor: palette.text,
      headerTitleStyle: { color: palette.text },
      headerShadowVisible: false,
    });
  }, [nav]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={Platform.OS === 'web'}>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('UnitSettings')}>
          <Text style={styles.itemTitle}>Tipos de unidad</Text>
          <Text style={styles.itemDesc}>Gestiona singular y plural de tus unidades.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('LocationSettings')}>
          <Text style={styles.itemTitle}>Gestión de ubicación</Text>
          <Text style={styles.itemDesc}>Define dónde guardas tus alimentos.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('UserData')}>
          <Text style={styles.itemTitle}>Datos de usuario</Text>
          <Text style={styles.itemDesc}>Respaldos, importación y eliminación total.</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
