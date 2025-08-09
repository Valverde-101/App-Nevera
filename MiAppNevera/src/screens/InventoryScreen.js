import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Button, TouchableOpacity } from 'react-native';
import { useInventory } from '../context/InventoryContext';
import FoodPickerModal from '../components/FoodPickerModal';
import AddItemModal from '../components/AddItemModal';
import { categories } from '../foodIcons';

function StorageSelector({ current, onChange }) {
  const opts = [
    { key: 'fridge', label: '🥶' },
    { key: 'freezer', label: '❄️' },
    { key: 'pantry', label: '🗃️' },
  ];
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 10 }}>
      {opts.map(opt => (
        <TouchableOpacity key={opt.key} onPress={() => onChange(opt.key)}>
          <Text style={{ fontSize: 24, opacity: current === opt.key ? 1 : 0.4 }}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function InventoryScreen() {
  const { inventory, addItem, updateQuantity, removeItem } = useInventory();
  const [storage, setStorage] = useState('fridge');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [addVisible, setAddVisible] = useState(false);

  const grouped = inventory[storage].reduce((acc, item, index) => {
    const cat = item.foodCategory || 'otros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push({ ...item, index });
    return acc;
  }, {});

  const groupOrder = Object.keys(categories);

  const onSelectFood = name => {
    setSelectedFood(name);
    setPickerVisible(false);
    setAddVisible(true);
  };

  const onSave = data => {
    addItem(data.location, selectedFood, data.quantity, data.unit, data.registered, data.expiration, data.note);
    setAddVisible(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <StorageSelector current={storage} onChange={setStorage} />
      <View style={{ padding: 20, flex: 1 }}>
        <Button title="Añadir" onPress={() => setPickerVisible(true)} />
        <ScrollView style={{ marginTop: 10 }}>
          {groupOrder.map(cat => {
            const items = grouped[cat];
            if (!items || items.length === 0) return null;
            return (
              <View key={cat} style={{ marginBottom: 15 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
                {items.map(item => (
                  <View
                    key={item.index}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 5 }}
                  >
                    {item.icon && (
                      <Image source={item.icon} style={{ width: 32, height: 32, marginRight: 10 }} />
                    )}
                    <Text style={{ flex: 1 }}>{item.name}</Text>
                    <Button title="-" onPress={() => updateQuantity(storage, item.index, -1)} />
                    <Text style={{ marginHorizontal: 10 }}>{item.quantity}</Text>
                    <Button title="+" onPress={() => updateQuantity(storage, item.index, 1)} />
                    <Button title="Eliminar" onPress={() => removeItem(storage, item.index)} />
                  </View>
                ))}
              </View>
            );
          })}
        </ScrollView>
      </View>
      <FoodPickerModal
        visible={pickerVisible}
        onSelect={onSelectFood}
        onClose={() => setPickerVisible(false)}
      />
      <AddItemModal
        visible={addVisible}
        foodName={selectedFood}
        initialLocation={storage}
        onSave={onSave}
        onClose={() => setAddVisible(false)}
      />
    </View>
  );
}
