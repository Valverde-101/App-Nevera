import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Image, ScrollView, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import FoodPickerModal from './FoodPickerModal';
import { categories, getFoodIcon } from '../foodIcons';
import { useCustomFoods } from '../context/CustomFoodsContext';

export default function AddCustomFoodModal({ visible, onClose }) {
  const { addCustomFood } = useCustomFoods();
  const categoryNames = Object.keys(categories);
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categoryNames[0]);
  const [iconUri, setIconUri] = useState(null);
  const [baseIcon, setBaseIcon] = useState(null);
  const [pickerVisible, setPickerVisible] = useState(false);

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

  const save = () => {
    if (!name) return;
    addCustomFood({ name, category, icon: iconUri, baseIcon });
    setName('');
    setCategory(categoryNames[0]);
    setIconUri(null);
    setBaseIcon(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex:1, padding:20 }}>
        <TouchableOpacity onPress={onClose} style={{ marginBottom:10 }}>
          <Text style={{ fontSize:24 }}>←</Text>
        </TouchableOpacity>
        <ScrollView>
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
                <Text>{cat}</Text>
              </TouchableOpacity>
            ))}
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
      </View>
    </Modal>
  );
}
