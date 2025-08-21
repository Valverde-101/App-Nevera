import React, { useEffect, useState, useMemo } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet } from 'react-native';
import ShoppingListPreview from './ShoppingListPreview';
import AddShoppingItemModal from './AddShoppingItemModal';
import { useTheme } from '../context/ThemeContext';

export default function SaveListModal({ visible, items = [], initialName = '', initialNote = '', onSave, onClose }) {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [localItems, setLocalItems] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const palette = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setNote(initialNote);
      setLocalItems(items);
    }
  }, [visible, initialName, initialNote, items]);

  const handleItemSave = ({ quantity, unit }) => {
    setLocalItems(prev => prev.map((it, idx) => idx === editIdx ? { ...it, quantity, unit } : it));
    setEditIdx(null);
  };

  const handleRemove = idx => {
    setLocalItems(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Guardar lista</Text>
        <TextInput
          placeholder="Nombre"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Nota"
          style={styles.input}
          value={note}
          onChangeText={setNote}
        />
        <ShoppingListPreview
          items={localItems}
          onItemPress={idx => setEditIdx(idx)}
          onItemLongPress={handleRemove}
          style={{ flex: 1, marginBottom: 10 }}
        />
        <View style={styles.actions}>
          <Button title="Cancelar" onPress={onClose} />
          <Button title="Guardar" onPress={() => onSave({ name: name.trim(), note, items: localItems })} />
        </View>
        <AddShoppingItemModal
          visible={editIdx !== null}
          foodName={localItems[editIdx]?.name}
          foodIcon={localItems[editIdx]?.icon}
          initialQuantity={localItems[editIdx]?.quantity}
          initialUnit={localItems[editIdx]?.unit}
          onSave={handleItemSave}
          onClose={() => setEditIdx(null)}
        />
      </View>
    </Modal>
  );
}

const createStyles = palette =>
  StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.bg },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: palette.text },
    input: {
      borderWidth: 1,
      borderColor: palette.border,
      padding: 8,
      marginBottom: 10,
      color: palette.text,
    },
    actions: { flexDirection: 'row', justifyContent: 'space-between' },
  });
