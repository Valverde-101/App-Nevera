import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
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
import { UnitsProvider } from './src/context/UnitsContext';
import { LocationsProvider } from './src/context/LocationsContext';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from 'react-native';
import { CustomFoodsProvider } from './src/context/CustomFoodsContext';
import { CategoriesProvider } from './src/context/CategoriesContext';

const Stack = createNativeStackNavigator();

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = [Text.defaultProps.style, { color: '#fff' }];

const AppTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#bb86fc',
    background: '#121212',
    card: '#1f1f1f',
    text: '#ffffff',
    border: '#272727',
  },
};

export default function App() {
  return (
    <CategoriesProvider>
      <CustomFoodsProvider>
        <UnitsProvider>
          <LocationsProvider>
            <InventoryProvider>
              <ShoppingProvider>
                <RecipeProvider>
                  <NavigationContainer theme={AppTheme}>
                    <StatusBar style="light" />
                    <Stack.Navigator
                      screenOptions={{
                        headerTintColor: '#fff',
                        headerTitleStyle: { color: '#fff' },
                        headerBackground: () => (
                          <LinearGradient
                            colors={['#6a00ff', '#2196f3']}
                            style={{ flex: 1 }}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                          />
                        ),
                      }}
                    >
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
