import React, {createContext, useContext, useEffect, useState} from 'react';
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
          setRecipes(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load recipes', e);
      }
    })();
  }, []);

  const persist = data => {
    setRecipes(data);
    AsyncStorage.setItem('recipes', JSON.stringify(data)).catch(e => {
      console.error('Failed to save recipes', e);
    });
  };

  const addRecipe = recipe => {
    const withIcons = {
      ...recipe,
      ingredients: recipe.ingredients.map(ing => ({
        ...ing,
        icon: ing.icon || getFoodIcon(ing.name),
      })),
    };
    persist([...recipes, withIcons]);
  };

  const updateRecipe = (index, recipe) => {
    const withIcons = {
      ...recipe,
      ingredients: recipe.ingredients.map(ing => ({
        ...ing,
        icon: ing.icon || getFoodIcon(ing.name),
      })),
    };
    const updated = recipes.map((r, idx) => (idx === index ? withIcons : r));
    persist(updated);
  };

  const removeRecipe = index => {
    persist(recipes.filter((_, idx) => idx !== index));
  };

  return (
    <RecipeContext.Provider value={{recipes, addRecipe, updateRecipe, removeRecipe}}>
      {children}
    </RecipeContext.Provider>
  );
};

export const useRecipes = () => useContext(RecipeContext);
