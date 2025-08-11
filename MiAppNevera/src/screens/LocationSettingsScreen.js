import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useLocations } from '../context/LocationsContext';
import { useInventory } from '../context/InventoryContext';

const icons = ['🥶','❄️','🗃️','📦','🍽️'];

export default function LocationSettingsScreen() {
  const { locations, addLocation, updateLocation, removeLocation, toggleActive } = useLocations();
  const { inventory } = useInventory();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(icons[0]);
  const [editingKey, setEditingKey] = useState(null);

  const startEdit = item => {
    setEditingKey(item.key);
    setName(item.name);
    setIcon(item.icon);
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setName('');
    setIcon(icons[0]);
  };

  const handleRemove = key => {
    if (inventory[key] && inventory[key].length > 0) {
      Alert.alert(
        'No se puede eliminar',
        'La ubicación contiene alimentos. Vacíe la ubicación antes de eliminarla.',
      );
      return;
    }
    Alert.alert('Confirmar', '¿Seguro que deseas eliminar esta ubicación?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => removeLocation(key) },
    ]);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={locations}
        keyExtractor={item => item.key}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <TouchableOpacity style={{ flex: 1 }} onPress={() => startEdit(item)}>
              <Text>
                {item.icon} {item.name}
              </Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row' }}>
              <Button
                title={item.active ? 'Desactivar' : 'Activar'}
                onPress={() => toggleActive(item.key)}
              />
              <View style={{ width: 10 }} />
              <Button title="Eliminar" onPress={() => handleRemove(item.key)} />
            </View>
          </View>
        )}
      />
      <TextInput
        placeholder="Nombre"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
      />
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        {icons.map(ic => (
          <TouchableOpacity key={ic} onPress={() => setIcon(ic)} style={{ marginRight: 10 }}>
            <Text style={{ fontSize: 24, opacity: icon === ic ? 1 : 0.3 }}>{ic}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Button
        title={editingKey ? 'Guardar' : 'Añadir'}
        onPress={() => {
          if (name) {
            if (editingKey) {
              updateLocation(editingKey, name, icon);
              cancelEdit();
            } else {
              addLocation(name, icon);
              setName('');
              setIcon(icons[0]);
            }
          }
        }}
      />
      {editingKey && (
        <Button title="Cancelar" onPress={cancelEdit} />
      )}
    </View>
  );
}
