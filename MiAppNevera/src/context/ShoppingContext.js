import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getFoodIcon, getFoodCategory} from '../foodIcons';
import { useCustomFoods } from './CustomFoodsContext';

const ShoppingContext = createContext();

export const ShoppingProvider = ({children}) => {
  const [list, setList] = useState([]);
  const { customFoods } = useCustomFoods();

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
  }, [customFoods]);

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

  const addItems = items => {
    const newItems = items.map(({name, quantity = 1, unit = 'units'}) => ({
      name,
      quantity,
      unit,
      icon: getFoodIcon(name),
      foodCategory: getFoodCategory(name),
      purchased: false,
    }));
    persist([...list, ...newItems]);
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

  const removeItems = (indices) => {
    const set = new Set(indices);
    const updated = list.filter((_, idx) => !set.has(idx));
    persist(updated);
  };

  const markPurchased = (indices) => {
    const set = new Set(indices);
    const updated = list.map((item, idx) =>
      set.has(idx) ? {...item, purchased: true} : item,
    );
    persist(updated);
  };

  return (
    <ShoppingContext.Provider
      value={{list, addItem, addItems, togglePurchased, removeItem, removeItems, markPurchased}}
    >
      {children}
    </ShoppingContext.Provider>
  );
};

export const useShopping = () => useContext(ShoppingContext);
