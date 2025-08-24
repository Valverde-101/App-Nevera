import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from './LanguageContext';
import esDefaults from '../locales/es/defaults.json';
import enDefaults from '../locales/en/defaults.json';

const baseLocations = [
  { key: 'fridge', icon: '🥶', active: true },
  { key: 'freezer', icon: '❄️', active: true },
  { key: 'pantry', icon: '🗃️', active: true },
];

const defaultLocations = baseLocations.map(l => ({
  ...l,
  name: { es: esDefaults.locations[l.key], en: enDefaults.locations[l.key] },
}));

const LocationsContext = createContext();

export const LocationsProvider = ({ children }) => {
  const { lang } = useLanguage();
  const [locations, setLocations] = useState(defaultLocations);

  useEffect(() => {
    AsyncStorage.getItem('locations').then(stored => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const upgraded = parsed.map(l => ({
              ...l,
              name: typeof l.name === 'string' ? { es: l.name, en: l.name } : l.name,
            }));
            setLocations(upgraded);
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
    setLocations(prev => [
      ...prev,
      { key, name: { es: name, en: name }, icon, active: true },
    ]);
  }, []);

  const updateLocation = useCallback((key, name, icon) => {
    setLocations(prev =>
      prev.map(l =>
        l.key === key ? { ...l, name: { es: name, en: name }, icon } : l,
      ),
    );
  }, []);

  const removeLocation = useCallback(key => {
    setLocations(prev => prev.filter(l => l.key !== key));
  }, []);

  const toggleActive = useCallback(key => {
    setLocations(prev => prev.map(l => (l.key === key ? { ...l, active: !l.active } : l)));
  }, []);

  const resetLocations = useCallback(() => {
    setLocations(defaultLocations);
    AsyncStorage.removeItem('locations').catch(e => {
      console.error('Failed to clear locations', e);
    });
  }, []);

  const localizedLocations = useMemo(
    () =>
      locations.map(l => ({
        ...l,
        name: typeof l.name === 'string' ? l.name : l.name[lang] || l.name.es,
      })),
    [locations, lang],
  );

  const value = useMemo(
    () => ({ locations: localizedLocations, addLocation, updateLocation, removeLocation, toggleActive, resetLocations }),
    [localizedLocations, addLocation, updateLocation, removeLocation, toggleActive, resetLocations],
  );

  return (
    <LocationsContext.Provider value={value}>
      {children}
    </LocationsContext.Provider>
  );
};

export const useLocations = () => useContext(LocationsContext);
