import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { useLocations } from '../context/LocationsContext';
import { useInventory } from '../context/InventoryContext';

const icons = ['🥶','❄️','🗃️','📦','🍽️'];

export default function LocationSettingsScreen() {
  const {
    locations,
    addLocation,
    updateLocation,
    removeLocation,
    toggleActive,
    reorderLocations,
  } = useLocations();
  const { inventory } = useInventory();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(icons[0]);
  const [editingKey, setEditingKey] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingKey, setPendingKey] = useState(null);
  const [warning, setWarning] = useState('');

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
      setWarning('La ubicación contiene alimentos. Vacíe la ubicación antes de eliminarla.');
      setPendingKey(null);
      setConfirmVisible(true);
      return;
    }
    setWarning('');
    setPendingKey(key);
    setConfirmVisible(true);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <DraggableFlatList
        data={locations}
        keyExtractor={item => item.key}
        onDragEnd={({ data }) => reorderLocations(data)}
        renderItem={({ item, drag, isActive }) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
              backgroundColor: isActive ? '#eee' : 'transparent',
            }}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => startEdit(item)}
              onLongPress={drag}
            >
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
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
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
              <View
                style={{
                  backgroundColor: '#fff',
                  padding: 20,
                  borderRadius: 8,
                  maxWidth: '80%',
                }}
              >
                {warning ? (
                  <Text style={{marginBottom: 10}}>{warning}</Text>
                ) : (
                  <Text style={{marginBottom: 10}}>
                    ¿Seguro que deseas eliminar esta ubicación?
                  </Text>
                )}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    marginTop: 20,
                  }}
                >
                  <Button title="Cancelar" onPress={() => setConfirmVisible(false)} />
                  {!warning && (
                    <Button
                      title="Eliminar"
                      onPress={() => {
                        removeLocation(pendingKey);
                        setConfirmVisible(false);
                      }}
                    />
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
