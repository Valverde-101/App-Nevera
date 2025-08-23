import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const currencyOptions = [
  { key: 'sol', labelKey: 'currency.sol', symbol: 'S/' },
  { key: 'dollar', labelKey: 'currency.dollar', symbol: '$' },
  { key: 'euro', labelKey: 'currency.euro', symbol: '€' },
  { key: 'yen', labelKey: 'currency.yen', symbol: '¥' },
  { key: 'peso', labelKey: 'currency.peso', symbol: '$' },
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

