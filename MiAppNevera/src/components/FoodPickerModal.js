import React, { useEffect, useState } from 'react';
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

export default function FoodPickerModal({
  visible,
  onSelect,
  onClose,
  onMultiSelect,
}) {
  const categoryNames = Object.keys(categories);
  const [currentCategory, setCurrentCategory] = useState(categoryNames[0]);
  const [search, setSearch] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!visible) {
      setSelectMode(false);
      setSelected([]);
    }
  }, [visible]);

  const toggleSelect = name => {
    setSelected(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name],
    );
  };

  const handleSave = () => {
    if (onMultiSelect && selected.length) {
      onMultiSelect(selected);
    }
    setSelectMode(false);
    setSelected([]);
  };

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
            {foods.map(name => {
              const isSelected = selected.includes(name);
              return (
                <TouchableOpacity
                  key={name}
                  style={{ width: '25%', alignItems: 'center', marginBottom: 20 }}
                  onPress={() =>
                    selectMode ? toggleSelect(name) : onSelect(name)
                  }
                  onLongPress={() => {
                    if (!selectMode) {
                      setSelectMode(true);
                      toggleSelect(name);
                    }
                  }}
                >
                  <View
                    style={{
                      borderWidth: selectMode ? 1 : 0,
                      borderColor: isSelected ? '#2196f3' : 'transparent',
                      borderRadius: 8,
                      padding: 5,
                    }}
                  >
                    <Image
                      source={foodIcons[name]}
                      style={{ width: 50, height: 50 }}
                    />
                  </View>
                  <Text style={{ textAlign: 'center', marginTop: 5 }}>{name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {selectMode ? (
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <Button
                title="Cancelar"
                onPress={() => {
                  setSelectMode(false);
                  setSelected([]);
                }}
              />
              <Button title="Guardar" onPress={handleSave} />
            </View>
          ) : (
            <Button title="Cerrar" onPress={onClose} />
          )}
        </View>
      </View>
    </Modal>
  );
}
