import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FoodScreen from './src/screens/FoodScreen';
import ShoppingScreen from './src/screens/ShoppingScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Nevera">
          {() => <FoodScreen category="nevera" />}
        </Tab.Screen>
        <Tab.Screen name="Congelador">
          {() => <FoodScreen category="congelador" />}
        </Tab.Screen>
        <Tab.Screen name="Despensa">
          {() => <FoodScreen category="despensa" />}
        </Tab.Screen>
        <Tab.Screen name="Compras" component={ShoppingScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
