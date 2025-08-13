import React from 'react';
import { View, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserDataScreen() {
  const confirmClear = () => {
    Alert.alert(
      'Confirmar',
      '¿Eliminar todos los datos de usuario? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Datos borrados', 'La aplicación se ha restablecido.');
            } catch (e) {
              Alert.alert('Error', 'No se pudo borrar los datos.');
            }
          },
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Button title="Eliminar todos los datos de usuario" onPress={confirmClear} />
    </View>
  );
}
