import React from 'react';
import { View, Button, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useInventory } from '../context/InventoryContext';
import { useUnits } from '../context/UnitsContext';
import { useLocations } from '../context/LocationsContext';
import { useShopping } from '../context/ShoppingContext';
import { useRecipes } from '../context/RecipeContext';
import { useCustomFoods } from '../context/CustomFoodsContext';
import { exportBackup, importBackup } from '../utils/backup';

export default function UserDataScreen() {
  const { resetInventory } = useInventory();
  const { resetUnits } = useUnits();
  const { resetLocations } = useLocations();
  const { resetShopping } = useShopping();
  const { resetRecipes } = useRecipes();
  const { resetCustomFoods } = useCustomFoods();

  const confirmExport = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Deseas exportar todos los datos de usuario?')) {
        exportBackup();
      }
    } else {
      Alert.alert(
        'Confirmar',
        '¿Deseas exportar todos los datos de usuario?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Exportar', onPress: exportBackup },
        ],
      );
    }
  };

  const resetAll = async () => {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error('Failed to clear storage', e);
    }
    resetCustomFoods();
    resetUnits();
    resetLocations();
    resetInventory();
    resetShopping();
    resetRecipes();
  };

  const confirmReset = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Esto eliminará todos los datos de usuario. ¿Deseas continuar?')) {
        resetAll();
      }
    } else {
      Alert.alert(
        'Confirmar',
        'Esto eliminará todos los datos de usuario. ¿Deseas continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: resetAll },
        ],
      );
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Button title="Exportar datos" onPress={confirmExport} />
      <View style={{ height: 10 }} />
      <Button title="Importar datos" onPress={importBackup} />
      <View style={{ height: 10 }} />
      <Button title="Eliminar todos los datos de usuario" onPress={confirmReset} />
    </View>
  );
}
