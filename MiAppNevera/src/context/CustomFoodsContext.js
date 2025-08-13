import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeFoodName, setCustomFoodsMap } from '../foodIcons';

const CustomFoodsContext = createContext();

export const CustomFoodsProvider = ({ children }) => {
  const [customFoods, setCustomFoods] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('customFoods');
        const parsed = stored ? JSON.parse(stored) : [];
        setCustomFoods(parsed);
        setCustomFoodsMap(parsed);
      } catch (e) {
        console.error('Failed to load custom foods', e);
      }
    })();
  }, []);

  const persist = useCallback(updater => {
    setCustomFoods(prev => {
      const data = typeof updater === 'function' ? updater(prev) : updater;
      AsyncStorage.setItem('customFoods', JSON.stringify(data)).catch(e => {
        console.error('Failed to save custom foods', e);
      });
      setCustomFoodsMap(data);
      return data;
    });
  }, []);

  const addCustomFood = useCallback(({ name, category, icon, baseIcon }) => {
    const key = normalizeFoodName(name);
    const newFood = { name, category, icon: icon || null, baseIcon: baseIcon || null, key };
    persist(prev => [...prev, newFood]);
  }, [persist]);

  const updateCustomFood = useCallback((key, { name, category, icon, baseIcon }) => {
    const newKey = normalizeFoodName(name);
    persist(prev => prev.map(f =>
      f.key === key ? { name, category, icon: icon || null, baseIcon: baseIcon || null, key: newKey } : f,
    ));
  }, [persist]);

  const removeCustomFood = useCallback(key => {
    persist(prev => prev.filter(f => f.key !== key));
  }, [persist]);

  const resetCustomFoods = useCallback(() => {
    setCustomFoods([]);
    setCustomFoodsMap([]);
    AsyncStorage.removeItem('customFoods').catch(e => {
      console.error('Failed to clear custom foods', e);
    });
  }, []);

  const value = useMemo(
    () => ({ customFoods, addCustomFood, updateCustomFood, removeCustomFood, resetCustomFoods }),
    [customFoods, addCustomFood, updateCustomFood, removeCustomFood, resetCustomFoods],
  );

  return (
    <CustomFoodsContext.Provider value={value}>
      {children}
    </CustomFoodsContext.Provider>
  );
};

export const useCustomFoods = () => useContext(CustomFoodsContext);

