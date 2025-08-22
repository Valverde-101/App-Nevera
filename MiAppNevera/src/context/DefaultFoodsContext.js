import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setDefaultFoodsMap } from '../foodIcons';

const DefaultFoodsContext = createContext();

export const DefaultFoodsProvider = ({ children }) => {
  const [overrides, setOverrides] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem('defaultFoodOverrides').then(stored => {
      const parsed = stored ? JSON.parse(stored) : [];
      setOverrides(parsed);
      setDefaultFoodsMap(parsed);
    });
  }, []);

  const persist = useCallback(updater => {
    setOverrides(prev => {
      const data = typeof updater === 'function' ? updater(prev) : updater;
      AsyncStorage.setItem('defaultFoodOverrides', JSON.stringify(data)).catch(e => {
        console.error('Failed to save default food overrides', e);
      });
      setDefaultFoodsMap(data);
      return data;
    });
  }, []);

  const updateOverride = useCallback((key, data) => {
    persist(prev => {
      const filtered = prev.filter(f => f.key !== key);
      return [...filtered, { key, ...data }];
    });
  }, [persist]);

  const value = useMemo(() => ({ overrides, updateOverride }), [overrides, updateOverride]);

  return (
    <DefaultFoodsContext.Provider value={value}>
      {children}
    </DefaultFoodsContext.Provider>
  );
};

export const useDefaultFoods = () => useContext(DefaultFoodsContext);
