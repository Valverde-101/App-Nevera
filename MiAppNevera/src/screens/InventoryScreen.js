import React, { useState, useLayoutEffect, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Button,
  TouchableOpacity,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useInventory } from '../context/InventoryContext';
import { useShopping } from '../context/ShoppingContext';
import FoodPickerModal from '../components/FoodPickerModal';
import AddItemModal from '../components/AddItemModal';
import EditItemModal from '../components/EditItemModal';
import BatchAddItemModal from '../components/BatchAddItemModal';
import { categories, getFoodIcon } from '../foodIcons';
import { useUnits } from '../context/UnitsContext';
import { useLocations } from '../context/LocationsContext';

function StorageSelector({ current, onChange }) {
  const { locations } = useLocations();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 10 }}>
      {locations.filter(l => l.active).map(opt => (
        <TouchableOpacity key={opt.key} onPress={() => onChange(opt.key)}>
          <Text style={{ fontSize: 24, opacity: current === opt.key ? 1 : 0.4 }}>
            {current === opt.key ? opt.name : opt.icon}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function InventoryScreen({ navigation }) {
  const { inventory, addItem, updateItem, removeItem } = useInventory();
  const { addItems: addShoppingItems } = useShopping();
  const { getLabel } = useUnits();
  const { locations } = useLocations();
  const [storage, setStorage] = useState(locations[0]?.key || 'fridge');

  useEffect(() => {
    if (!locations.find(l => l.key === storage && l.active)) {
      const first = locations.find(l => l.active);
      if (first) setStorage(first.key);
    }
  }, [locations]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [addVisible, setAddVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [multiAddVisible, setMultiAddVisible] = useState(false);
  const [multiItems, setMultiItems] = useState([]);

  const [search, setSearch] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [viewVisible, setViewVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState('name');
  const [groupBy, setGroupBy] = useState('category');
  const [viewType, setViewType] = useState('grid');
  const [tempSortOrder, setTempSortOrder] = useState(sortOrder);
  const [tempGroupBy, setTempGroupBy] = useState(groupBy);
  const [tempViewType, setTempViewType] = useState(viewType);
  const [searchVisible, setSearchVisible] = useState(false);
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [transferType, setTransferType] = useState(null); // 'move' | 'copy'
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [shoppingVisible, setShoppingVisible] = useState(false);

  useEffect(() => {
    if (sortVisible) {
      setTempSortOrder(sortOrder);
      setTempGroupBy(groupBy);
    }
  }, [sortVisible]);

  useEffect(() => {
    if (viewVisible) {
      setTempViewType(viewType);
    }
  }, [viewVisible]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
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
            <Text style={{ fontSize: 18 }}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Recipes')}
            style={{ marginRight: 15 }}
          >
            <Text style={{ fontSize: 18 }}>📖</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Shopping')}
            style={{ marginRight: 15 }}
          >
            <Text style={{ fontSize: 18 }}>🛒</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Text style={{ fontSize: 24, paddingHorizontal: 6, backgroundColor: '#eee', borderRadius: 4 }}>⋮</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  const allItems = locations.flatMap(loc =>
    inventory[loc.key]?.map((item, index) => ({ ...item, location: loc.key, index })) || [],
  );

  const searchLower = search.toLowerCase();

  const filteredItems = search
    ? allItems.filter(it =>
        (it.name && it.name.toLowerCase().includes(searchLower)) ||
        (it.location && it.location.toLowerCase().includes(searchLower)) ||
        (it.foodCategory && it.foodCategory.toLowerCase().includes(searchLower)) ||
        (it.note && it.note.toLowerCase().includes(searchLower)),
      )
    : inventory[storage]?.map((item, index) => ({ ...item, location: storage, index })) || [];

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortOrder === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortOrder === 'expiration') {
      return new Date(a.expiration || '9999-12-31') - new Date(b.expiration || '9999-12-31');
    } else if (sortOrder === 'registered') {
      return new Date(a.registered || '9999-12-31') - new Date(b.registered || '9999-12-31');
    }
    return 0;
  });

  let grouped = {};
  let groupOrder = [];

  if (groupBy === 'category') {
    grouped = sortedItems.reduce((acc, item) => {
      const cat = item.foodCategory || 'otros';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
    groupOrder = Object.keys(categories);
    if (grouped['otros']) groupOrder.push('otros');
  } else if (groupBy === 'registered') {
    grouped = sortedItems.reduce((acc, item) => {
      const key = item.registered || 'Sin registro';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
    groupOrder = Object.keys(grouped).sort();
  } else {
    grouped = { all: sortedItems };
    groupOrder = ['all'];
  }

  const onSelectFood = name => {
    setSelectedFood({ name, icon: getFoodIcon(name) });
    setPickerVisible(false);
    setAddVisible(true);
  };

  const onMultiSelectFoods = names => {
    const items = names.map(name => ({ name, icon: getFoodIcon(name) }));
    setMultiItems(items);
    setPickerVisible(false);
    setMultiAddVisible(true);
  };

  const onSave = data => {
    addItem(
      data.location,
      selectedFood.name,
      data.quantity,
      data.unit,
      data.registered,
      data.expiration,
      data.note,
    );
    setAddVisible(false);
  };

  const handleBatchAddSave = entries => {
    entries.forEach((entry, idx) => {
      const { location, quantity, unit, regDate, expDate, note } = entry;
      const item = multiItems[idx];
      addItem(
        location,
        item.name,
        parseFloat(quantity) || 0,
        unit,
        regDate,
        expDate,
        note,
      );
    });
    setMultiAddVisible(false);
    setMultiItems([]);
  };

  const toggleSelection = (location, index) => {
    const key = `${location}-${index}`;
    setSelectedItems(prev => {
      const exists = prev.find(it => it.key === key);
      const updated = exists
        ? prev.filter(it => it.key !== key)
        : [...prev, { key, location, index }];
      if (updated.length === 0) setMultiSelect(false);
      return updated;
    });
  };

  const addButtonBottom = multiSelect && selectedItems.length > 0 ? 80 : 20;

  const getSelectedFullItems = () =>
    selectedItems.map(sel => ({
      ...inventory[sel.location][sel.index],
      location: sel.location,
      index: sel.index,
    }));

  const clearSelection = () => {
    setSelectedItems([]);
    setMultiSelect(false);
  };

  const getVisibleKeyOrder = () =>
    groupOrder.flatMap(group =>
      grouped[group]?.map(item => `${item.location}-${item.index}`) || [],
    );

  const selectAll = () => {
    const allKeys = getVisibleKeyOrder().map(k => {
      const [location, indexStr] = k.split('-');
      return { key: k, location, index: parseInt(indexStr, 10) };
    });
    setSelectedItems(allKeys);
    setMultiSelect(true);
  };

  const selectIntersection = () => {
    if (selectedItems.length < 2) return;
    const keyOrder = getVisibleKeyOrder();
    const indices = selectedItems
      .map(sel => keyOrder.indexOf(sel.key))
      .filter(i => i !== -1)
      .sort((a, b) => a - b);
    if (indices.length < 2) return;
    const start = indices[0];
    const end = indices[indices.length - 1];
    const newSelection = keyOrder.slice(start, end + 1).map(k => {
      const [location, indexStr] = k.split('-');
      return { key: k, location, index: parseInt(indexStr, 10) };
    });
    setSelectedItems(newSelection);
    setMultiSelect(true);
  };

  const handleTransfer = target => {
    const items = getSelectedFullItems();
    if (transferType === 'move') {
      selectedItems
        .slice()
        .sort((a, b) =>
          a.location === b.location ? b.index - a.index : a.location.localeCompare(b.location),
        )
        .forEach(sel => removeItem(sel.location, sel.index));
    }
    items.forEach(item => {
      addItem(
        target,
        item.name,
        item.quantity,
        item.unit,
        item.registered,
        item.expiration,
        item.note,
      );
    });
    clearSelection();
    setTransferType(null);
  };

  const handleAddToShopping = () => {
    const items = getSelectedFullItems().map(it => ({
      name: it.name,
      quantity: it.quantity,
      unit: it.unit,
    }));
    addShoppingItems(items);
    clearSelection();
    setShoppingVisible(false);
  };

  const handleDelete = () => {
    selectedItems
      .slice()
      .sort((a, b) =>
        a.location === b.location ? b.index - a.index : a.location.localeCompare(b.location),
      )
      .forEach(sel => removeItem(sel.location, sel.index));
    clearSelection();
    setConfirmVisible(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <StorageSelector current={storage} onChange={setStorage} />
      <View style={{ padding: 20, flex: 1 }}>
        {searchVisible && (
          <TextInput
            placeholder="Buscar..."
            value={search}
            onChangeText={setSearch}
            style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
          />
        )}
        <ScrollView style={{ marginTop: 10 }}>
          {groupOrder.map(cat => {
            const items = grouped[cat];
            if (!items || items.length === 0) return null;
            return (
              <View key={cat} style={{ marginBottom: 15 }}>
                {groupBy !== 'none' && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                    {groupBy === 'category' && categories[cat]?.icon && (
                      <Image source={categories[cat].icon} style={{ width: 24, height: 24, marginRight: 5 }} />
                    )}
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                      {groupBy === 'category'
                        ? cat.charAt(0).toUpperCase() + cat.slice(1)
                        : cat}
                    </Text>
                  </View>
                )}
                {viewType === 'list' ? (
                  items.map(item => {
                    const key = `${item.location}-${item.index}`;
                    const selected = selectedItems.some(it => it.key === key);
                    return (
                      <TouchableOpacity
                        key={key}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: 5,
                          backgroundColor: selected ? '#d0ebff' : undefined,
                          opacity: item.quantity === 0 ? 0.5 : 1,
                        }}
                        onLongPress={() => {
                          setMultiSelect(true);
                          toggleSelection(item.location, item.index);
                        }}
                        onPress={() => {
                          if (multiSelect) {
                            toggleSelection(item.location, item.index);
                          } else {
                            setEditingItem({
                              ...item,
                              index: item.index,
                              category: item.location,
                              location: item.location,
                            });
                          }
                        }}
                      >
                        {item.icon && (
                          <Image
                            source={item.icon}
                            style={{ width: 32, height: 32, marginRight: 10 }}
                          />
                        )}
                        <Text>{item.name}</Text>
                        <Text style={{ marginLeft: 10 }}>
                          {item.quantity} {getLabel(item.quantity, item.unit)}
                        </Text>
                        {search && (
                          <Text style={{ marginLeft: 10, opacity: 0.6 }}>{item.location}</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {items.map(item => {
                      const key = `${item.location}-${item.index}`;
                      const selected = selectedItems.some(it => it.key === key);
                      return (
                        <TouchableOpacity
                          key={key}
                          style={{
                            width: '25%',
                            padding: 5,
                            opacity: item.quantity === 0 ? 0.5 : 1,
                          }}
                          onLongPress={() => {
                            setMultiSelect(true);
                            toggleSelection(item.location, item.index);
                          }}
                          onPress={() => {
                            if (multiSelect) {
                              toggleSelection(item.location, item.index);
                            } else {
                              setEditingItem({
                                ...item,
                                index: item.index,
                                category: item.location,
                                location: item.location,
                              });
                            }
                          }}
                        >
                          <View
                            style={{
                              backgroundColor: selected ? '#d0ebff' : '#eee',
                              borderRadius: 8,
                              alignItems: 'center',
                              padding: 8,
                            }}
                          >
                            {item.icon && (
                              <Image
                                source={item.icon}
                                style={{ width: 40, height: 40, marginBottom: 4 }}
                              />
                            )}
                            <Text style={{ textAlign: 'center', fontSize: 12 }}>
                              {item.name} - {item.quantity} {getLabel(item.quantity, item.unit)}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
      <TouchableOpacity
        onPress={() => setPickerVisible(true)}
        style={{
          position: 'absolute',
          right: 20,
          bottom: addButtonBottom,
          backgroundColor: '#2196f3',
          width: 56,
          height: 56,
          borderRadius: 28,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 30, color: '#fff', marginTop: -2 }}>+</Text>
      </TouchableOpacity>

      {multiSelect && selectedItems.length > 0 && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
            backgroundColor: '#fff',
            padding: 10,
            borderTopWidth: 1,
            borderColor: '#ccc',
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: '#e0e0e0',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 6,
              margin: 4,
            }}
            onPress={() => {
              setSelectedItems([]);
              setMultiSelect(false);
            }}
          >
            <Text style={{ fontSize: 16 }}>❌</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: '#e0e0e0',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 6,
              margin: 4,
            }}
            onPress={selectAll}
          >
            <Text style={{ fontSize: 16 }}>Seleccionar todo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: '#e0e0e0',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 6,
              margin: 4,
            }}
            onPress={selectIntersection}
          >
            <Text style={{ fontSize: 16 }}>Intersección</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: '#2196f3',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 6,
              margin: 4,
            }}
            onPress={() => setTransferType('move')}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>🔀</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: '#2196f3',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 6,
              margin: 4,
            }}
            onPress={() => setTransferType('copy')}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>📄</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: '#4caf50',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 6,
              margin: 4,
            }}
            onPress={() => setShoppingVisible(true)}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>🛒</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: '#e53935',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 6,
              margin: 4,
            }}
            onPress={() => setConfirmVisible(true)}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>🗑️</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  position: 'absolute',
                  top: 40,
                  right: 10,
                  backgroundColor: '#fff',
                  padding: 10,
                  borderRadius: 8,
                }}
              >
                <Button
                  title="Clasificar"
                  onPress={() => {
                    setMenuVisible(false);
                    setSortVisible(true);
                  }}
                />
                <Button
                  title="Tipo de vista"
                  onPress={() => {
                    setMenuVisible(false);
                    setViewVisible(true);
                  }}
                />
                <Button
                  title="Ajustes"
                  onPress={() => {
                    setMenuVisible(false);
                    navigation.navigate('Settings');
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={sortVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSortVisible(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.3)',
            }}
          >
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor: '#fff',
                  padding: 20,
                  borderRadius: 8,
                  width: '80%',
                  maxWidth: 300,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                  Ordenar por
                </Text>
                {[
                  { key: 'name', label: 'Nombre' },
                  { key: 'expiration', label: 'Fecha de caducidad' },
                  { key: 'registered', label: 'Fecha de registro' },
                ].map(opt => (
                  <TouchableOpacity
                    key={opt.key}
                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}
                    onPress={() => setTempSortOrder(opt.key)}
                  >
                    <Text>{tempSortOrder === opt.key ? '◉' : '○'}</Text>
                    <Text style={{ marginLeft: 5 }}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10 }}>
                  Agrupar por
                </Text>
                {[
                  { key: 'category', label: 'Categoría' },
                  { key: 'none', label: 'Sin agrupación' },
                  { key: 'registered', label: 'Fecha de registro' },
                ].map(opt => (
                  <TouchableOpacity
                    key={opt.key}
                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}
                    onPress={() => setTempGroupBy(opt.key)}
                  >
                    <Text>{tempGroupBy === opt.key ? '◉' : '○'}</Text>
                    <Text style={{ marginLeft: 5 }}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                  <TouchableOpacity
                    onPress={() => setSortVisible(false)}
                    style={{ padding: 10, marginRight: 10 }}
                  >
                    <Text style={{ color: '#2196f3' }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setSortOrder(tempSortOrder);
                      setGroupBy(tempGroupBy);
                      setSortVisible(false);
                    }}
                    style={{ backgroundColor: '#2196f3', padding: 10, borderRadius: 4 }}
                  >
                    <Text style={{ color: '#fff' }}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={viewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setViewVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setViewVisible(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.3)',
            }}
          >
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor: '#fff',
                  padding: 20,
                  borderRadius: 8,
                  width: '80%',
                  maxWidth: 300,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                  Tipo de vista
                </Text>
                {[
                  { key: 'list', label: 'Lista' },
                  { key: 'grid', label: 'Cuadrícula' },
                ].map(opt => (
                  <TouchableOpacity
                    key={opt.key}
                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}
                    onPress={() => setTempViewType(opt.key)}
                  >
                    <Text>{tempViewType === opt.key ? '◉' : '○'}</Text>
                    <Text style={{ marginLeft: 5 }}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                  <TouchableOpacity
                    onPress={() => setViewVisible(false)}
                    style={{ padding: 10, marginRight: 10 }}
                  >
                    <Text style={{ color: '#2196f3' }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setViewType(tempViewType);
                      setViewVisible(false);
                    }}
                    style={{ backgroundColor: '#2196f3', padding: 10, borderRadius: 4 }}
                  >
                    <Text style={{ color: '#fff' }}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <FoodPickerModal
        visible={pickerVisible}
        onSelect={onSelectFood}
        onMultiSelect={onMultiSelectFoods}
        onClose={() => setPickerVisible(false)}
      />
      <AddItemModal
        visible={addVisible}
        foodName={selectedFood?.name}
        foodIcon={selectedFood?.icon}
        initialLocation={storage}
        onSave={onSave}
        onClose={() => setAddVisible(false)}
      />
      <BatchAddItemModal
        visible={multiAddVisible}
        items={multiItems}
        onSave={handleBatchAddSave}
        onClose={() => setMultiAddVisible(false)}
      />
      <EditItemModal
        visible={!!editingItem}
        item={editingItem}
        onSave={data => {
          updateItem(editingItem.category, editingItem.index, data);
          setEditingItem(null);
        }}
        onDelete={() => {
          removeItem(editingItem.category, editingItem.index);
          setEditingItem(null);
        }}
        onClose={() => setEditingItem(null)}
      />

      <Modal
        visible={shoppingVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setShoppingVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShoppingVisible(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.3)',
            }}
          >
            <TouchableWithoutFeedback>
              <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 8, maxHeight: '80%', width: '80%' }}>
                <Text style={{ marginBottom: 10 }}>
                  Añadir los siguientes {selectedItems.length} elementos a la lista de compras?
                </Text>
                <ScrollView style={{ marginBottom: 10 }}>
                  {getSelectedFullItems().map((item, idx) => (
                    <View
                      key={idx}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#ccc',
                        padding: 5,
                        marginBottom: 5,
                        borderRadius: 4,
                      }}
                    >
                      {item.icon && (
                        <Image
                          source={item.icon}
                          style={{ width: 30, height: 30, marginRight: 10 }}
                        />
                      )}
                      <Text>
                        {item.name} - {item.quantity} {getLabel(item.quantity, item.unit)}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                  <Button title="Cancelar" onPress={() => setShoppingVisible(false)} />
                  <Button title="Añadir" onPress={handleAddToShopping} />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal visible={!!transferType} transparent animationType="fade" onRequestClose={() => setTransferType(null)}>
        <TouchableWithoutFeedback onPress={() => setTransferType(null)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.3)',
            }}
          >
            <TouchableWithoutFeedback>
              <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 8 }}>
                <Text style={{ marginBottom: 10 }}>
                  {transferType === 'move' ? 'Mover a:' : 'Copiar a:'}
                </Text>
                {locations.map(opt => (
                  <Button key={opt.key} title={opt.name} onPress={() => handleTransfer(opt.key)} />
                ))}
                <Button title="Cancelar" onPress={() => setTransferType(null)} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={() => setConfirmVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setConfirmVisible(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.3)',
            }}
          >
            <TouchableWithoutFeedback>
              <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 8 }}>
                <Text style={{ marginBottom: 10 }}>
                  ¿Eliminar {selectedItems.length} items?
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                  <Button title="Cancelar" onPress={() => setConfirmVisible(false)} />
                  <Button title="Eliminar" onPress={handleDelete} />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
