import React, {useState} from 'react';
import {Modal, View, Text, TextInput, TouchableOpacity, ScrollView} from 'react-native';
import FoodPickerModal from './FoodPickerModal';

export default function AddRecipeModal({visible, onSave, onClose}) {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [persons, setPersons] = useState('1');
  const [difficulty, setDifficulty] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);

  const addIngredient = foodName => {
    setIngredients([...ingredients, {name: foodName, quantity: '1', unit: 'units'}]);
    setPickerVisible(false);
  };

  const updateIngredient = (index, field, value) => {
    setIngredients(ings => ings.map((ing, idx) => (idx === index ? {...ing, [field]: value} : ing)));
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
      })),
    });
    setName('');
    setImage('');
    setPersons('1');
    setDifficulty('');
    setSteps('');
    setIngredients([]);
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
          <TextInput keyboardType='numeric' style={{borderWidth:1,marginBottom:10,padding:5}} value={persons} onChangeText={setPersons} />
          <Text>Dificultad</Text>
          <TextInput style={{borderWidth:1,marginBottom:10,padding:5}} value={difficulty} onChangeText={setDifficulty} />
          <Text>Ingredientes</Text>
          {ingredients.map((ing, idx) => (
            <View key={idx} style={{flexDirection:'row',alignItems:'center',marginBottom:5}}>
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
