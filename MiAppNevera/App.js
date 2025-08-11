import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InventoryScreen from './src/screens/InventoryScreen';
import ShoppingListScreen from './src/screens/ShoppingListScreen';
import { InventoryProvider } from './src/context/InventoryContext';
import { ShoppingProvider } from './src/context/ShoppingContext';
import RecipeBookScreen from './src/screens/RecipeBookScreen';
import RecipeDetailScreen from './src/screens/RecipeDetailScreen';
import { RecipeProvider } from './src/context/RecipeContext';
import SettingsScreen from './src/screens/SettingsScreen';
import UnitSettingsScreen from './src/screens/UnitSettingsScreen';
import LocationSettingsScreen from './src/screens/LocationSettingsScreen';
import { UnitsProvider } from './src/context/UnitsContext';
import { LocationsProvider } from './src/context/LocationsContext';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <UnitsProvider>
      <LocationsProvider>
        <InventoryProvider>
          <ShoppingProvider>
            <RecipeProvider>
              <NavigationContainer>
                <StatusBar style="auto" />
                <Stack.Navigator>
                  <Stack.Screen
                    name="Inventory"
                    component={InventoryScreen}
                    options={{ title: 'Nevera' }}
                  />
                  <Stack.Screen
                    name="Shopping"
                    component={ShoppingListScreen}
                    options={{ title: 'Compras' }}
                  />
                  <Stack.Screen
                    name="Recipes"
                    component={RecipeBookScreen}
                    options={{ title: 'Recetario' }}
                  />
                  <Stack.Screen
                    name="RecipeDetail"
                    component={RecipeDetailScreen}
                    options={{ title: 'Receta' }}
                  />
                  <Stack.Screen
                    name="Settings"
                    component={SettingsScreen}
                    options={{ title: 'Ajustes' }}
                  />
                  <Stack.Screen
                    name="UnitSettings"
                    component={UnitSettingsScreen}
                    options={{ title: 'Tipos de unidad' }}
                  />
                  <Stack.Screen
                    name="LocationSettings"
                    component={LocationSettingsScreen}
                    options={{ title: 'Gestión de ubicación' }}
                  />
                </Stack.Navigator>
              </NavigationContainer>
            </RecipeProvider>
          </ShoppingProvider>
        </InventoryProvider>
      </LocationsProvider>
    </UnitsProvider>
  );
}
