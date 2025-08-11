import React from 'react';
import { View, Button } from 'react-native';

export default function SettingsScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 10 }}>
      <Button title="Tipos de unidad" onPress={() => navigation.navigate('UnitSettings')} />
      <Button title="Gestión de ubicación" onPress={() => navigation.navigate('LocationSettings')} />
    </View>
  );
}
