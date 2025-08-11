import React, { createContext, useContext, useEffect, useState } from 'react';
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

  const addUnit = (singular, plural) => {
    const key = plural.toLowerCase();
    setUnits(prev => [...prev, { key, singular, plural }]);
  };

  const removeUnit = key => {
    setUnits(prev => prev.filter(u => u.key !== key));
  };

  const getLabel = (quantity, key) => {
    const unit = units.find(u => u.key === key);
    if (!unit) return key;
    return Number(quantity) === 1 ? unit.singular : unit.plural;
  };

  return (
    <UnitsContext.Provider value={{ units, addUnit, removeUnit, getLabel }}>
      {children}
    </UnitsContext.Provider>
  );
};

export const useUnits = () => useContext(UnitsContext);
