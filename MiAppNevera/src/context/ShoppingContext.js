import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getFoodIcon, getFoodCategory} from '../foodIcons';

const ShoppingContext = createContext();

export const ShoppingProvider = ({children}) => {
  const [list, setList] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('shopping');
        if (stored) {
          const parsed = JSON.parse(stored).map(item => ({
            ...item,
            icon: item.icon || getFoodIcon(item.name),
            foodCategory: item.foodCategory || getFoodCategory(item.name),
          }));
          setList(parsed);
        }
      } catch (e) {
        console.error('Failed to load shopping list', e);
      }
    })();
  }, []);

  const persist = async (data) => {
    setList(data);
    try {
      await AsyncStorage.setItem('shopping', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save shopping list', e);
    }
  };

  const addItem = (name, quantity = 1, unit = 'units') => {
    const newItem = {
      name,
      quantity,
      unit,
      icon: getFoodIcon(name),
      foodCategory: getFoodCategory(name),
      purchased: false,
    };
    persist([...list, newItem]);
  };

  const togglePurchased = (index) => {
    const updated = list.map((item, idx) =>
      idx === index ? {...item, purchased: !item.purchased} : item,
    );
    persist(updated);
  };

  const removeItem = (index) => {
    const updated = list.filter((_, idx) => idx !== index);
    persist(updated);
  };

  return (
    <ShoppingContext.Provider value={{list, addItem, togglePurchased, removeItem}}>
      {children}
    </ShoppingContext.Provider>
  );
};

export const useShopping = () => useContext(ShoppingContext);
