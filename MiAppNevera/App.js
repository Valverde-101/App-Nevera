import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import InventoryScreen from './src/screens/InventoryScreen';
import ShoppingListScreen from './src/screens/ShoppingListScreen';
import SavedListsScreen from './src/screens/SavedListsScreen';
import { InventoryProvider } from './src/context/InventoryContext';
import { ShoppingProvider } from './src/context/ShoppingContext';
import { SavedListsProvider } from './src/context/SavedListsContext';
import RecipeBookScreen from './src/screens/RecipeBookScreen';
import RecipeDetailScreen from './src/screens/RecipeDetailScreen';
import { RecipeProvider } from './src/context/RecipeContext';
import SettingsScreen from './src/screens/SettingsScreen';
import UnitSettingsScreen from './src/screens/UnitSettingsScreen';
import LocationSettingsScreen from './src/screens/LocationSettingsScreen';
import UserDataScreen from './src/screens/UserDataScreen';
import ThemeSettingsScreen from './src/screens/ThemeSettingsScreen';
import CurrencySettingsScreen from './src/screens/CurrencySettingsScreen';
import { UnitsProvider } from './src/context/UnitsContext';
import { LocationsProvider } from './src/context/LocationsContext';
import { StatusBar } from 'expo-status-bar';
import { CustomFoodsProvider } from './src/context/CustomFoodsContext';
import { DefaultFoodsProvider } from './src/context/DefaultFoodsContext';
import { CategoriesProvider } from './src/context/CategoriesContext';
import { ThemeProvider, useThemeController } from './src/context/ThemeContext';
import { CurrencyProvider } from './src/context/CurrencyContext';

const Stack = createNativeStackNavigator();

function MainApp() {
  const { themeName } = useThemeController();
  useEffect(() => {
    if (Platform.OS === 'web') {
      const msg = sessionStorage.getItem('reset_notice');
      if (msg) {
        alert('La aplicación se reinició.');
        sessionStorage.removeItem('reset_notice');
      }
    }
  }, []);
  return (
      <CategoriesProvider>
        <DefaultFoodsProvider>
        <CustomFoodsProvider>
          <CurrencyProvider>
            <UnitsProvider>
              <LocationsProvider>
                <InventoryProvider>
                  <SavedListsProvider>
                    <ShoppingProvider>
                      <RecipeProvider>
                  <NavigationContainer theme={themeName === 'light' ? DefaultTheme : DarkTheme}>
                    <StatusBar style={themeName === 'light' ? 'dark' : 'light'} />
                    <Stack.Navigator>
                    <Stack.Screen
                      name="Inventory"
                      component={InventoryScreen}
                      options={{ title: 'Nevera' }}
                    />
                    <Stack.Screen
                      name="Shopping"
                      component={ShoppingListScreen}
                      options={{ title: 'Lista de compras' }}
                    />
                    <Stack.Screen
                      name="SavedLists"
                      component={SavedListsScreen}
                      options={{ title: 'Listas guardadas' }}
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
                      name="ThemeSettings"
                      component={ThemeSettingsScreen}
                      options={{ title: 'Tema de colores' }}
                    />
                    <Stack.Screen
                      name="UnitSettings"
                      component={UnitSettingsScreen}
                      options={{ title: 'Tipos de unidad' }}
                    />
                    <Stack.Screen
                      name="CurrencySettings"
                      component={CurrencySettingsScreen}
                      options={{ title: 'Tipo de Moneda' }}
                    />
                    <Stack.Screen
                      name="LocationSettings"
                      component={LocationSettingsScreen}
                      options={{ title: 'Gestión de ubicación' }}
                    />
                    <Stack.Screen
                      name="UserData"
                      component={UserDataScreen}
                      options={{ title: 'Datos de usuario' }}
                    />
                    </Stack.Navigator>
                  </NavigationContainer>
                </RecipeProvider>
              </ShoppingProvider>
            </SavedListsProvider>
            </InventoryProvider>
            </LocationsProvider>
          </UnitsProvider>
        </CurrencyProvider>
        </CustomFoodsProvider>
        </DefaultFoodsProvider>
      </CategoriesProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
