import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SavedListsContext = createContext();

export const SavedListsProvider = ({ children }) => {
  const [savedLists, setSavedLists] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('savedLists');
        if (stored) setSavedLists(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load saved lists', e);
      }
    })();
  }, []);

  const persist = useCallback(updater => {
    setSavedLists(prev => {
      const data = typeof updater === 'function' ? updater(prev) : updater;
      AsyncStorage.setItem('savedLists', JSON.stringify(data)).catch(err => {
        console.error('Failed to save lists', err);
      });
      return data;
    });
  }, []);

  const saveList = useCallback((name, note, items, id = null) => {
    const entry = { id: id ?? Date.now().toString(), name, note, items };
    persist(prev => {
      const idx = prev.findIndex(l => l.id === entry.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = entry;
        return copy;
      }
      return [...prev, entry];
    });
  }, [persist]);

  const deleteList = useCallback(id => {
    persist(prev => prev.filter(l => l.id !== id));
  }, [persist]);

  const value = useMemo(() => ({ savedLists, saveList, deleteList }), [savedLists, saveList, deleteList]);

  return (
    <SavedListsContext.Provider value={value}>
      {children}
    </SavedListsContext.Provider>
  );
};

export const useSavedLists = () => useContext(SavedListsContext);

