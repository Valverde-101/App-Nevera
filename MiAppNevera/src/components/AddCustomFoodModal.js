import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Button,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getFoodIcon } from '../foodIcons';
import { useCustomFoods } from '../context/CustomFoodsContext';
import { useCategories } from '../context/CategoriesContext';
import AddCategoryModal from './AddCategoryModal';

function ManageCustomFoodsModal({ visible, onClose, onEdit }) {
  const { customFoods, removeCustomFood } = useCustomFoods();
  const { customCategories, categories, removeCategory } = useCategories();
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState([]);

  const foodsByCategory = customFoods.reduce((acc, food) => {
    const cat = food.category || 'otros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(food);
    return acc;
  }, {});
  const categoryOrder = Object.keys(categories);

  const toggleSelect = key => {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key],
    );
  };

  const selectAll = () => setSelected(customFoods.map(f => f.key));

  const deleteSelected = () => {
    selected.forEach(k => removeCustomFood(k));
    setSelected([]);
    setSelectMode(false);
  };

  const handleDeleteCategory = key => {
    if (customFoods.some(f => f.category === key)) {
      Alert.alert('No se puede eliminar', 'La categoría contiene ingredientes.');
      return;
    }
    Alert.alert('Eliminar categoría', '¿Deseas eliminar esta categoría?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => removeCategory(key) },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, padding: 20 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <TouchableOpacity onPress={() => { setSelectMode(false); setSelected([]); onClose(); }}>
            <Text style={{ fontSize: 24 }}>←</Text>
          </TouchableOpacity>
          {selectMode ? (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={() => selectAll()} style={{ marginRight: 10 }}>
                <Text style={{ color: 'blue' }}>Seleccionar todo</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={deleteSelected} style={{ marginRight: 10 }}>
                <Text style={{ color: 'red' }}>Eliminar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setSelectMode(false); setSelected([]); }}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setSelectMode(true)}>
              <Text style={{ color: 'blue' }}>Seleccionar</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView>
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Categorías personalizadas</Text>
          {customCategories.map(cat => (
            <View
              key={cat.key}
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}
            >
              {cat.icon && (
                <Image
                  source={{ uri: cat.icon }}
                  style={{ width: 40, height: 40, marginRight: 10 }}
                />
              )}
              <Text style={{ flex: 1 }}>{cat.name}</Text>
              <TouchableOpacity onPress={() => handleDeleteCategory(cat.key)}>
                <Text style={{ color: 'red' }}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          ))}
          <Text style={{ fontWeight: 'bold', marginVertical: 5 }}>Ingredientes personalizados</Text>
          {categoryOrder.map(catKey => {
            const list = foodsByCategory[catKey];
            if (!list || list.length === 0) return null;
            return (
              <View key={catKey} style={{ marginBottom: 10 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
                  {categories[catKey]?.name || catKey}
                </Text>
                {list.map(f => {
                  const isSelected = selected.includes(f.key);
                  return (
                    <View
                      key={f.key}
                      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}
                    >
                      {(f.icon || getFoodIcon(f.baseIcon || f.name)) && (
                        <Image
                          source={f.icon ? { uri: f.icon } : getFoodIcon(f.baseIcon || f.name)}
                          style={{ width: 40, height: 40, marginRight: 10 }}
                        />
                      )}
                      <Text style={{ flex: 1 }}>{f.name}</Text>
                      {selectMode ? (
                        <TouchableOpacity onPress={() => toggleSelect(f.key)}>
                          <Text>{isSelected ? '☑' : '☐'}</Text>
                        </TouchableOpacity>
                      ) : (
                        <>
                          <TouchableOpacity onPress={() => onEdit(f)} style={{ marginRight: 10 }}>
                            <Text>Editar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => removeCustomFood(f.key)}>
                            <Text style={{ color: 'red' }}>Eliminar</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function AddCustomFoodModal({ visible, onClose }) {
  const { addCustomFood, updateCustomFood } = useCustomFoods();
  const { categories, addCategory } = useCategories();
  const categoryNames = Object.keys(categories);
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categoryNames[0]);
  const [iconUri, setIconUri] = useState(null);
  const [baseIcon, setBaseIcon] = useState(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [manageVisible, setManageVisible] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [catModalVisible, setCatModalVisible] = useState(false);
  // Lazy-load to prevent a require cycle with FoodPickerModal
  const FoodPickerModal = React.useMemo(
    () => require('./FoodPickerModal').default,
    []
  );

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setIconUri(result.assets[0].uri);
      setBaseIcon(null);
    }
  };

  const selectDefault = (foodName) => {
    setBaseIcon(foodName);
    setIconUri(null);
    setPickerVisible(false);
  };

  const startEdit = food => {
    setName(food.name);
    setCategory(food.category);
    setIconUri(food.icon);
    setBaseIcon(food.baseIcon);
    setEditingKey(food.key);
    setManageVisible(false);
  };

  const resetForm = () => {
    setName('');
    const first = Object.keys(categories)[0];
    setCategory(first);
    setIconUri(null);
    setBaseIcon(null);
    setEditingKey(null);
  };

  const save = () => {
    if (!name) return;
    const data = { name, category, icon: iconUri, baseIcon };
    if (editingKey) {
      updateCustomFood(editingKey, data);
    } else {
      addCustomFood(data);
    }
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex:1, padding:20 }}>
        <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:10 }}>
          <TouchableOpacity onPress={() => { resetForm(); onClose(); }}>
            <Text style={{ fontSize:24 }}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setManageVisible(true)}>
            <Text style={{ color:'blue', marginTop:4 }}>Mis ingredientes</Text>
          </TouchableOpacity>
        </View>
        <ScrollView>
          <Text style={{marginBottom:10, textAlign:'center'}}>
            Aca podras crear tus propios ingredientes de acuerdo a tus necesidades, puedes usar iconos predefinidos o cargar nuevos iconos a tu eleccion
          </Text>
          <Text>Nombre</Text>
          <TextInput
            style={{ borderWidth:1, marginBottom:10, padding:5 }}
            value={name}
            onChangeText={setName}
          />
          <Text>Categoría</Text>
          <View style={{ flexDirection:'row', flexWrap:'wrap', marginBottom:10 }}>
            {categoryNames.map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={{
                  padding:5,
                  borderWidth:1,
                  borderColor:'#ccc',
                  marginRight:5,
                  marginBottom:5,
                  backgroundColor: category === cat ? '#ddd' : '#fff',
                }}
              >
                <Text>{categories[cat]?.name || cat}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setCatModalVisible(true)}
              style={{
                padding:5,
                borderWidth:1,
                borderColor:'#ccc',
                marginRight:5,
                marginBottom:5,
              }}
            >
              <Text>+</Text>
            </TouchableOpacity>
          </View>
          <Text>Icono</Text>
          {(iconUri || baseIcon) && (
            <Image
              source={iconUri ? { uri: iconUri } : getFoodIcon(baseIcon)}
              style={{ width:60, height:60, marginBottom:10 }}
            />
          )}
          <View style={{ flexDirection:'row', marginBottom:10 }}>
            <Button title="Predeterminado" onPress={() => setPickerVisible(true)} />
            <View style={{ width:10 }} />
            <Button title="Cargar" onPress={pickImage} />
          </View>
        </ScrollView>
        <TouchableOpacity
          onPress={save}
          style={{
            position:'absolute',
            bottom:20,
            alignSelf:'center',
            backgroundColor:'#2196f3',
            paddingVertical:10,
            paddingHorizontal:20,
            borderRadius:6,
          }}
        >
          <Text style={{ color:'#fff', fontSize:16 }}>Guardar</Text>
        </TouchableOpacity>
        <FoodPickerModal
          visible={pickerVisible}
          onSelect={selectDefault}
          onClose={() => setPickerVisible(false)}
        />
        <ManageCustomFoodsModal
          visible={manageVisible}
          onClose={() => setManageVisible(false)}
          onEdit={startEdit}
        />
        <AddCategoryModal
          visible={catModalVisible}
          onClose={() => setCatModalVisible(false)}
          onSave={data => {
            const key = addCategory(data);
            setCategory(key);
          }}
        />
      </View>
    </Modal>
  );
}
