import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
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
import UserDataScreen from './src/screens/UserDataScreen';
import ThemeSettingsScreen from './src/screens/ThemeSettingsScreen';
import { UnitsProvider } from './src/context/UnitsContext';
import { LocationsProvider } from './src/context/LocationsContext';
import { StatusBar } from 'expo-status-bar';
import { CustomFoodsProvider } from './src/context/CustomFoodsContext';
import { CategoriesProvider } from './src/context/CategoriesContext';
import { ThemeProvider, useThemeController } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();

function MainApp() {
  const { themeName } = useThemeController();
  return (
    <CategoriesProvider>
      <CustomFoodsProvider>
        <UnitsProvider>
          <LocationsProvider>
            <InventoryProvider>
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
            </InventoryProvider>
          </LocationsProvider>
        </UnitsProvider>
      </CustomFoodsProvider>
    </CategoriesProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </AuthProvider>
  );
}
