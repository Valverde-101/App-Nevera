import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SavedListsContext = createContext();

export const SavedListsProvider = ({ children }) => {
  const [savedLists, setSavedLists] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('savedShoppingLists');
        if (stored) setSavedLists(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load saved lists', e);
      }
    })();
  }, []);

  const persist = useCallback(updater => {
    setSavedLists(prev => {
      const data = typeof updater === 'function' ? updater(prev) : updater;
      AsyncStorage.setItem('savedShoppingLists', JSON.stringify(data)).catch(e => {
        console.error('Failed to save lists', e);
      });
      return data;
    });
  }, []);

  const addList = useCallback((name, note, items) => {
    const id = Date.now().toString();
    persist(prev => [...prev, { id, name, note, items }]);
  }, [persist]);

  const updateList = useCallback((id, name, note) => {
    persist(prev => prev.map(l => l.id === id ? { ...l, name, note } : l));
  }, [persist]);

  const removeList = useCallback(id => {
    persist(prev => prev.filter(l => l.id !== id));
  }, [persist]);

  const value = useMemo(() => ({ savedLists, addList, updateList, removeList }), [savedLists, addList, updateList, removeList]);

  return (
    <SavedListsContext.Provider value={value}>
      {children}
    </SavedListsContext.Provider>
  );
};

export const useSavedLists = () => useContext(SavedListsContext);
