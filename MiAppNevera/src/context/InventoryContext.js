import React, {createContext, useContext, useEffect, useState, useCallback, useMemo} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import foods from '../../assets/foods.json';
import {getFoodIcon, getFoodCategory, getDefaultExpiration} from '../foodIcons';
import { useLocations } from './LocationsContext';
import { useCustomFoods } from './CustomFoodsContext';

const InventoryContext = createContext();

export const InventoryProvider = ({children}) => {
  const { locations } = useLocations();
  const { customFoods } = useCustomFoods();

  const buildEmpty = useCallback(() => {
    const obj = {};
    locations.forEach(loc => {
      obj[loc.key] = [];
    });
    return obj;
  }, [locations]);

  const [inventory, setInventory] = useState(buildEmpty);

  function attachIcons(data) {
    const today = new Date().toISOString().split('T')[0];
    const withIcons = {};
    Object.keys(data).forEach(cat => {
      withIcons[cat] = data[cat].map(item => {
        const registered = item.registered || today;
        const expiration =
          item.expiration || getDefaultExpiration(item.name, registered);
        return {
          ...item,
          icon: getFoodIcon(item.name),
          foodCategory: getFoodCategory(item.name),
          registered,
          expiration,
        };
      });
    });
    return withIcons;
  }

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('inventory');
        if (stored) {
          const data = attachIcons(JSON.parse(stored));
          setInventory(prev => ({ ...buildEmpty(), ...data }));
        } else {
          setInventory(prev => ({ ...buildEmpty(), ...attachIcons(foods) }));
        }
      } catch (e) {
        console.error('Failed to load inventory', e);
      }
    })();
  }, [locations, customFoods]);

  useEffect(() => {
    setInventory(prev => {
      const updated = {};
      locations.forEach(loc => {
        updated[loc.key] = prev[loc.key] || [];
      });
      return updated;
    });
  }, [locations]);

  const persist = useCallback(updater => {
    setInventory(prev => {
      const data = typeof updater === 'function' ? updater(prev) : updater;
      AsyncStorage.setItem('inventory', JSON.stringify(data)).catch(e => {
        console.error('Failed to save inventory', e);
      });
      return data;
    });
  }, []);

  const addItem = useCallback((
    category,
    name,
    quantity = 1,
    unit = 'units',
    registered = '',
    expiration = '',
    note = '',
  ) => {
    const reg = registered || new Date().toISOString().split('T')[0];
    const exp = expiration || getDefaultExpiration(name, reg);
    const icon = getFoodIcon(name);
    const foodCategory = getFoodCategory(name);
    const newItem = {
      name,
      quantity,
      unit,
      icon,
      registered: reg,
      expiration: exp,
      note,
      foodCategory,
    };
    persist(prev => ({
      ...prev,
      [category]: [...prev[category], newItem],
    }));
  }, [persist]);

  const updateItem = useCallback((
    oldCategory,
    index,
    {location, quantity, unit, registered, expiration, note},
  ) => {
    persist(prev => {
      const item = prev[oldCategory][index];
      const updatedItem = {
        ...item,
        quantity,
        unit,
        registered,
        expiration,
        note,
      };
      const newCategory = location;
      if (newCategory === oldCategory) {
        const updatedCategory = prev[oldCategory].map((it, idx) =>
          idx === index ? updatedItem : it,
        );
        return { ...prev, [oldCategory]: updatedCategory };
      } else {
        const removedOld = prev[oldCategory].filter((_, idx) => idx !== index);
        const addedNew = [...prev[newCategory], updatedItem];
        return {
          ...prev,
          [oldCategory]: removedOld,
          [newCategory]: addedNew,
        };
      }
    });
  }, [persist]);

  const updateQuantity = useCallback((category, index, delta) => {
    persist(prev => {
      const updatedCategory = prev[category].map((item, idx) =>
        idx === index
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item,
      );
      return { ...prev, [category]: updatedCategory };
    });
  }, [persist]);

  const removeItem = useCallback((category, index) => {
    persist(prev => {
      const updatedCategory = prev[category].filter((_, idx) => idx !== index);
      return { ...prev, [category]: updatedCategory };
    });
  }, [persist]);

  const value = useMemo(
    () => ({inventory, addItem, updateItem, updateQuantity, removeItem}),
    [inventory, addItem, updateItem, updateQuantity, removeItem],
  );

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);
