import React, {createContext, useContext, useEffect, useState, useCallback, useMemo} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import foods from '../../assets/foods.json';
import {getFoodIcon, getFoodCategory, getFoodInfo} from '../foodIcons';
import { useDefaultFoods } from './DefaultFoodsContext';
import { useLocations } from './LocationsContext';
import { useCustomFoods } from './CustomFoodsContext';

const InventoryContext = createContext();

export const InventoryProvider = ({children}) => {
  const { locations } = useLocations();
  const { customFoods } = useCustomFoods();
  const { overrides } = useDefaultFoods();

  const buildEmpty = useCallback(() => {
    const obj = {};
    locations.forEach(loc => {
      obj[loc.key] = [];
    });
    return obj;
  }, [locations]);

  const [inventory, setInventory] = useState(buildEmpty);

  function attachIcons(data) {
    const withIcons = {};
    Object.keys(data).forEach(cat => {
      withIcons[cat] = data[cat].map(item => {
        const key = item.name;
        const info = getFoodInfo(key);
        return {
          ...item,
          key,
          name: info?.name || key,
          icon: getFoodIcon(key),
          foodCategory: getFoodCategory(key),
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
    // refresh names/icons when default overrides change
    persist(prev => {
      const updated = {};
      Object.keys(prev).forEach(cat => {
        updated[cat] = prev[cat].map(item => {
          const key = item.key || item.name;
          const info = getFoodInfo(key);
          return {
            ...item,
            key,
            name: info?.name || key,
            icon: getFoodIcon(key),
          };
        });
      });
      return updated;
    });
  }, [overrides, persist]);

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
      const raw = {};
      Object.keys(data).forEach(cat => {
        raw[cat] = data[cat].map(({ key, name, icon, foodCategory, ...rest }) => ({
          ...rest,
          name: key || name,
        }));
      });
      AsyncStorage.setItem('inventory', JSON.stringify(raw)).catch(e => {
        console.error('Failed to save inventory', e);
      });
      return data;
    });
  }, []);

  const addItem = useCallback((
    category,
    key,
    quantity = 1,
    unit = 'units',
    registered = '',
    expiration = '',
    note = '',
  ) => {
    const info = getFoodInfo(key);
    const icon = getFoodIcon(key);
    const foodCategory = getFoodCategory(key);
    const newItem = {
      key,
      name: info?.name || key,
      quantity,
      unit,
      icon,
      registered,
      expiration,
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

  const resetInventory = useCallback(() => {
    const initial = { ...buildEmpty(), ...attachIcons(foods) };
    AsyncStorage.removeItem('inventory').catch(e => {
      console.error('Failed to clear inventory', e);
    });
    setInventory(initial);
  }, [buildEmpty]);

  const value = useMemo(
    () => ({inventory, addItem, updateItem, updateQuantity, removeItem, resetInventory}),
    [inventory, addItem, updateItem, updateQuantity, removeItem, resetInventory],
  );

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);
