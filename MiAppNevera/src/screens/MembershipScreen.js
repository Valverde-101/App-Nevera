import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';

let InAppPurchases;
let GooglePayButton;

if (Platform.OS !== 'web') {
  InAppPurchases = require('expo-in-app-purchases');
} else {
  GooglePayButton = require('@google-pay/button-react').default;
}

const MEMBERSHIPS = [
  {
    level: 1,
    price: '$1.99',
    webPrice: '1.99',
    productId: 'membership_level_1',
    icon: require('../../../icons/Insigneas/nivel1.png'),
  },
  {
    level: 2,
    price: '$3.99',
    webPrice: '3.99',
    productId: 'membership_level_2',
    icon: require('../../../icons/Insigneas/nivel2.png'),
  },
  {
    level: 3,
    price: '$5.99',
    webPrice: '5.99',
    productId: 'membership_level_3',
    icon: require('../../../icons/Insigneas/nivel3.png'),
  },
  {
    level: 4,
    price: '$7.99',
    webPrice: '7.99',
    productId: 'membership_level_4',
    icon: require('../../../icons/Insigneas/nivel4.png'),
  },
  {
    level: 5,
    price: '$9.99',
    webPrice: '9.99',
    productId: 'membership_level_5',
    icon: require('../../../icons/Insigneas/nivel5.png'),
  },
];

export default function MembershipScreen() {
  const palette = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      InAppPurchases.connectAsync();
      return () => {
        InAppPurchases.disconnectAsync();
      };
    }
  }, []);

  const buy = async (productId) => {
    if (Platform.OS !== 'web') {
      try {
        await InAppPurchases.requestPurchaseAsync(productId);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {MEMBERSHIPS.map((m) => (
        <View key={m.level} style={styles.item}>
          <Image source={m.icon} style={styles.icon} />
          <Text style={styles.title}>{`Membresía Nivel ${m.level}`}</Text>
          <Text style={styles.price}>{m.price}</Text>
          {Platform.OS === 'web' ? (
            <GooglePayButton
              environment="TEST"
              buttonColor="black"
              buttonType="buy"
              paymentRequest={{
                apiVersion: 2,
                apiVersionMinor: 0,
                allowedPaymentMethods: [
                  {
                    type: 'CARD',
                    parameters: {
                      allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                      allowedCardNetworks: ['MASTERCARD', 'VISA'],
                    },
                    tokenizationSpecification: {
                      type: 'PAYMENT_GATEWAY',
                      parameters: {
                        gateway: 'example',
                        gatewayMerchantId: 'exampleGatewayMerchantId',
                      },
                    },
                  },
                ],
                merchantInfo: {
                  merchantId: '01234567890123456789',
                  merchantName: 'MiAppNevera',
                },
                transactionInfo: {
                  totalPriceStatus: 'FINAL',
                  totalPrice: m.webPrice,
                  currencyCode: 'USD',
                },
              }}
            />
          ) : (
            <TouchableOpacity style={styles.btn} onPress={() => buy(m.productId)}>
              <Text style={styles.btnText}>Comprar</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const createStyles = (palette) =>
  StyleSheet.create({
    container: { padding: 16 },
    item: {
      backgroundColor: palette.surface2,
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      alignItems: 'center',
    },
    icon: { width: 64, height: 64, marginBottom: 8 },
    title: { color: palette.text, fontWeight: '700', marginBottom: 4 },
    price: { color: palette.textDim, marginBottom: 8 },
    btn: {
      backgroundColor: palette.accent,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    btnText: { color: palette.onAccent, fontWeight: '700' },
  });
