import React from 'react';
import { Button, View } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', gap: 10, padding: 20 }}>
      <Button title="Nevera" onPress={() => navigation.navigate('Fridge')} />
      <Button title="Congelador" onPress={() => navigation.navigate('Freezer')} />
      <Button title="Despensa" onPress={() => navigation.navigate('Pantry')} />
      <Button title="Lista de compras" onPress={() => navigation.navigate('Shopping')} />
    </View>
  );
}
