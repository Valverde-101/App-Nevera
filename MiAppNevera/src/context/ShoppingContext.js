import React, {createContext, useContext, useEffect, useState, useCallback, useMemo} from 'react';
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
            unitPrice: item.unitPrice || 0,
            totalPrice: item.totalPrice || 0,
          }));
          setList(parsed);
        }
      } catch (e) {
        console.error('Failed to load shopping list', e);
      }
    })();
  }, [customFoods]);

  const persist = useCallback(updater => {
    setList(prev => {
      const data = typeof updater === 'function' ? updater(prev) : updater;
      AsyncStorage.setItem('shopping', JSON.stringify(data)).catch(e => {
        console.error('Failed to save shopping list', e);
      });
      return data;
    });
  }, []);

  const addItem = useCallback((name, quantity = 1, unit = 'units', unitPrice = 0, totalPrice = 0) => {
    const uPrice = unitPrice || (quantity ? totalPrice / quantity : 0);
    const tPrice = totalPrice || uPrice * quantity;
    const newItem = {
      name,
      quantity,
      unit,
      unitPrice: uPrice,
      totalPrice: tPrice,
      icon: getFoodIcon(name),
      foodCategory: getFoodCategory(name),
      purchased: false,
    };
    persist(prev => [...prev, newItem]);
  }, [persist]);

  const addItems = useCallback(items => {
    const newItems = items.map(({name, quantity = 1, unit = 'units', unitPrice = 0, totalPrice = 0}) => {
      const uPrice = unitPrice || (quantity ? totalPrice / quantity : 0);
      const tPrice = totalPrice || uPrice * quantity;
      return {
        name,
        quantity,
        unit,
        unitPrice: uPrice,
        totalPrice: tPrice,
        icon: getFoodIcon(name),
        foodCategory: getFoodCategory(name),
        purchased: false,
      };
    });
    persist(prev => [...prev, ...newItems]);
  }, [persist]);

  const togglePurchased = useCallback(index => {
    persist(prev => prev.map((item, idx) =>
      idx === index ? {...item, purchased: !item.purchased} : item,
    ));
  }, [persist]);

  const removeItem = useCallback(index => {
    persist(prev => prev.filter((_, idx) => idx !== index));
  }, [persist]);

  const removeItems = useCallback(indices => {
    const set = new Set(indices);
    persist(prev => prev.filter((_, idx) => !set.has(idx)));
  }, [persist]);

  const markPurchased = useCallback(indices => {
    const set = new Set(indices);
    persist(prev => prev.map((item, idx) =>
      set.has(idx) ? {...item, purchased: true} : item,
    ));
  }, [persist]);

  // Replace entire list (used when loading saved lists)
  const replaceList = useCallback(items => {
    persist(() => items.map(it => ({
      ...it,
      icon: it.icon || getFoodIcon(it.name),
      foodCategory: it.foodCategory || getFoodCategory(it.name),
      unitPrice: it.unitPrice || 0,
      totalPrice: it.totalPrice || 0,
      purchased: !!it.purchased,
    })));
  }, [persist]);

  const resetShopping = useCallback(() => {
    setList([]);
    AsyncStorage.removeItem('shopping').catch(e => {
      console.error('Failed to clear shopping list', e);
    });
  }, []);

  const value = useMemo(
    () => ({list, addItem, addItems, togglePurchased, removeItem, removeItems, markPurchased, resetShopping, replaceList}),
    [list, addItem, addItems, togglePurchased, removeItem, removeItems, markPurchased, resetShopping, replaceList],
  );

  return (
    <ShoppingContext.Provider value={value}>
      {children}
    </ShoppingContext.Provider>
  );
};

export const useShopping = () => useContext(ShoppingContext);
