import React, { useState } from 'react';
import {
  Button,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import foodIcons, { categories } from '../foodIcons';

export default function FoodPickerModal({ visible, onSelect, onClose }) {
  const categoryNames = Object.keys(categories);
  const [currentCategory, setCurrentCategory] = useState(categoryNames[0]);
  const [search, setSearch] = useState('');

  const foods = categories[currentCategory].items.filter(name =>
    name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, padding: 20 }}>
        {/* Top half: category icons */}
        <View style={{ flex: 1 }}>
          <ScrollView horizontal contentContainerStyle={{ alignItems: 'center' }}>
            {categoryNames.map(cat => (
              <TouchableOpacity
                key={cat}
                style={{ alignItems: 'center', marginRight: 20 }}
                onPress={() => setCurrentCategory(cat)}
              >
                {categories[cat].icon && (
                  <Image
                    source={categories[cat].icon}
                    style={{
                      width: 50,
                      height: 50,
                      opacity: currentCategory === cat ? 1 : 0.5,
                    }}
                  />
                )}
                <Text style={{ textAlign: 'center', marginTop: 5 }}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Bottom half: foods for selected category */}
        <View style={{ flex: 1 }}>
          <TextInput
            style={{ borderWidth: 1, padding: 5, marginBottom: 10 }}
            placeholder="Buscar alimento"
            value={search}
            onChangeText={setSearch}
          />
          <ScrollView
            contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}
          >
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
      </View>
    </Modal>
  );
}
