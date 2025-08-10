import React, {useLayoutEffect, useState} from 'react';
import {View, Text, Image, ScrollView, TouchableOpacity} from 'react-native';
import {useRecipes} from '../context/RecipeContext';
import {useInventory} from '../context/InventoryContext';
import {useShopping} from '../context/ShoppingContext';
import AddRecipeModal from '../components/AddRecipeModal';

export default function RecipeDetailScreen({route, navigation}) {
  const {index} = route.params;
  const {recipes, updateRecipe} = useRecipes();
  const {inventory} = useInventory();
  const {addItems} = useShopping();
  const recipe = recipes[index];
  const [editVisible, setEditVisible] = useState(false);

  const missing = recipe ? recipe.ingredients.filter(ing => {
    const available = ['fridge','freezer','pantry'].reduce((sum, loc) => {
      const item = inventory[loc].find(it => it.name === ing.name);
      return sum + (item ? item.quantity : 0);
    },0);
    return available < ing.quantity;
  }) : [];

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{flexDirection:'row'}}>
          <TouchableOpacity
            onPress={() => setEditVisible(true)}
            style={{marginRight:15}}>
            <Text style={{fontSize:24}}>✎</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              const items = missing.map(ing => ({
                name: ing.name,
                quantity: ing.quantity,
                unit: ing.unit,
              }));
              if (items.length > 0) addItems(items);
            }}
          >
            <Text style={{fontSize:24}}>🛒</Text>
          </TouchableOpacity>
        </View>
      ),
      title: recipe ? recipe.name : 'Receta',
    });
  }, [navigation, missing, recipe]);

  if (!recipe) {
    return (
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <Text>Receta no encontrada</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={{padding:20}}>
        {recipe.image ? (
          <Image source={{uri:recipe.image}} style={{width:'100%',height:200,marginBottom:10}} />
        ) : null}
        <Text style={{fontSize:24,fontWeight:'bold'}}>{recipe.name}</Text>
        <Text>Para {recipe.persons} personas</Text>
        <Text>Dificultad: {recipe.difficulty}</Text>
        <Text style={{marginTop:10,fontWeight:'bold'}}>Ingredientes</Text>
        {recipe.ingredients.map((ing, idx) => (
          <Text key={idx}>- {ing.quantity} {ing.unit} {ing.name}</Text>
        ))}
        <Text style={{marginTop:10,fontWeight:'bold'}}>Pasos</Text>
        <Text>{recipe.steps}</Text>
      </ScrollView>
      <AddRecipeModal
        visible={editVisible}
        initialRecipe={recipe}
        onSave={r => {
          updateRecipe(index, r);
          setEditVisible(false);
        }}
        onClose={() => setEditVisible(false)}
      />
    </>
  );
}
