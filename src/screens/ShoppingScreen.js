import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ShoppingScreen() {
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  const storageKey = 'shopping';

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const json = await AsyncStorage.getItem(storageKey);
    if (json) setItems(JSON.parse(json));
  };

  const save = async data => {
    await AsyncStorage.setItem(storageKey, JSON.stringify(data));
  };

  const addItem = () => {
    if (!text) return;
    const data = [...items, { id: Date.now().toString(), name: text }];
    setItems(data);
    setText('');
    save(data);
  };

  const removeItem = id => {
    const data = items.filter(i => i.id !== id);
    setItems(data);
    save(data);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.name}</Text>
            <Button title="X" onPress={() => removeItem(item.id)} />
          </View>
        )}
      />
      <View style={styles.form}>
        <TextInput
          value={text}
          onChangeText={setText}
          style={styles.input}
          placeholder="Añadir producto"
        />
        <Button title="Añadir" onPress={addItem} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  form: { flexDirection: 'row' },
  input: { flex: 1, borderWidth: 1, marginRight: 8, padding: 4 },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
});
