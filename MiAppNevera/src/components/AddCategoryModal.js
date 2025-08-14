import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Image, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function AddCategoryModal({ visible, onClose, onSave }) {
  const [name, setName] = useState('');
  const [iconUri, setIconUri] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setIconUri(result.assets[0].uri);
    }
  };

  const save = () => {
    if (!name) return;
    onSave({ name, icon: iconUri });
    setName('');
    setIconUri(null);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex:1, padding:20 }}>
        <TouchableOpacity onPress={onClose} style={{ marginBottom:10 }}>
          <Text style={{ fontSize:24 }}>←</Text>
        </TouchableOpacity>
        <Text>Nombre de categoría</Text>
        <TextInput
          style={{ borderWidth:1, marginBottom:10, padding:5 }}
          value={name}
          onChangeText={setName}
        />
        <Text>Icono</Text>
        {iconUri && (
          <Image source={{ uri: iconUri }} style={{ width:60, height:60, marginBottom:10 }} />
        )}
        <Button title="Seleccionar imagen" onPress={pickImage} />
        <TouchableOpacity
          onPress={() => { save(); onClose(); }}
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
      </View>
    </Modal>
  );
}
