import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import { useLocations } from '../context/LocationsContext';

const icons = ['🥶','❄️','🗃️','📦','🍽️'];

export default function LocationSettingsScreen() {
  const { locations, addLocation, removeLocation, toggleActive } = useLocations();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(icons[0]);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={locations}
        keyExtractor={item => item.key}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems:'center', marginBottom: 10 }}>
            <Text>{item.icon} {item.name}</Text>
            <View style={{ flexDirection: 'row' }}>
              <Button title={item.active ? 'Desactivar' : 'Activar'} onPress={() => toggleActive(item.key)} />
              <View style={{ width: 10 }} />
              <Button title="Eliminar" onPress={() => removeLocation(item.key)} />
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
        title="Añadir"
        onPress={() => {
          if (name) {
            addLocation(name, icon);
            setName('');
          }
        }}
      />
    </View>
  );
}
