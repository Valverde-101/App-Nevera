import React, {createContext, useContext, useEffect, useState, useCallback, useMemo} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getFoodIcon} from '../foodIcons';

const RecipeContext = createContext();

export const RecipeProvider = ({children}) => {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('recipes');
        if (stored) {
          const data = JSON.parse(stored);
          const withIcons = data.map(rec => ({
            ...rec,
            ingredients: rec.ingredients.map(ing => ({
              ...ing,
              icon: ing.icon || getFoodIcon(ing.name),
            })),
          }));
          setRecipes(withIcons);
          AsyncStorage.setItem('recipes', JSON.stringify(withIcons)).catch(e => {
            console.error('Failed to save recipes', e);
          });
        }
      } catch (e) {
        console.error('Failed to load recipes', e);
      }
    })();
  }, []);

  const persist = useCallback(updater => {
    setRecipes(prev => {
      const data = typeof updater === 'function' ? updater(prev) : updater;
      AsyncStorage.setItem('recipes', JSON.stringify(data)).catch(e => {
        console.error('Failed to save recipes', e);
      });
      return data;
    });
  }, []);

  const addRecipe = useCallback(recipe => {
    const withIcons = {
      ...recipe,
      ingredients: recipe.ingredients.map(ing => ({
        ...ing,
        icon: ing.icon || getFoodIcon(ing.name),
      })),
    };
    persist(prev => [...prev, withIcons]);
  }, [persist]);

  const updateRecipe = useCallback((index, recipe) => {
    const withIcons = {
      ...recipe,
      ingredients: recipe.ingredients.map(ing => ({
        ...ing,
        icon: ing.icon || getFoodIcon(ing.name),
      })),
    };
    persist(prev => prev.map((r, idx) => (idx === index ? withIcons : r)));
  }, [persist]);

  const removeRecipe = useCallback(index => {
    persist(prev => prev.filter((_, idx) => idx !== index));
  }, [persist]);

  const value = useMemo(
    () => ({recipes, addRecipe, updateRecipe, removeRecipe}),
    [recipes, addRecipe, updateRecipe, removeRecipe],
  );

  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  );
};

export const useRecipes = () => useContext(RecipeContext);
