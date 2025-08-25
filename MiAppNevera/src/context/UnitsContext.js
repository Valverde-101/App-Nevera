import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultUnits = [
  { key: 'units', singular: 'Unidad', plural: 'Unidades' },
  { key: 'kg', singular: 'Kilo', plural: 'Kilos' },
  { key: 'l', singular: 'Litro', plural: 'Litros' },
];

const UnitsContext = createContext();

export const UnitsProvider = ({ children }) => {
  const [units, setUnits] = useState(defaultUnits);

  useEffect(() => {
    AsyncStorage.getItem('units').then(stored => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setUnits(parsed);
          }
        } catch (e) {
          console.error('Failed to parse units', e);
        }
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('units', JSON.stringify(units)).catch(e => {
      console.error('Failed to save units', e);
    });
  }, [units]);

  const addUnit = useCallback((singular, plural) => {
    const key = plural.toLowerCase();
    setUnits(prev => [...prev, { key, singular, plural }]);
  }, []);

  const updateUnit = useCallback((key, singular, plural) => {
    setUnits(prev => prev.map(u => (u.key === key ? { ...u, singular, plural } : u)));
  }, []);

  const removeUnit = useCallback(key => {
    setUnits(prev => prev.filter(u => u.key !== key));
  }, []);

  const getLabel = useCallback((quantity, key) => {
    const unit = units.find(u => u.key === key);
    if (!unit) return key;
    return Number(quantity) === 1 ? unit.singular : unit.plural;
  }, [units]);

  const resetUnits = useCallback(() => {
    setUnits(defaultUnits);
    AsyncStorage.removeItem('units').catch(e => {
      console.error('Failed to clear units', e);
    });
  }, []);

  const value = useMemo(
    () => ({ units, addUnit, updateUnit, removeUnit, getLabel, resetUnits }),
    [units, addUnit, updateUnit, removeUnit, getLabel, resetUnits],
  );

  return (
    <UnitsContext.Provider value={value}>
      {children}
    </UnitsContext.Provider>
  );
};

export const useUnits = () => useContext(UnitsContext);
