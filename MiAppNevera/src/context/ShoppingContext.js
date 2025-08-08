import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ShoppingContext = createContext();

export const ShoppingProvider = ({children}) => {
  const [list, setList] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('shopping');
        if (stored) {
          setList(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load shopping list', e);
      }
    })();
  }, []);

  const persist = async (data) => {
    setList(data);
    try {
      await AsyncStorage.setItem('shopping', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save shopping list', e);
    }
  };

  const addItem = (item) => {
    const updated = [...list, item];
    persist(updated);
  };

  return (
    <ShoppingContext.Provider value={{list, addItem}}>
      {children}
    </ShoppingContext.Provider>
  );
};

export const useShopping = () => useContext(ShoppingContext);
