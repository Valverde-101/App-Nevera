import React, { useState } from 'react';
import { Button, ScrollView, Text, TextInput, View } from 'react-native';
import { useShopping } from '../context/ShoppingContext';

export default function ShoppingListScreen() {
  const { list, addItem } = useShopping();
  const [text, setText] = useState('');

  const onAdd = () => {
    if (text.trim()) {
      addItem(text.trim());
      setText('');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TextInput
          style={{ flex: 1, borderWidth: 1, marginRight: 10, padding: 5 }}
          value={text}
          onChangeText={setText}
          placeholder="Añadir a compras"
        />
        <Button title="Añadir" onPress={onAdd} />
      </View>
      <ScrollView>
        {list.map((item, idx) => (
          <Text key={idx} style={{ padding: 5 }}>
            {item}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}
