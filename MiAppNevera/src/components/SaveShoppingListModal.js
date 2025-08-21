import React, { useState, useEffect, useMemo } from 'react';
import { Modal, View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function SaveShoppingListModal({ visible, items = [], initialName = '', initialNote = '', onSave, onClose }) {
  const palette = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [name, setName] = useState(initialName);
  const [note, setNote] = useState(initialNote);

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setNote(initialNote);
    }
  }, [visible, initialName, initialNote]);

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Guardar lista</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          placeholderTextColor={palette.textDim}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Nota"
          placeholderTextColor={palette.textDim}
          value={note}
          onChangeText={setNote}
          multiline
        />
        <ScrollView style={styles.itemsBox}>
          {items.map((it, idx) => (
            <Text key={idx} style={styles.itemTxt}>
              {it.name} — {it.quantity} {it.unit}
            </Text>
          ))}
        </ScrollView>
        <View style={styles.btnRow}>
          <TouchableOpacity onPress={onClose} style={[styles.btn, { backgroundColor: palette.surface3 }]}> 
            <Text style={{ color: palette.text }}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onSave({ name, note })} style={[styles.btn, { backgroundColor: palette.accent }]}> 
            <Text style={{ color: '#1b1d22', fontWeight: '700' }}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg, padding: 20 },
  title: { fontSize: 18, fontWeight: '700', color: palette.text, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: palette.border, borderRadius: 8, padding: 8, color: palette.text, marginBottom: 12 },
  itemsBox: { flex: 1, borderWidth: 1, borderColor: palette.border, borderRadius: 8, padding: 10, marginBottom: 12 },
  itemTxt: { color: palette.text },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: palette.border, marginHorizontal: 6 },
});
