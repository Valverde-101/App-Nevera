import React, { useState } from 'react';
import { Button, Image, ScrollView, Text, TextInput, View } from 'react-native';
import { useInventory } from '../context/InventoryContext';
import FoodPickerModal from '../components/FoodPickerModal';

export default function CategoryScreen({ route }) {
  const { category } = route.params;
  const { inventory, addItem, updateQuantity, removeItem } = useInventory();
  const [quantity, setQuantity] = useState('1');
  const [search, setSearch] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);

  const onSelectFood = name => {
    const qty = parseInt(quantity, 10);
    addItem(category, name, isNaN(qty) ? 0 : qty);
    setQuantity('1');
    setPickerVisible(false);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Text>
      <TextInput
        style={{ borderWidth: 1, padding: 5, marginBottom: 10 }}
        placeholder="Buscar"
        value={search}
        onChangeText={setSearch}
      />
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TextInput
          style={{ width: 60, borderWidth: 1, marginRight: 10, padding: 5 }}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />
        <Button title="Añadir" onPress={() => setPickerVisible(true)} />
      </View>
      <FoodPickerModal
        visible={pickerVisible}
        onSelect={onSelectFood}
        onClose={() => setPickerVisible(false)}
      />
      <ScrollView>
        {inventory[category]
          ?.filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase()),
          )
          .map((item, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 5,
                opacity: item.quantity === 0 ? 0.5 : 1,
              }}
            >
              {item.icon && (
                <Image
                  source={item.icon}
                  style={{ width: 32, height: 32, marginRight: 10 }}
                />
              )}
              <Text style={{ flex: 1 }}>{item.name}</Text>
              <Button
                title="-"
                onPress={() => updateQuantity(category, idx, -1)}
              />
              <Text style={{ marginHorizontal: 10 }}>{item.quantity}</Text>
              <Button
                title="+"
                onPress={() => updateQuantity(category, idx, 1)}
              />
              <Button
                title="Eliminar"
                onPress={() => removeItem(category, idx)}
              />
            </View>
          ))}
      </ScrollView>
    </View>
  );
}
