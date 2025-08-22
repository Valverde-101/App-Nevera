import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as InAppPurchases from 'expo-in-app-purchases';
import { useTheme } from '../context/ThemeContext';

const PRODUCT_IDS = [
  'membership_level_1',
  'membership_level_2',
  'membership_level_3',
  'membership_level_4',
  'membership_level_5',
];

const MEMBERSHIPS = [
  {
    productId: 'membership_level_1',
    title: 'Membresía Nivel 1',
    price: '$0.99',
    icon: require('../../../icons/Insigneas/Nivel 1.png'),
  },
  {
    productId: 'membership_level_2',
    title: 'Membresía Nivel 2',
    price: '$1.99',
    icon: require('../../../icons/Insigneas/Nivel 2.png'),
  },
  {
    productId: 'membership_level_3',
    title: 'Membresía Nivel 3',
    price: '$2.99',
    icon: require('../../../icons/Insigneas/Nivel 3.png'),
  },
  {
    productId: 'membership_level_4',
    title: 'Membresía Nivel 4',
    price: '$3.99',
    icon: require('../../../icons/Insigneas/Nivel 4.png'),
  },
  {
    productId: 'membership_level_5',
    title: 'Membresía Nivel 5',
    price: '$4.99',
    icon: require('../../../icons/Insigneas/Nivel 5.png'),
  },
];

export default function MembershipScreen() {
  const palette = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const nav = useNavigation();
  const [products, setProducts] = useState([]);

  useLayoutEffect(() => {
    nav.setOptions?.({
      headerStyle: { backgroundColor: palette.surface },
      headerTintColor: palette.text,
      headerTitleStyle: { color: palette.text },
      headerShadowVisible: false,
    });
  }, [nav, palette]);

  useEffect(() => {
    let listener;
    const init = async () => {
      try {
        await InAppPurchases.connectAsync();
        const { responseCode, results } = await InAppPurchases.getProductsAsync(PRODUCT_IDS);
        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          setProducts(results);
        }
        listener = InAppPurchases.setPurchaseListener(() => {
          // Aquí se manejaría la confirmación de compra y la concesión de beneficios.
        });
      } catch (e) {
        console.warn('Error inicializando compras in-app', e);
      }
    };
    init();
    return () => {
      listener?.remove();
      InAppPurchases.disconnectAsync();
    };
  }, []);

  const handlePurchase = async (id) => {
    try {
      await InAppPurchases.purchaseItemAsync(id);
    } catch (e) {
      console.warn('Error al intentar comprar', e);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={Platform.OS === 'web'}>
        {MEMBERSHIPS.map((m) => {
          const product = products.find((p) => p.productId === m.productId);
          const price = product?.price ?? m.price;
          return (
            <TouchableOpacity key={m.productId} style={styles.item} onPress={() => handlePurchase(m.productId)}>
              <Image source={m.icon} style={styles.icon} />
              <View style={styles.info}>
                <Text style={styles.itemTitle}>{m.title}</Text>
                <Text style={styles.itemDesc}>{price}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const createStyles = (palette) => StyleSheet.create({
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
  item: {
    backgroundColor: palette.surface2,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: { width: 50, height: 50, marginRight: 12 },
  info: { flex: 1 },
  itemTitle: { color: palette.text, fontWeight: '700', marginBottom: 4 },
  itemDesc: { color: palette.textDim },
});

