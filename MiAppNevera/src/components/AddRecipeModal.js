import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Button,
  TouchableWithoutFeedback,
} from 'react-native';
import QuillEditor from 'react-native-quill-editor';
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
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [unitPickerVisible, setUnitPickerVisible] = useState(false);
  const [unitPickerIndex, setUnitPickerIndex] = useState(null);

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
      setSelectMode(false);
      setSelected([]);
    }
  }, [visible, initialRecipe]);

  const addIngredient = foodName => {
    setIngredients([
      ...ingredients,
      {name: foodName, quantity: '1', unit: 'unidades', icon: getFoodIcon(foodName)},
    ]);
    setPickerVisible(false);
  };

  const addIngredients = foodNames => {
    setIngredients(prev => [
      ...prev,
      ...foodNames.map(name => ({
        name,
        quantity: '1',
        unit: 'unidades',
        icon: getFoodIcon(name),
      })),
    ]);
    setPickerVisible(false);
  };

  const updateIngredient = (index, field, value) => {
    setIngredients(ings =>
      ings.map((ing, idx) => (idx === index ? {...ing, [field]: value} : ing)),
    );
  };

  const toggleSelectIngredient = index => {
    setSelected(sel =>
      sel.includes(index) ? sel.filter(i => i !== index) : [...sel, index],
    );
  };

  const startSelectMode = index => {
    setSelectMode(true);
    toggleSelectIngredient(index);
  };

  const cancelSelect = () => {
    setSelectMode(false);
    setSelected([]);
  };

  const deleteSelectedIngredients = () => {
    setIngredients(ings =>
      ings.filter((_, idx) => !selected.includes(idx)),
    );
    cancelSelect();
  };

  const openUnitPicker = index => {
    setUnitPickerIndex(index);
    setUnitPickerVisible(true);
  };

  const selectUnit = unit => {
    if (unitPickerIndex !== null) {
      updateIngredient(unitPickerIndex, 'unit', unit);
    }
    setUnitPickerVisible(false);
    setUnitPickerIndex(null);
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
            <TouchableOpacity
              key={idx}
              onLongPress={() => startSelectMode(idx)}
              onPress={() => selectMode && toggleSelectIngredient(idx)}
              activeOpacity={1}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 5,
                padding: 2,
                backgroundColor: selected.includes(idx)
                  ? '#e0f7fa'
                  : 'transparent',
              }}
            >
              {ing.icon ? (
                <Image
                  source={ing.icon}
                  style={{ width: 30, height: 30, marginRight: 5 }}
                />
              ) : null}
              <Text style={{ flex: 1 }}>{ing.name}</Text>
              <TouchableOpacity
                disabled={selectMode}
                onPress={() => openUnitPicker(idx)}
                style={{
                  borderWidth: 1,
                  padding: 5,
                  borderRadius: 4,
                  marginRight: 5,
                }}
              >
                <Text>{ing.unit}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={selectMode}
                onPress={() =>
                  updateIngredient(
                    idx,
                    'quantity',
                    String(
                      Math.max(0, (parseFloat(ing.quantity) || 0) - 1),
                    ),
                  )
                }
                style={{
                  borderWidth: 1,
                  padding: 5,
                  borderRadius: 4,
                  marginRight: 5,
                }}
              >
                <Text>-</Text>
              </TouchableOpacity>
              <TextInput
                style={{
                  borderWidth: 1,
                  width: 40,
                  textAlign: 'center',
                  padding: 5,
                }}
                keyboardType="numeric"
                editable={!selectMode}
                value={ing.quantity}
                onChangeText={t => updateIngredient(idx, 'quantity', t)}
              />
              <TouchableOpacity
                disabled={selectMode}
                onPress={() =>
                  updateIngredient(
                    idx,
                    'quantity',
                    String((parseFloat(ing.quantity) || 0) + 1),
                  )
                }
                style={{
                  borderWidth: 1,
                  padding: 5,
                  borderRadius: 4,
                  marginLeft: 5,
                }}
              >
                <Text>+</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
          {selectMode && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 5,
              }}
            >
              <Button title="Cancelar" onPress={cancelSelect} />
              <Button
                title="Eliminar"
                color="red"
                onPress={deleteSelectedIngredients}
              />
            </View>
          )}
          <TouchableOpacity onPress={() => setPickerVisible(true)} style={{marginBottom:10}}>
            <Text style={{color:'blue'}}>Añadir ingrediente</Text>
          </TouchableOpacity>
          <Text>Pasos</Text>
          <View style={{height:200,marginBottom:10}}>
            <QuillEditor
              key={visible ? 'visible' : 'hidden'}
              defaultValue={steps}
              onChange={setSteps}
              style={{height:200}}
              options={{placeholder:'Escribe los pasos...'}}
            />
          </View>
          <TouchableOpacity
            onPress={save}
            style={{backgroundColor:'#2196f3',padding:10,borderRadius:6,alignSelf:'center'}}
          >
            <Text style={{color:'#fff'}}>Guardar</Text>
          </TouchableOpacity>
        </ScrollView>
        <Modal
          visible={unitPickerVisible}
          transparent
          animationType="fade"
        >
          <TouchableWithoutFeedback
            onPress={() => setUnitPickerVisible(false)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.3)',
              }}
            >
              <View style={{backgroundColor:'#fff',padding:20,borderRadius:6}}>
                {['unidades','kg','l'].map(u => (
                  <TouchableOpacity
                    key={u}
                    onPress={() => selectUnit(u)}
                    style={{paddingVertical:5}}
                  >
                    <Text>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        <FoodPickerModal
          visible={pickerVisible}
          onSelect={addIngredient}
          onMultiSelect={addIngredients}
          onClose={() => setPickerVisible(false)}
        />
      </View>
    </Modal>
  );
}
