import React, { useLayoutEffect, useMemo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as InAppPurchases from 'expo-in-app-purchases';
import { useTheme } from '../context/ThemeContext';

const baseProducts = [
  {
    level: 1,
    productId: 'membership_level_1',
    title: 'Membresía Nivel 1',
    icon: require('../../icons/Insigneas/Nivel 1.png'),
  },
  {
    level: 2,
    productId: 'membership_level_2',
    title: 'Membresía Nivel 2',
    icon: require('../../icons/Insigneas/Nivel 2.png'),
  },
  {
    level: 3,
    productId: 'membership_level_3',
    title: 'Membresía Nivel 3',
    icon: require('../../icons/Insigneas/Nivel 3.png'),
  },
  {
    level: 4,
    productId: 'membership_level_4',
    title: 'Membresía Nivel 4',
    icon: require('../../icons/Insigneas/Nivel 4.png'),
  },
  {
    level: 5,
    productId: 'membership_level_5',
    title: 'Membresía Nivel 5',
    icon: require('../../icons/Insigneas/Nivel 5.png'),
  },
];

export default function MembershipsScreen() {
  const palette = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const nav = useNavigation();
  const [products, setProducts] = useState(baseProducts);

  useLayoutEffect(() => {
    nav.setOptions?.({
      headerStyle: { backgroundColor: palette.surface },
      headerTintColor: palette.text,
      headerTitleStyle: { color: palette.text },
      headerShadowVisible: false,
    });
  }, [nav, palette]);

  useEffect(() => {
    let subscription;
    async function initIAP() {
      try {
        await InAppPurchases.connectAsync();
        const { responseCode, results } = await InAppPurchases.getProductsAsync(
          baseProducts.map(p => p.productId)
        );
        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          setProducts(
            baseProducts.map(info => {
              const match = results.find(r => r.productId === info.productId);
              return { ...info, price: match?.price ?? '—' };
            })
          );
        }
        subscription = InAppPurchases.setPurchaseListener(
          async ({ responseCode, results }) => {
            if (responseCode === InAppPurchases.IAPResponseCode.OK) {
              for (const purchase of results) {
                if (!purchase.acknowledged) {
                  await InAppPurchases.finishTransactionAsync(purchase, true);
                }
              }
            }
          }
        );
      } catch (e) {
        console.log('IAP error', e);
      }
    }

    if (Platform.OS !== 'web') {
      initIAP();
    }

    return () => {
      subscription?.remove();
      InAppPurchases.disconnectAsync();
    };
  }, []);

  const handleBuy = async productId => {
    if (Platform.OS === 'web') return;
    await InAppPurchases.purchaseItemAsync(productId);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={Platform.OS === 'web'}
      >
        {products.map(p => (
          <View key={p.productId} style={styles.item}>
            <Image source={p.icon} style={styles.icon} />
            <View style={styles.info}>
              <Text style={styles.itemTitle}>{p.title}</Text>
              <Text style={styles.price}>{p.price || ''}</Text>
            </View>
            {Platform.OS !== 'web' ? (
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleBuy(p.productId)}
              >
                <Text style={styles.buttonText}>Comprar</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
        {Platform.OS === 'web' && (
          <Text style={styles.webNotice}>
            Las compras en línea no están disponibles en la versión web.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = palette =>
  StyleSheet.create({
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
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.surface2,
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
    },
    icon: { width: 48, height: 48, marginRight: 12, resizeMode: 'contain' },
    info: { flex: 1 },
    itemTitle: { color: palette.text, fontWeight: '700' },
    price: { color: palette.textDim, marginTop: 4 },
    button: {
      backgroundColor: palette.accent,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    buttonText: { color: palette.onAccent, fontWeight: '700' },
    webNotice: { color: palette.textDim, textAlign: 'center', marginTop: 12 },
  });

