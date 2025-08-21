import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, Button, ScrollView } from 'react-native';

export default function SaveListModal({ visible, items = [], initialName = '', initialNote = '', onSave, onClose }) {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setNote(initialNote);
    }
  }, [visible, initialName, initialNote]);

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Guardar lista</Text>
        <TextInput
          placeholder="Nombre"
          style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Nota"
          style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
          value={note}
          onChangeText={setNote}
        />
        <ScrollView style={{ flex: 1, marginBottom: 10 }}>
          {items.map((it, idx) => (
            <Text key={idx} style={{ marginBottom: 4 }}>
              - {it.name} ({it.quantity} {it.unit})
            </Text>
          ))}
        </ScrollView>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Button title="Cancelar" onPress={onClose} />
          <Button title="Guardar" onPress={() => onSave({ name: name.trim(), note })} />
        </View>
      </View>
    </Modal>
  );
}

