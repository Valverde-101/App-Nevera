import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultLocations = [
  { key: 'fridge', name: 'Nevera', icon: '🥶', active: true },
  { key: 'freezer', name: 'Congelador', icon: '❄️', active: true },
  { key: 'pantry', name: 'Despensa', icon: '🗃️', active: true },
];

const LocationsContext = createContext();

export const LocationsProvider = ({ children }) => {
  const [locations, setLocations] = useState(defaultLocations);

  useEffect(() => {
    AsyncStorage.getItem('locations').then(stored => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLocations(parsed);
          }
        } catch (e) {
          console.error('Failed to parse locations', e);
        }
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('locations', JSON.stringify(locations)).catch(e => {
      console.error('Failed to save locations', e);
    });
  }, [locations]);

  const addLocation = useCallback((name, icon) => {
    const key = name.toLowerCase();
    setLocations(prev => [...prev, { key, name, icon, active: true }]);
  }, []);

  const updateLocation = useCallback((key, name, icon) => {
    setLocations(prev => prev.map(l => (l.key === key ? { ...l, name, icon } : l)));
  }, []);

  const removeLocation = useCallback(key => {
    setLocations(prev => prev.filter(l => l.key !== key));
  }, []);

  const toggleActive = useCallback(key => {
    setLocations(prev => prev.map(l => (l.key === key ? { ...l, active: !l.active } : l)));
  }, []);

  const value = useMemo(
    () => ({ locations, addLocation, updateLocation, removeLocation, toggleActive }),
    [locations, addLocation, updateLocation, removeLocation, toggleActive],
  );

  return (
    <LocationsContext.Provider value={value}>
      {children}
    </LocationsContext.Provider>
  );
};

export const useLocations = () => useContext(LocationsContext);
