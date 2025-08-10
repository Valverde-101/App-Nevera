import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import FoodPickerModal from './FoodPickerModal';
import {getFoodIcon} from '../foodIcons';

export default function AddRecipeModal({
  visible,
  onSave,
  onClose,
  initialRecipe,
}) {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [persons, setPersons] = useState('1');
  const [difficulty, setDifficulty] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    if (visible && initialRecipe) {
      setName(initialRecipe.name || '');
      setImage(initialRecipe.image || '');
      setPersons(String(initialRecipe.persons || 1));
      setDifficulty(initialRecipe.difficulty || '');
      setSteps(initialRecipe.steps || '');
      setIngredients(
        initialRecipe.ingredients
          ? initialRecipe.ingredients.map(ing => ({
              name: ing.name,
              quantity: String(ing.quantity),
              unit: ing.unit,
              icon: ing.icon || getFoodIcon(ing.name),
            }))
          : [],
      );
    } else if (!visible) {
      setName('');
      setImage('');
      setPersons('1');
      setDifficulty('');
      setSteps('');
      setIngredients([]);
    }
  }, [visible, initialRecipe]);

  const addIngredient = foodName => {
    setIngredients([
      ...ingredients,
      {name: foodName, quantity: '1', unit: 'units', icon: getFoodIcon(foodName)},
    ]);
    setPickerVisible(false);
  };

  const updateIngredient = (index, field, value) => {
    setIngredients(ings =>
      ings.map((ing, idx) => (idx === index ? {...ing, [field]: value} : ing)),
    );
  };

  const save = () => {
    onSave({
      name,
      image,
      persons: parseInt(persons, 10) || 0,
      difficulty,
      steps,
      ingredients: ingredients.map(ing => ({
        name: ing.name,
        quantity: parseFloat(ing.quantity) || 0,
        unit: ing.unit,
        icon: ing.icon,
      })),
    });
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{flex:1,padding:20}}>
        <TouchableOpacity onPress={onClose} style={{marginBottom:10}}>
          <Text style={{fontSize:24}}>←</Text>
        </TouchableOpacity>
        <ScrollView>
          <Text>Nombre</Text>
          <TextInput style={{borderWidth:1,marginBottom:10,padding:5}} value={name} onChangeText={setName} />
          <Text>Foto (URL)</Text>
          <TextInput style={{borderWidth:1,marginBottom:10,padding:5}} value={image} onChangeText={setImage} />
          <Text>Personas</Text>
          <View style={{flexDirection:'row',alignItems:'center',marginBottom:10}}>
            <TouchableOpacity
              onPress={() =>
                setPersons(p =>
                  String(Math.max(1, (parseInt(p, 10) || 1) - 1)),
                )
              }
              style={{borderWidth:1,padding:5,borderRadius:4,marginRight:5}}>
              <Text>-</Text>
            </TouchableOpacity>
            <TextInput
              keyboardType="numeric"
              style={{borderWidth:1,padding:5,width:60,textAlign:'center'}}
              value={persons}
              onChangeText={setPersons}
            />
            <TouchableOpacity
              onPress={() =>
                setPersons(p => String((parseInt(p, 10) || 0) + 1))
              }
              style={{borderWidth:1,padding:5,borderRadius:4,marginLeft:5}}>
              <Text>+</Text>
            </TouchableOpacity>
          </View>
          <Text>Dificultad</Text>
          <View style={{flexDirection:'row',marginBottom:10}}>
            {['facil','intermedio','dificil'].map(level => (
              <TouchableOpacity
                key={level}
                onPress={() => setDifficulty(level)}
                style={{
                  padding:5,
                  borderWidth:1,
                  borderColor: difficulty===level ? '#2196f3' : '#ccc',
                  backgroundColor: difficulty===level ? '#e3f2fd' : '#fff',
                  borderRadius:5,
                  marginRight:5,
                }}
              >
                <Text style={{textTransform:'capitalize'}}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text>Ingredientes</Text>
          {ingredients.map((ing, idx) => (
            <View
              key={idx}
              style={{flexDirection:'row',alignItems:'center',marginBottom:5}}>
              {ing.icon ? (
                <Image
                  source={ing.icon}
                  style={{width:30,height:30,marginRight:5}}
                />
              ) : null}
              <Text style={{flex:1}}>{ing.name}</Text>
              <TextInput
                style={{borderWidth:1,width:60,marginHorizontal:5,padding:5}}
                keyboardType='numeric'
                value={ing.quantity}
                onChangeText={t => updateIngredient(idx, 'quantity', t)}
              />
              <TextInput
                style={{borderWidth:1,width:60,padding:5}}
                value={ing.unit}
                onChangeText={t => updateIngredient(idx, 'unit', t)}
              />
            </View>
          ))}
          <TouchableOpacity onPress={() => setPickerVisible(true)} style={{marginBottom:10}}>
            <Text style={{color:'blue'}}>Añadir ingrediente</Text>
          </TouchableOpacity>
          <Text>Pasos</Text>
          <TextInput
            multiline
            style={{borderWidth:1,marginBottom:10,padding:5,height:80}}
            value={steps}
            onChangeText={setSteps}
          />
          <TouchableOpacity
            onPress={save}
            style={{backgroundColor:'#2196f3',padding:10,borderRadius:6,alignSelf:'center'}}
          >
            <Text style={{color:'#fff'}}>Guardar</Text>
          </TouchableOpacity>
        </ScrollView>
        <FoodPickerModal
          visible={pickerVisible}
          onSelect={addIngredient}
          onClose={() => setPickerVisible(false)}
        />
      </View>
    </Modal>
  );
}
