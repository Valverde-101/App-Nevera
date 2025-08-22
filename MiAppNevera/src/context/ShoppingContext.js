import React, {createContext, useContext, useEffect, useState, useCallback, useMemo} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getFoodIcon, getFoodCategory, getFoodInfo} from '../foodIcons';
import { useCustomFoods } from './CustomFoodsContext';
import { useDefaultFoods } from './DefaultFoodsContext';

const ShoppingContext = createContext();

export const ShoppingProvider = ({children}) => {
  const [list, setList] = useState([]);
  const { customFoods } = useCustomFoods();
  const { overrides } = useDefaultFoods();

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('shopping');
        if (stored) {
          const parsed = JSON.parse(stored).map(item => {
            const key = item.key || item.name;
            const info = getFoodInfo(key);
            return {
              ...item,
              key,
              name: info?.name || key,
              icon: item.icon || getFoodIcon(key),
              foodCategory: item.foodCategory || getFoodCategory(key),
              unitPrice: item.unitPrice || 0,
              totalPrice: item.totalPrice || 0,
            };
          });
          setList(parsed);
        }
      } catch (e) {
        console.error('Failed to load shopping list', e);
      }
    })();
  }, [customFoods]);

  useEffect(() => {
    // update names when default overrides change
    persist(prev =>
      prev.map(item => {
        const key = item.key || item.name;
        const info = getFoodInfo(key);
        return {
          ...item,
          key,
          name: info?.name || key,
          icon: getFoodIcon(key),
        };
      }),
    );
  }, [overrides, persist]);

  const persist = useCallback(updater => {
    setList(prev => {
      const data = typeof updater === 'function' ? updater(prev) : updater;
      const raw = data.map(({ key, name, icon, foodCategory, ...rest }) => ({
        ...rest,
        name: key || name,
      }));
      AsyncStorage.setItem('shopping', JSON.stringify(raw)).catch(e => {
        console.error('Failed to save shopping list', e);
      });
      return data;
    });
  }, []);

  const addItem = useCallback((key, quantity = 1, unit = 'units', unitPrice = 0, totalPrice = 0) => {
    const uPrice = unitPrice || (quantity ? totalPrice / quantity : 0);
    const tPrice = totalPrice || uPrice * quantity;
    const info = getFoodInfo(key);
    const newItem = {
      key,
      name: info?.name || key,
      quantity,
      unit,
      unitPrice: uPrice,
      totalPrice: tPrice,
      icon: getFoodIcon(key),
      foodCategory: getFoodCategory(key),
      purchased: false,
    };
    persist(prev => [...prev, newItem]);
  }, [persist]);

  const addItems = useCallback(items => {
    const newItems = items.map(({name: key, quantity = 1, unit = 'units', unitPrice = 0, totalPrice = 0}) => {
      const uPrice = unitPrice || (quantity ? totalPrice / quantity : 0);
      const tPrice = totalPrice || uPrice * quantity;
      const info = getFoodInfo(key);
      return {
        key,
        name: info?.name || key,
        quantity,
        unit,
        unitPrice: uPrice,
        totalPrice: tPrice,
        icon: getFoodIcon(key),
        foodCategory: getFoodCategory(key),
        purchased: false,
      };
    });
    persist(prev => [...prev, ...newItems]);
  }, [persist]);

  const editItem = useCallback((index, quantity = 1, unit = 'units', unitPrice = 0, totalPrice = 0) => {
    const uPrice = unitPrice || (quantity ? totalPrice / quantity : 0);
    const tPrice = totalPrice || uPrice * quantity;
    persist(prev => prev.map((item, idx) =>
      idx === index ? { ...item, quantity, unit, unitPrice: uPrice, totalPrice: tPrice } : item,
    ));
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
    persist(() => items.map(it => {
      const key = it.key || it.name;
      const info = getFoodInfo(key);
      return {
        ...it,
        key,
        name: info?.name || key,
        icon: it.icon || getFoodIcon(key),
        foodCategory: it.foodCategory || getFoodCategory(key),
        unitPrice: it.unitPrice || 0,
        totalPrice: it.totalPrice || 0,
        purchased: !!it.purchased,
      };
    }));
  }, [persist]);

  const resetShopping = useCallback(() => {
    setList([]);
    AsyncStorage.removeItem('shopping').catch(e => {
      console.error('Failed to clear shopping list', e);
    });
  }, []);

  const value = useMemo(
    () => ({list, addItem, addItems, editItem, togglePurchased, removeItem, removeItems, markPurchased, resetShopping, replaceList}),
    [list, addItem, addItems, editItem, togglePurchased, removeItem, removeItems, markPurchased, resetShopping, replaceList],
  );

  return (
    <ShoppingContext.Provider value={value}>
      {children}
    </ShoppingContext.Provider>
  );
};

export const useShopping = () => useContext(ShoppingContext);
