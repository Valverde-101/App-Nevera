import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import { useUnits } from '../context/UnitsContext';

export default function UnitSettingsScreen() {
  const { units, addUnit, updateUnit, removeUnit } = useUnits();
  const [singular, setSingular] = useState('');
  const [plural, setPlural] = useState('');
  const [editingKey, setEditingKey] = useState(null);

  const startEdit = item => {
    setEditingKey(item.key);
    setSingular(item.singular);
    setPlural(item.plural);
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setSingular('');
    setPlural('');
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={units}
        keyExtractor={item => item.key}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <Text>
              {item.singular} / {item.plural}
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <Button title="Editar" onPress={() => startEdit(item)} />
              <View style={{ width: 10 }} />
              <Button title="Eliminar" onPress={() => removeUnit(item.key)} />
            </View>
          </View>
        )}
      />
      <TextInput
        placeholder="Singular"
        value={singular}
        onChangeText={setSingular}
        style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
      />
      <TextInput
        placeholder="Plural"
        value={plural}
        onChangeText={setPlural}
        style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
      />
      <Button
        title={editingKey ? 'Actualizar' : 'Añadir'}
        onPress={() => {
          if (singular && plural) {
            if (editingKey) {
              updateUnit(editingKey, singular, plural);
              cancelEdit();
            } else {
              addUnit(singular, plural);
              setSingular('');
              setPlural('');
            }
          }
        }}
      />
      {editingKey && <Button title="Cancelar" onPress={cancelEdit} />}
    </View>
  );
}
