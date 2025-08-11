import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import foods from '../../assets/foods.json';
import {getFoodIcon, getFoodCategory} from '../foodIcons';
import { useLocations } from './LocationsContext';

const InventoryContext = createContext();

export const InventoryProvider = ({children}) => {
  const { locations } = useLocations();

  const buildEmpty = () => {
    const obj = {};
    locations.forEach(loc => {
      obj[loc.key] = [];
    });
    return obj;
  };

  const [inventory, setInventory] = useState(buildEmpty());

  function attachIcons(data) {
    const withIcons = {};
    Object.keys(data).forEach(cat => {
      withIcons[cat] = data[cat].map(item => ({
        ...item,
        icon: getFoodIcon(item.name),
        foodCategory: getFoodCategory(item.name),
      }));
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
  }, [locations]);

  useEffect(() => {
    setInventory(prev => {
      const updated = { ...prev };
      let changed = false;
      locations.forEach(loc => {
        if (!updated[loc.key]) {
          updated[loc.key] = [];
          changed = true;
        }
      });
      return changed ? updated : prev;
    });
  }, [locations]);

  const persist = updater => {
    setInventory(prev => {
      const data = typeof updater === 'function' ? updater(prev) : updater;
      AsyncStorage.setItem('inventory', JSON.stringify(data)).catch(e => {
        console.error('Failed to save inventory', e);
      });
      return data;
    });
  };

  const addItem = (
    category,
    name,
    quantity = 1,
    unit = 'units',
    registered = '',
    expiration = '',
    note = '',
  ) => {
    const icon = getFoodIcon(name);
    const foodCategory = getFoodCategory(name);
    const newItem = {
      name,
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
  };

  const updateItem = (
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
  };

  const updateQuantity = (category, index, delta) => {
    persist(prev => {
      const updatedCategory = prev[category].map((item, idx) =>
        idx === index
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item,
      );
      return { ...prev, [category]: updatedCategory };
    });
  };

  const removeItem = (category, index) => {
    persist(prev => {
      const updatedCategory = prev[category].filter((_, idx) => idx !== index);
      return { ...prev, [category]: updatedCategory };
    });
  };

  return (
    <InventoryContext.Provider value={{inventory, addItem, updateItem, updateQuantity, removeItem}}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);
