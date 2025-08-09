import React, { useState } from 'react';
import { Button, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import foodIcons from '../foodIcons';

export default function FoodPickerModal({ visible, onSelect, onClose }) {
  const [search, setSearch] = useState('');

  const foods = Object.keys(foodIcons).filter(name =>
    name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, padding: 20 }}>
        <TextInput
          style={{ borderWidth: 1, padding: 5, marginBottom: 10 }}
          placeholder="Buscar alimento"
          value={search}
          onChangeText={setSearch}
        />
        <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {foods.map(name => (
            <TouchableOpacity
              key={name}
              style={{ width: '25%', alignItems: 'center', marginBottom: 20 }}
              onPress={() => onSelect(name)}
            >
              <Image source={foodIcons[name]} style={{ width: 50, height: 50 }} />
              <Text style={{ textAlign: 'center', marginTop: 5 }}>{name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Button title="Cerrar" onPress={onClose} />
      </View>
    </Modal>
  );
}
