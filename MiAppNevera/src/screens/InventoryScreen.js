import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Button, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useInventory } from '../context/InventoryContext';
import FoodPickerModal from '../components/FoodPickerModal';
import AddItemModal from '../components/AddItemModal';
import EditItemModal from '../components/EditItemModal';
import { categories, getFoodIcon } from '../foodIcons';

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
  const { inventory, addItem, updateItem, removeItem } = useInventory();
  const [storage, setStorage] = useState('fridge');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [addVisible, setAddVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [search, setSearch] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [viewVisible, setViewVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState('name');
  const [groupBy, setGroupBy] = useState('category');
  const [viewType, setViewType] = useState('list');

  const allItems = ['fridge', 'freezer', 'pantry'].flatMap(loc =>
    inventory[loc].map((item, index) => ({ ...item, location: loc, index })),
  );

  const searchLower = search.toLowerCase();

  const filteredItems = search
    ? allItems.filter(it =>
        (it.name && it.name.toLowerCase().includes(searchLower)) ||
        (it.location && it.location.toLowerCase().includes(searchLower)) ||
        (it.foodCategory && it.foodCategory.toLowerCase().includes(searchLower)) ||
        (it.note && it.note.toLowerCase().includes(searchLower)),
      )
    : inventory[storage].map((item, index) => ({ ...item, location: storage, index }));

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

  return (
    <View style={{ flex: 1 }}>
      <StorageSelector current={storage} onChange={setStorage} />
      <View style={{ padding: 20, flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button title="Añadir" onPress={() => setPickerVisible(true)} />
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Text style={{ fontSize: 24 }}>⋮</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          placeholder="Buscar..."
          value={search}
          onChangeText={setSearch}
          style={{ borderWidth: 1, marginTop: 10, padding: 5 }}
        />
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
                  items.map(item => (
                    <TouchableOpacity
                      key={`${item.location}-${item.index}`}
                      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 5 }}
                      onPress={() =>
                        setEditingItem({
                          ...item,
                          index: item.index,
                          category: item.location,
                          location: item.location,
                        })
                      }
                    >
                      {item.icon && (
                        <Image source={item.icon} style={{ width: 32, height: 32, marginRight: 10 }} />
                      )}
                      <Text>{item.name}</Text>
                      <Text style={{ marginLeft: 10 }}>
                        {item.quantity} {item.unit}
                      </Text>
                      {search && (
                        <Text style={{ marginLeft: 10, opacity: 0.6 }}>{item.location}</Text>
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {items.map(item => (
                      <TouchableOpacity
                        key={`${item.location}-${item.index}`}
                        style={{ width: '25%', padding: 5 }}
                        onPress={() =>
                          setEditingItem({
                            ...item,
                            index: item.index,
                            category: item.location,
                            location: item.location,
                          })
                        }
                      >
                        <View
                          style={{
                            backgroundColor: '#eee',
                            borderRadius: 8,
                            alignItems: 'center',
                            padding: 8,
                          }}
                        >
                          {item.icon && (
                            <Image source={item.icon} style={{ width: 40, height: 40, marginBottom: 4 }} />
                          )}
                          <Text style={{ textAlign: 'center', fontSize: 12 }}>
                            {item.name} - {item.quantity}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>

      <Modal visible={menuVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}
        >
          <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 8 }}>
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
            <Button title="Cerrar" onPress={() => setMenuVisible(false)} />
          </View>
        </View>
      </Modal>

      <Modal visible={sortVisible} animationType="slide">
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Ordenar por</Text>
          {[
            { key: 'name', label: 'Nombre' },
            { key: 'expiration', label: 'Fecha de caducidad' },
            { key: 'registered', label: 'Fecha de registro' },
          ].map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}
              onPress={() => setSortOrder(opt.key)}
            >
              <Text>{sortOrder === opt.key ? '◉' : '○'}</Text>
              <Text style={{ marginLeft: 5 }}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10 }}>Agrupar por</Text>
          {[
            { key: 'category', label: 'Categoría' },
            { key: 'none', label: 'Sin agrupación' },
            { key: 'registered', label: 'Fecha de registro' },
          ].map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}
              onPress={() => setGroupBy(opt.key)}
            >
              <Text>{groupBy === opt.key ? '◉' : '○'}</Text>
              <Text style={{ marginLeft: 5 }}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
          <Button title="Cerrar" onPress={() => setSortVisible(false)} />
        </View>
      </Modal>

      <Modal visible={viewVisible} animationType="slide">
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Tipo de vista</Text>
          {[
            { key: 'list', label: 'Lista' },
            { key: 'grid', label: 'Cuadrícula' },
          ].map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}
              onPress={() => setViewType(opt.key)}
            >
              <Text>{viewType === opt.key ? '◉' : '○'}</Text>
              <Text style={{ marginLeft: 5 }}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
          <Button title="Cerrar" onPress={() => setViewVisible(false)} />
        </View>
      </Modal>

      <FoodPickerModal
        visible={pickerVisible}
        onSelect={onSelectFood}
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
    </View>
  );
}
