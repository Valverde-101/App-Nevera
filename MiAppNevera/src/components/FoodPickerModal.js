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
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import foodIcons, {
  categories as baseCategories,
  getFoodIcon,
  getFoodInfo,
  normalizeFoodName,
} from '../foodIcons';
import AddCustomFoodModal from './AddCustomFoodModal';
import { useCustomFoods } from '../context/CustomFoodsContext';
import { useCategories } from '../context/CategoriesContext';

export default function FoodPickerModal({
  visible,
  onSelect,
  onClose,
  onMultiSelect,
}) {
  const { categories } = useCategories();
  const categoryNames = Object.keys(categories);
  const baseCategoryNames = Object.keys(baseCategories);
  const [currentCategory, setCurrentCategory] = useState(categoryNames[0] || '');
  const [search, setSearch] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [manageVisible, setManageVisible] = useState(false);
  const [hiddenFoods, setHiddenFoods] = useState([]);
  const { customFoods } = useCustomFoods();
  const [addVisible, setAddVisible] = useState(false);

  useEffect(() => {
    const names = Object.keys(categories);
    if (names.length && !names.includes(currentCategory)) {
      setCurrentCategory(names[0]);
    }
  }, [categories, currentCategory]);

  useEffect(() => {
    if (!visible) {
      setSelectMode(false);
      setSelected([]);
      setSearch('');
      setSearchVisible(false);
    }
  }, [visible]);

  useEffect(() => {
    AsyncStorage.getItem('hiddenFoods').then(data => {
      if (data) setHiddenFoods(JSON.parse(data));
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('hiddenFoods', JSON.stringify(hiddenFoods));
  }, [hiddenFoods]);

  const toggleSelect = key => {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(n => n !== key) : [...prev, key],
    );
  };

  const handleSave = () => {
    if (onMultiSelect && selected.length) {
      const names = selected.map(k => customFoodMap[k]?.name || getFoodInfo(k)?.name || k);
      onMultiSelect(names);
    }
    setSelectMode(false);
    setSelected([]);
  };

  const customFoodMap = {};
  customFoods.forEach(f => {
    customFoodMap[f.key] = f;
  });

  const defaultFoods = (categories[currentCategory]?.items || [])
    .filter(name => !hiddenFoods.includes(name))
    .filter(name => {
      const info = getFoodInfo(name);
      return normalizeFoodName(info?.name || '').includes(
        normalizeFoodName(search),
      );
    })
    .map(name => {
      const info = getFoodInfo(name);
      return { key: name, label: info?.name || name, icon: foodIcons[name] };
    });

  const customList = customFoods
    .filter(f => f.category === currentCategory)
    .filter(f => !hiddenFoods.includes(f.key))
    .filter(f => normalizeFoodName(f.name).includes(normalizeFoodName(search)))
    .map(f => ({
      key: f.key,
      label: f.name,
      icon: f.icon ? { uri: f.icon } : getFoodIcon(f.baseIcon || f.name),
    }));

  const foods = [...defaultFoods, ...customList];

  return (
    <>
      <Modal visible={visible} animationType="slide">
        <View style={{ flex: 1, padding: 20 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <TouchableOpacity onPress={onClose}>
            <Text style={{ fontSize: 24 }}>←</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={() =>
                setSearchVisible(v => {
                  if (v) setSearch('');
                  return !v;
                })
              }
              style={{ marginRight: 15 }}
            >
              <Text style={{ fontSize: 24 }}>🔍</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAddVisible(true)} style={{ marginRight: 15 }}>
              <Text style={{ fontSize: 24 }}>＋</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMenuVisible(true)}>
              <Text style={{ fontSize: 24 }}>⋮</Text>
            </TouchableOpacity>
          </View>
        </View>
          {/* Top half: category icons */}
          <View style={{ flex: 1 }}>
            <ScrollView horizontal contentContainerStyle={{ alignItems: 'center' }}>
              {categoryNames.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={{ alignItems: 'center', marginRight: 20 }}
                  onPress={() => setCurrentCategory(cat)}
                >
                  {categories[cat]?.icon && (
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
                    {categories[cat]?.name ||
                      cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>

        {/* Bottom half: foods for selected category */}
        <View style={{ flex: 2 }}>
          {searchVisible && (
            <TextInput
              style={{ borderWidth: 1, padding: 5, marginBottom: 10 }}
              placeholder="Buscar alimento"
              value={search}
              onChangeText={setSearch}
            />
          )}
          <ScrollView
            contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}
          >
            {foods.map(food => {
              const isSelected = selected.includes(food.key);
              return (
                <TouchableOpacity
                  key={food.key}
                  style={{ width: '25%', alignItems: 'center', marginBottom: 20 }}
                  onPress={() =>
                    selectMode
                      ? toggleSelect(food.key)
                      : onSelect(food.label, food.icon)
                  }
                  onLongPress={() => {
                    if (!selectMode) {
                      setSelectMode(true);
                      toggleSelect(food.key);
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
                    {food.icon && (
                      <Image
                        source={food.icon}
                        style={{ width: 50, height: 50 }}
                      />
                    )}
                  </View>
                  <Text style={{ textAlign: 'center', marginTop: 5 }}>{food.label}</Text>
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
          ) : null}
        </View>
      </View>
    </Modal>
    <Modal visible={menuVisible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
        <View
          style={{
            flex: 1,
            alignItems: 'flex-end',
            paddingTop: 40,
            paddingRight: 20,
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}
        >
          <View style={{ backgroundColor: '#fff', padding: 10, borderRadius: 4 }}>
            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                setManageVisible(true);
              }}
            >
              <Text>Administrar alimentos predeterminados</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
    <Modal visible={manageVisible} animationType="slide">
      <View style={{ flex: 1, padding: 20 }}>
        <View style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}>
          <Text style={{ textAlign: 'center' }}>
            Lista completa de todos los alimentos predeterminados
          </Text>
          <Text style={{ textAlign: 'center' }}>
            Los alimentos sombreados no se mostraran en la lista de agregar alimentos
          </Text>
        </View>
        <ScrollView>
          {baseCategoryNames.map(cat => (
            <View key={cat} style={{ marginBottom: 15 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {baseCategories[cat].items.map(name => {
                  const hidden = hiddenFoods.includes(name);
                  return (
                    <TouchableOpacity
                      key={name}
                      style={{ width: '25%', alignItems: 'center', marginBottom: 20 }}
                      onPress={() =>
                        setHiddenFoods(prev =>
                          prev.includes(name)
                            ? prev.filter(n => n !== name)
                            : [...prev, name],
                        )
                      }
                    >
                      <View
                        style={{
                          borderRadius: 8,
                          padding: 5,
                          backgroundColor: hidden ? '#ddd' : 'transparent',
                        }}
                      >
                        <Image
                          source={foodIcons[name]}
                          style={{ width: 50, height: 50, opacity: hidden ? 0.5 : 1 }}
                        />
                      </View>
                      <Text style={{ textAlign: 'center', marginTop: 5 }}>{name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
        <Button title="Cerrar" onPress={() => setManageVisible(false)} />
      </View>
    </Modal>
    <AddCustomFoodModal visible={addVisible} onClose={() => setAddVisible(false)} />
    </>
  );
}
