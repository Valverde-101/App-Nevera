import React from 'react';
import { Button, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

export default function HomeScreen({ navigation }) {
  const { t } = useLanguage();
  return (
    <View style={{ flex: 1, justifyContent: 'center', gap: 10, padding: 20 }}>
      <Button
        title={t('system.navigation.inventory')}
        onPress={() => navigation.navigate('Fridge')}
      />
      <Button
        title={t('system.navigation.freezer')}
        onPress={() => navigation.navigate('Freezer')}
      />
      <Button
        title={t('system.navigation.pantry')}
        onPress={() => navigation.navigate('Pantry')}
      />
      <Button
        title={t('system.navigation.shopping')}
        onPress={() => navigation.navigate('Shopping')}
      />
    </View>
  );
}
