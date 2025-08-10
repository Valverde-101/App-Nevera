import React, {useLayoutEffect, useState} from 'react';
import {View, Text, ScrollView, Image, TouchableOpacity} from 'react-native';
import {useRecipes} from '../context/RecipeContext';
import {useInventory} from '../context/InventoryContext';
import AddRecipeModal from '../components/AddRecipeModal';

export default function RecipeBookScreen({navigation}) {
  const {recipes, addRecipe} = useRecipes();
  const {inventory} = useInventory();
  const [addVisible, setAddVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setAddVisible(true)}>
          <Text style={{fontSize:24}}>＋</Text>
        </TouchableOpacity>
      ),
      title: 'Recetario',
    });
  }, [navigation]);

  const hasIngredients = recipe => {
    return recipe.ingredients.every(ing => {
      const available = ['fridge','freezer','pantry'].reduce((sum, loc) => {
        const item = inventory[loc].find(it => it.name === ing.name);
        return sum + (item ? item.quantity : 0);
      },0);
      return available >= ing.quantity;
    });
  };

  return (
    <View style={{flex:1,padding:10}}>
      <ScrollView contentContainerStyle={{flexDirection:'row',flexWrap:'wrap'}}>
        {recipes.map((rec, idx) => {
          const enough = hasIngredients(rec);
          return (
            <TouchableOpacity
              key={idx}
              style={{width:'50%',padding:5,opacity:enough?1:0.5}}
              onPress={() => navigation.navigate('RecipeDetail',{index: idx})}
            >
              {rec.image ? (
                <Image source={{uri:rec.image}} style={{width:'100%',height:100}} />
              ) : (
                <View style={{width:'100%',height:100,backgroundColor:'#ccc',justifyContent:'center',alignItems:'center'}}>
                  <Text>Sin imagen</Text>
                </View>
              )}
              <Text style={{fontWeight:'bold'}}>{rec.name}</Text>
              <Text>Para {rec.persons} personas</Text>
              <Text>Dificultad: {rec.difficulty}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <AddRecipeModal
        visible={addVisible}
        onSave={recipe => {
          addRecipe(recipe);
          setAddVisible(false);
        }}
        onClose={() => setAddVisible(false)}
      />
    </View>
  );
}
