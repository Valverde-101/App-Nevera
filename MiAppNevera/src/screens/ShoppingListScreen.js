import React, { useState } from 'react';
import { Button, ScrollView, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { useShopping } from '../context/ShoppingContext';

export default function ShoppingListScreen() {
  const { list, addItem, togglePurchased, removeItem } = useShopping();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [category, setCategory] = useState('general');

  const onAdd = () => {
    if (name.trim()) {
      const qty = parseInt(quantity, 10);
      addItem(name.trim(), category, isNaN(qty) ? 0 : qty);
      setName('');
      setQuantity('1');
      setCategory('general');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TextInput
          style={{ flex: 1, borderWidth: 1, marginRight: 10, padding: 5 }}
          value={name}
          onChangeText={setName}
          placeholder="Artículo"
        />
        <TextInput
          style={{ width: 60, borderWidth: 1, marginRight: 10, padding: 5 }}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />
        <TextInput
          style={{ width: 100, borderWidth: 1, marginRight: 10, padding: 5 }}
          value={category}
          onChangeText={setCategory}
          placeholder="Categoría"
        />
        <Button title="Añadir" onPress={onAdd} />
      </View>
      <ScrollView>
        {list.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => togglePurchased(idx)}
            onLongPress={() => removeItem(idx)}
          >
            <Text
              style={{
                padding: 5,
                textDecorationLine: item.purchased ? 'line-through' : 'none',
                color: item.purchased ? 'gray' : 'black',
              }}
            >
              {item.name} - {item.quantity} {item.unit} ({item.category})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
