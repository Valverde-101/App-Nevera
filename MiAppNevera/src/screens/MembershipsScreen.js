import React, { useEffect, useLayoutEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import * as InAppPurchases from 'expo-in-app-purchases';

const MEMBERSHIPS = [
  {
    id: 'membership_level_1',
    title: 'Membresía Nivel 1',
    price: '$1.99',
    icon: require('../../../icons/Insigneas/Nivel 1.png'),
  },
  {
    id: 'membership_level_2',
    title: 'Membresía Nivel 2',
    price: '$3.99',
    icon: require('../../../icons/Insigneas/Nivel 2.png'),
  },
  {
    id: 'membership_level_3',
    title: 'Membresía Nivel 3',
    price: '$5.99',
    icon: require('../../../icons/Insigneas/Nivel 3.png'),
  },
  {
    id: 'membership_level_4',
    title: 'Membresía Nivel 4',
    price: '$7.99',
    icon: require('../../../icons/Insigneas/Nivel 4.png'),
  },
  {
    id: 'membership_level_5',
    title: 'Membresía Nivel 5',
    price: '$9.99',
    icon: require('../../../icons/Insigneas/Nivel 5.png'),
  },
];

export default function MembershipsScreen() {
  const palette = useTheme();
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

  useEffect(() => {
    const init = async () => {
      try {
        await InAppPurchases.connectAsync();
        const { responseCode } = await InAppPurchases.getProductsAsync(
          MEMBERSHIPS.map((m) => m.id)
        );
        if (responseCode !== InAppPurchases.IAPResponseCode.OK) {
          console.log('No se pudieron obtener los productos');
        }
      } catch (e) {
        console.log(e);
      }
    };
    init();
    return () => {
      InAppPurchases.disconnectAsync();
    };
  }, []);

  const handlePurchase = async (id) => {
    try {
      await InAppPurchases.purchaseItemAsync(id);
    } catch (e) {
      console.log(e);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Image source={item.icon} style={styles.icon} />
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>{item.price}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => handlePurchase(item.id)}>
        <Text style={styles.buttonText}>Comprar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={MEMBERSHIPS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const createStyles = (palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.bg },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.surface2,
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
    },
    icon: { width: 40, height: 40, marginRight: 12, resizeMode: 'contain' },
    info: { flex: 1 },
    title: { color: palette.text, fontWeight: '700' },
    price: { color: palette.textDim, marginTop: 4 },
    button: {
      backgroundColor: palette.accent,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    buttonText: { color: palette.onAccent, fontWeight: '700' },
  });

