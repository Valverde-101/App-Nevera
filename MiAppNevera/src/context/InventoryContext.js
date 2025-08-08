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

  const addItem = (category, item) => {
    const updated = {...inventory, [category]: [...inventory[category], item]};
    persist(updated);
  };

  return (
    <InventoryContext.Provider value={{inventory, addItem}}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);
