import React from 'react';
import { Button, View } from 'react-native';
import { useTranslation } from '../context/LanguageContext';

export default function HomeScreen({ navigation }) {
  const t = useTranslation();
  return (
    <View style={{ flex: 1, justifyContent: 'center', gap: 10, padding: 20 }}>
      <Button title={t('home.fridge')} onPress={() => navigation.navigate('Fridge')} />
      <Button title={t('home.freezer')} onPress={() => navigation.navigate('Freezer')} />
      <Button title={t('home.pantry')} onPress={() => navigation.navigate('Pantry')} />
      <Button title={t('home.shopping')} onPress={() => navigation.navigate('Shopping')} />
    </View>
  );
}
