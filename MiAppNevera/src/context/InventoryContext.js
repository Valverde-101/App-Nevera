import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import foods from '../../assets/foods.json';
import {getFoodIcon, getFoodCategory} from '../foodIcons';

const InventoryContext = createContext();

export const InventoryProvider = ({children}) => {
  const [inventory, setInventory] = useState({fridge: [], freezer: [], pantry: []});

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
          setInventory(attachIcons(JSON.parse(stored)));
        } else {
          setInventory(attachIcons(foods));
        }
      } catch (e) {
        console.error('Failed to load inventory', e);
      }
    })();
  }, []);

  const persist = async (data) => {
    setInventory(data);
    try {
      await AsyncStorage.setItem('inventory', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save inventory', e);
    }
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
    const updated = {
      ...inventory,
      [category]: [...inventory[category], newItem],
    };
    persist(updated);
  };

  const updateItem = (
    oldCategory,
    index,
    {location, quantity, unit, registered, expiration, note},
  ) => {
    const item = inventory[oldCategory][index];
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
      const updatedCategory = inventory[oldCategory].map((it, idx) =>
        idx === index ? updatedItem : it,
      );
      persist({...inventory, [oldCategory]: updatedCategory});
    } else {
      const removedOld = inventory[oldCategory].filter((_, idx) => idx !== index);
      const addedNew = [...inventory[newCategory], updatedItem];
      persist({...inventory, [oldCategory]: removedOld, [newCategory]: addedNew});
    }
  };

  const updateQuantity = (category, index, delta) => {
    const updatedCategory = inventory[category].map((item, idx) =>
      idx === index
        ? {...item, quantity: Math.max(0, item.quantity + delta)}
        : item,
    );
    persist({...inventory, [category]: updatedCategory});
  };

  const removeItem = (category, index) => {
    const updatedCategory = inventory[category].filter((_, idx) => idx !== index);
    persist({...inventory, [category]: updatedCategory});
  };

  return (
    <InventoryContext.Provider value={{inventory, addItem, updateItem, updateQuantity, removeItem}}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);
