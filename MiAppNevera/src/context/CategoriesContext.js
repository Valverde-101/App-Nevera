import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { categories as defaultCategories, normalizeFoodName } from '../foodIcons';

const CategoriesContext = createContext();

export const CategoriesProvider = ({ children }) => {
  const [customCategories, setCustomCategories] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('customCategories');
        setCustomCategories(stored ? JSON.parse(stored) : []);
      } catch (e) {
        console.error('Failed to load custom categories', e);
      }
    })();
  }, []);

  const persist = useCallback(updater => {
    setCustomCategories(prev => {
      const data = typeof updater === 'function' ? updater(prev) : updater;
      AsyncStorage.setItem('customCategories', JSON.stringify(data)).catch(e => {
        console.error('Failed to save custom categories', e);
      });
      return data;
    });
  }, []);

  const addCategory = useCallback(({ name, icon }) => {
    const key = normalizeFoodName(name);
    const newCat = { key, name, icon: icon || null };
    persist(prev => [...prev, newCat]);
    return key;
  }, [persist]);

  const updateCategory = useCallback((key, { name, icon }) => {
    const newKey = normalizeFoodName(name);
    persist(prev => prev.map(cat =>
      cat.key === key ? { key: newKey, name, icon: icon || null } : cat,
    ));
  }, [persist]);

  const removeCategory = useCallback(key => {
    persist(prev => prev.filter(cat => cat.key !== key));
  }, [persist]);

  const categories = useMemo(() => {
    const base = Object.fromEntries(
      Object.entries(defaultCategories).map(([k, v]) => [k, { ...v, name: k }]),
    );
    customCategories.forEach(cat => {
      base[cat.key] = {
        icon: cat.icon ? { uri: cat.icon } : undefined,
        name: cat.name,
      };
    });
    return base;
  }, [customCategories]);

  const value = useMemo(() => ({
    categories,
    customCategories,
    addCategory,
    updateCategory,
    removeCategory,
  }), [categories, customCategories, addCategory, updateCategory, removeCategory]);

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => useContext(CategoriesContext);

