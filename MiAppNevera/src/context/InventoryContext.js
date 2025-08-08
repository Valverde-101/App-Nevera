import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import foods from '../../assets/foods.json';

const InventoryContext = createContext();

export const InventoryProvider = ({children}) => {
  const [inventory, setInventory] = useState({fridge: [], freezer: [], pantry: []});

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('inventory');
        if (stored) {
          setInventory(JSON.parse(stored));
        } else {
          setInventory(foods);
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

  const addItem = (category, name, quantity = 1, unit = 'units') => {
    const newItem = {name, quantity, unit};
    const updated = {...inventory, [category]: [...inventory[category], newItem]};
    persist(updated);
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
    <InventoryContext.Provider value={{inventory, addItem, updateQuantity, removeItem}}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);
