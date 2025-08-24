import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Image, Button, ScrollView } from 'react-native';
import * as InAppPurchases from 'expo-in-app-purchases';
import { useTheme } from '../context/ThemeContext';

const PRODUCT_IDS = [
  'membership_level_1',
  'membership_level_2',
  'membership_level_3',
  'membership_level_4',
  'membership_level_5'
];

const ICONS = {
  membership_level_1: require('../../../icons/Insigneas/Nivel 1.png'),
  membership_level_2: require('../../../icons/Insigneas/Nivel 2.png'),
  membership_level_3: require('../../../icons/Insigneas/Nivel 3.png'),
  membership_level_4: require('../../../icons/Insigneas/Nivel 4.png'),
  membership_level_5: require('../../../icons/Insigneas/Nivel 5.png'),
};

export default function MembershipScreen() {
  const palette = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        await InAppPurchases.connectAsync();
        const { responseCode, results } = await InAppPurchases.getProductsAsync(PRODUCT_IDS);
        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          setProducts(results);
        }
      } catch (e) {
        console.warn('IAP error', e);
      }
    };

    init();

    const listener = InAppPurchases.setPurchaseListener(async ({ responseCode, results }) => {
      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        for (const purchase of results) {
          if (!purchase.acknowledged) {
            await InAppPurchases.finishTransactionAsync(purchase, true);
          }
        }
      }
    });

    return () => {
      listener.remove();
      InAppPurchases.disconnectAsync();
    };
  }, []);

  const handlePurchase = async (productId) => {
    try {
      await InAppPurchases.purchaseItemAsync(productId);
    } catch (e) {
      console.warn('Purchase error', e);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {PRODUCT_IDS.map((id, index) => {
        const product = products.find(p => p.productId === id);
        return (
          <View key={id} style={styles.item}>
            <Image source={ICONS[id]} style={styles.icon} />
            <View style={styles.info}>
              <Text style={styles.title}>Membresía Nivel {index + 1}</Text>
              <Text style={styles.price}>{product?.price || ''}</Text>
            </View>
            <Button title="Comprar" onPress={() => handlePurchase(id)} />
          </View>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (palette) => StyleSheet.create({
  container: { padding: 16, backgroundColor: palette.bg },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: palette.surface2,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  icon: { width: 50, height: 50, marginRight: 16 },
  info: { flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold', color: palette.text },
  price: { fontSize: 16, color: palette.textDim },
});
