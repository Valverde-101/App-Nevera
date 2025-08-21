import React, { useEffect, useState, useMemo } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet } from 'react-native';
import ShoppingListPreview from './ShoppingListPreview';
import AddShoppingItemModal from './AddShoppingItemModal';
import FoodPickerModal from './FoodPickerModal';
import { getFoodCategory } from '../foodIcons';
import { useTheme } from '../context/ThemeContext';

export default function SaveListModal({ visible, items = [], initialName = '', initialNote = '', onSave, onClose }) {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [localItems, setLocalItems] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [adding, setAdding] = useState(null);
  const [addVisible, setAddVisible] = useState(false);
  const palette = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setNote(initialNote);
      setLocalItems(items);
      setSelectMode(false);
      setSelected([]);
      setPickerVisible(false);
      setAddVisible(false);
      setAdding(null);
    }
  }, [visible, initialName, initialNote, items]);

  const handleItemSave = ({ quantity, unit }) => {
    setLocalItems(prev => prev.map((it, idx) => idx === editIdx ? { ...it, quantity, unit } : it));
    setEditIdx(null);
  };

  const toggleSelect = idx => {
    setSelected(prev => {
      const exists = prev.includes(idx);
      const next = exists ? prev.filter(i => i !== idx) : [...prev, idx];
      if (next.length === 0) setSelectMode(false);
      return next;
    });
  };

  const handleItemPress = idx => {
    if (selectMode) {
      toggleSelect(idx);
    } else {
      setEditIdx(idx);
    }
  };

  const handleItemLongPress = idx => {
    if (!selectMode) {
      setSelectMode(true);
      setSelected([idx]);
    } else {
      toggleSelect(idx);
    }
  };

  const deleteSelected = () => {
    setLocalItems(prev => prev.filter((_, i) => !selected.includes(i)));
    setSelected([]);
    setSelectMode(false);
  };

  const onSelectFood = (name, icon) => {
    setAdding({ name, icon });
    setPickerVisible(false);
    setAddVisible(true);
  };

  const handleAddSave = ({ quantity, unit }) => {
    if (adding) {
      setLocalItems(prev => [
        ...prev,
        {
          name: adding.name,
          icon: adding.icon,
          quantity,
          unit,
          foodCategory: getFoodCategory(adding.name),
        },
      ]);
      setAdding(null);
      setAddVisible(false);
    }
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
          selected={selected}
          onItemPress={handleItemPress}
          onItemLongPress={handleItemLongPress}
          style={{ flex: 1, marginBottom: 10 }}
        />
        <View style={styles.actions}>
          <Button
            title={selectMode ? 'Cancelar selección' : 'Cancelar'}
            onPress={selectMode ? () => { setSelectMode(false); setSelected([]); } : onClose}
          />
          <Button title="Añadir" onPress={() => setPickerVisible(true)} />
          {selectMode && selected.length > 0 && (
            <Button title="Eliminar" color="#b00" onPress={deleteSelected} />
          )}
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
        <FoodPickerModal
          visible={pickerVisible}
          onSelect={onSelectFood}
          onClose={() => setPickerVisible(false)}
        />
        <AddShoppingItemModal
          visible={addVisible}
          foodName={adding?.name}
          foodIcon={adding?.icon}
          onSave={handleAddSave}
          onClose={() => setAddVisible(false)}
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
