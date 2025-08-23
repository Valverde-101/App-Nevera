import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const currencyOptions = [
  { key: 'sol', label: 'Sol', symbol: 'S/' },
  { key: 'dollar', label: 'Dólar', symbol: '$' },
  { key: 'euro', label: 'Euro', symbol: '€' },
  { key: 'yen', label: 'Yen/Yuan', symbol: '¥' },
  { key: 'peso', label: 'Peso', symbol: '$' },
];

const CurrencyContext = createContext({
  currency: currencyOptions[0],
  currencyKey: 'sol',
  setCurrencyKey: () => {},
});

export const CurrencyProvider = ({ children }) => {
  const [currencyKey, setCurrencyKey] = useState('sol');

  useEffect(() => {
    AsyncStorage.getItem('currency').then(stored => {
      if (stored && currencyOptions.some(c => c.key === stored)) {
        setCurrencyKey(stored);
      }
    }).catch(e => {
      console.error('Failed to load currency', e);
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('currency', currencyKey).catch(e => {
      console.error('Failed to save currency', e);
    });
  }, [currencyKey]);

  const currency = useMemo(
    () => currencyOptions.find(c => c.key === currencyKey) || currencyOptions[0],
    [currencyKey],
  );

  const value = useMemo(
    () => ({ currency, currencyKey, setCurrencyKey }),
    [currency, currencyKey],
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext).currency;
export const useCurrencyController = () => useContext(CurrencyContext);

export default CurrencyContext;

