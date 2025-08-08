import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import CategoryScreen from './src/screens/CategoryScreen';
import ShoppingListScreen from './src/screens/ShoppingListScreen';
import { InventoryProvider } from './src/context/InventoryContext';
import { ShoppingProvider } from './src/context/ShoppingContext';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <InventoryProvider>
      <ShoppingProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="Fridge"
              component={CategoryScreen}
              initialParams={{ category: 'fridge' }}
              options={{ title: 'Nevera' }}
            />
            <Stack.Screen
              name="Freezer"
              component={CategoryScreen}
              initialParams={{ category: 'freezer' }}
              options={{ title: 'Congelador' }}
            />
            <Stack.Screen
              name="Pantry"
              component={CategoryScreen}
              initialParams={{ category: 'pantry' }}
              options={{ title: 'Despensa' }}
            />
            <Stack.Screen name="Shopping" component={ShoppingListScreen} options={{ title: 'Compras' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </ShoppingProvider>
    </InventoryProvider>
  );
}
