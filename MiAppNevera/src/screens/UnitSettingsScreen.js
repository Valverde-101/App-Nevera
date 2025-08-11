import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import { useUnits } from '../context/UnitsContext';

export default function UnitSettingsScreen() {
  const { units, addUnit, removeUnit } = useUnits();
  const [singular, setSingular] = useState('');
  const [plural, setPlural] = useState('');

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={units}
        keyExtractor={item => item.key}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text>{item.singular} / {item.plural}</Text>
            <Button title="Eliminar" onPress={() => removeUnit(item.key)} />
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
        title="Añadir"
        onPress={() => {
          if (singular && plural) {
            addUnit(singular, plural);
            setSingular('');
            setPlural('');
          }
        }}
      />
    </View>
  );
}
