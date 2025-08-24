import React, { useState } from 'react';
import { Button, Image, ScrollView, Text, TextInput, View } from 'react-native';
import { useInventory } from '../context/InventoryContext';
import FoodPickerModal from '../components/FoodPickerModal';
import { useCategories } from '../context/CategoriesContext';
import { getFoodInfo } from '../foodIcons';
import { useDefaultFoods } from '../context/DefaultFoodsContext';
import { useLanguage } from '../context/LanguageContext';

export default function CategoryScreen({ route }) {
  const { category } = route.params;
  const { inventory, addItem, updateQuantity, removeItem } = useInventory();
  const { categories } = useCategories();
  // subscribe to default food overrides so category list updates names
  const { overrides } = useDefaultFoods();
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [search, setSearch] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);

  const onSelectFood = name => {
    const info = getFoodInfo(name);
    addItem(
      category,
      name,
      quantity || 0,
      info?.defaultUnit || 'units',
      '',
      '',
      '',
      info?.defaultPrice || 0,
    );
    setQuantity(1);
    setPickerVisible(false);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        {categories[category]?.name || category.charAt(0).toUpperCase() + category.slice(1)}
      </Text>
      <TextInput
        style={{ borderWidth: 1, padding: 5, marginBottom: 10 }}
        placeholder={t('system.inventory.searchPlaceholder')}
        value={search}
        onChangeText={setSearch}
      />
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TextInput
          style={{ width: 60, borderWidth: 1, marginRight: 10, padding: 5 }}
          value={String(quantity)}
          onChangeText={t => setQuantity(parseInt(t, 10) || 0)}
          keyboardType="numeric"
        />
        <Button title={t('system.inventory.add')} onPress={() => setPickerVisible(true)} />
      </View>
      <FoodPickerModal
        visible={pickerVisible}
        onSelect={onSelectFood}
        onClose={() => setPickerVisible(false)}
      />
      <ScrollView>
        {inventory[category]
          ?.filter(item => {
            const label = getFoodInfo(item.name)?.name || item.name;
            return label.toLowerCase().includes(search.toLowerCase());
          })
          .map((item, idx) => {
            const label = getFoodInfo(item.name)?.name || item.name;
            return (
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
                <Text style={{ flex: 1 }}>{label}</Text>
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
                  title={t('system.inventory.delete')}
                  onPress={() => removeItem(category, idx)}
                />
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
}
