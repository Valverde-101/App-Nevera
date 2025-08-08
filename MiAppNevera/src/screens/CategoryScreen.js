import React, { useState } from 'react';
import { Button, ScrollView, Text, TextInput, View } from 'react-native';
import { useInventory } from '../context/InventoryContext';

export default function CategoryScreen({ route }) {
  const { category } = route.params;
  const { inventory, addItem } = useInventory();
  const [text, setText] = useState('');

  const onAdd = () => {
    if (text.trim()) {
      addItem(category, text.trim());
      setText('');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Text>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TextInput
          style={{ flex: 1, borderWidth: 1, marginRight: 10, padding: 5 }}
          value={text}
          onChangeText={setText}
          placeholder="Añadir alimento"
        />
        <Button title="Añadir" onPress={onAdd} />
      </View>
      <ScrollView>
        {inventory[category]?.map((item, idx) => (
          <Text key={idx} style={{ padding: 5 }}>
            {item}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}
