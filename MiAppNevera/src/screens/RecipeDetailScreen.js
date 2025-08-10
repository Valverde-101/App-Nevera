import React, {useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Button,
  TouchableWithoutFeedback,
} from 'react-native';
import {useRecipes} from '../context/RecipeContext';
import {useInventory} from '../context/InventoryContext';
import {useShopping} from '../context/ShoppingContext';
import AddRecipeModal from '../components/AddRecipeModal';
import {
  getFoodIcon,
  getFoodCategory,
  categories as foodCategories,
} from '../foodIcons';

export default function RecipeDetailScreen({route, navigation}) {
  const {index} = route.params;
  const {recipes, updateRecipe} = useRecipes();
  const {inventory} = useInventory();
  const {addItems} = useShopping();
  const recipe = recipes[index];
  const [editVisible, setEditVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

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
              if (missing.length > 0) {
                setConfirmVisible(true);
              }
            }}
          >
            <Text style={{fontSize:24}}>🛒</Text>
          </TouchableOpacity>
        </View>
      ),
      title: recipe ? recipe.name : 'Receta',
    });
  }, [navigation, missing, recipe]);

  const handleAddMissing = () => {
    const items = missing.map(ing => ({
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
    }));
    if (items.length > 0) addItems(items);
    setConfirmVisible(false);
  };

  const groupedIngredients = recipe
    ? recipe.ingredients.reduce((acc, ing) => {
        const cat = getFoodCategory(ing.name) || 'otros';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(ing);
        return acc;
      }, {})
    : {};

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
        {Object.entries(groupedIngredients).map(([cat, items]) => (
          <View key={cat} style={{marginTop:5}}>
            <View style={{flexDirection:'row',alignItems:'center'}}>
              {foodCategories[cat]?.icon && (
                <Image
                  source={foodCategories[cat].icon}
                  style={{width:20,height:20,marginRight:5}}
                />
              )}
              <Text style={{fontWeight:'bold',textTransform:'capitalize'}}>{cat}</Text>
            </View>
            {items.map((ing, idx) => (
              <View
                key={idx}
                style={{flexDirection:'row',alignItems:'center',marginLeft:10}}>
                {(ing.icon || getFoodIcon(ing.name)) && (
                  <Image
                    source={ing.icon || getFoodIcon(ing.name)}
                    style={{width:20,height:20,marginRight:5}}
                  />
                )}
                <Text>
                  {ing.quantity} {ing.unit} {ing.name}
                </Text>
              </View>
            ))}
          </View>
        ))}
        <Text style={{marginTop:10,fontWeight:'bold'}}>Pasos</Text>
        <Text>{recipe.steps}</Text>
      </ScrollView>
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setConfirmVisible(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.3)',
            }}
          >
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor: '#fff',
                  padding: 20,
                  borderRadius: 8,
                  maxHeight: '80%',
                  width: '80%',
                }}
              >
                <Text style={{marginBottom:10}}>
                  ¿Quieres añadir los siguientes ingredientes a la lista de compras?
                </Text>
                <ScrollView style={{marginBottom:10}}>
                  {missing.map((ing, idx) => (
                    <View
                      key={idx}
                      style={{
                        flexDirection:'row',
                        alignItems:'center',
                        borderWidth:1,
                        borderColor:'#ccc',
                        padding:5,
                        marginBottom:5,
                        borderRadius:4,
                      }}
                    >
                      {(ing.icon || getFoodIcon(ing.name)) && (
                        <Image
                          source={ing.icon || getFoodIcon(ing.name)}
                          style={{width:30,height:30,marginRight:10}}
                        />
                      )}
                      <Text>
                        {ing.name} - {ing.quantity} {ing.unit}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
                <View style={{flexDirection:'row',justifyContent:'space-around'}}>
                  <Button title="Cancelar" onPress={() => setConfirmVisible(false)} />
                  <Button title="Añadir" onPress={handleAddMissing} />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
