import React, { createContext, useContext, useEffect, useState } from 'react';
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

  const persist = data => {
    setCustomFoods(data);
    AsyncStorage.setItem('customFoods', JSON.stringify(data)).catch(e => {
      console.error('Failed to save custom foods', e);
    });
    setCustomFoodsMap(data);
  };

  const addCustomFood = ({ name, category, icon, baseIcon }) => {
    const key = normalizeFoodName(name);
    const newFood = { name, category, icon: icon || null, baseIcon: baseIcon || null, key };
    persist([...customFoods, newFood]);
  };

  const updateCustomFood = (key, { name, category, icon, baseIcon }) => {
    const newKey = normalizeFoodName(name);
    const updated = customFoods.map(f =>
      f.key === key ? { name, category, icon: icon || null, baseIcon: baseIcon || null, key: newKey } : f,
    );
    persist(updated);
  };

  const removeCustomFood = key => {
    persist(customFoods.filter(f => f.key !== key));
  };

  return (
    <CustomFoodsContext.Provider value={{ customFoods, addCustomFood, updateCustomFood, removeCustomFood }}>
      {children}
    </CustomFoodsContext.Provider>
  );
};

export const useCustomFoods = () => useContext(CustomFoodsContext);

