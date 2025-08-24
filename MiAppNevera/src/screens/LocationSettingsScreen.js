// LocationSettingsScreen.js – dark–premium v2.2.13
import React, { useState, useLayoutEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLocations } from '../context/LocationsContext';
import { useInventory } from '../context/InventoryContext';
import { useTheme } from '../context/ThemeContext';

const icons = ['🥶','❄️','🗃️','📦','🍽️','🧊','🥫','🥕','🥩','🥛'];

export default function LocationSettingsScreen() {
  const palette = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const nav = useNavigation();
  useLayoutEffect(() => {
    nav.setOptions?.({
      headerStyle: { backgroundColor: palette.surface },
      headerTintColor: palette.text,
      headerTitleStyle: { color: palette.text },
      headerShadowVisible: false,
      title: 'Ubicaciones',
    });
  }, [nav, palette]);

  const { locations, addLocation, updateLocation, removeLocation, toggleActive } = useLocations();
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

  const renderRow = ({ item }) => (
    <View style={styles.row}>
      <TouchableOpacity style={{ flex: 1 }} onPress={() => startEdit(item)}>
        <Text style={styles.rowText}>
          <Text style={{ fontSize: 18 }}>{item.icon}</Text>  {item.name}
          <Text style={styles.rowSub}>  • {item.key}</Text>
        </Text>
        {!item.active && <Text style={[styles.badge, { color: '#ffcc80' }]}>Inactiva</Text>}
      </TouchableOpacity>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity style={[styles.smallBtn, item.active ? null : styles.smallBtnAccent]} onPress={() => toggleActive(item.key)}>
          <Text style={item.active ? styles.smallBtnText : styles.smallBtnAccentText}>
            {item.active ? 'Desactivar' : 'Activar'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.smallBtn, styles.smallBtnDanger]} onPress={() => handleRemove(item.key)}>
          <Text style={styles.smallBtnDangerText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={locations}
        keyExtractor={item => item.key}
        renderItem={renderRow}
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        style={styles.list}
        showsVerticalScrollIndicator={Platform.OS === 'web' ? true : false}
      />

      {/* Editor */}
      <View style={styles.editor}>
        <Text style={styles.editorTitle}>{editingKey ? 'Editar ubicación' : 'Añadir ubicación'}</Text>
        <TextInput
          placeholder="Nombre"
          placeholderTextColor={palette.textDim}
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <View style={{ flexDirection: 'row', marginBottom: 10, flexWrap: 'wrap' }}>
          {icons.map(ic => (
            <TouchableOpacity key={ic} onPress={() => setIcon(ic)} style={[styles.iconChip, icon === ic && styles.iconChipOn]}>
              <Text style={{ fontSize: 18 }}>{ic}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={[styles.primaryBtn, { flex: 1 }]}
            onPress={() => {
              if (!name.trim()) return;
              if (editingKey) {
                updateLocation(editingKey, name.trim(), icon);
                cancelEdit();
              } else {
                addLocation(name.trim(), icon);
                setName('');
                setIcon(icons[0]);
              }
            }}
          >
            <Text style={styles.primaryBtnText}>{editingKey ? 'Guardar' : 'Añadir'}</Text>
          </TouchableOpacity>
          {editingKey ? (
            <TouchableOpacity style={[styles.btn, { flex: 1, marginLeft: 10 }]} onPress={cancelEdit}>
              <Text style={styles.btnText}>Cancelar</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Confirmación */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setConfirmVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                {warning ? (
                  <Text style={styles.modalBody}>{warning}</Text>
                ) : (
                  <Text style={styles.modalBody}>
                    ¿Seguro que deseas eliminar esta ubicación?
                  </Text>
                )}
                <View style={styles.modalRow}>
                  <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={() => setConfirmVisible(false)}>
                    <Text style={styles.btnText}>Cancelar</Text>
                  </TouchableOpacity>
                  {!warning && (
                    <TouchableOpacity
                      style={[styles.dangerBtn, { flex: 1, marginLeft: 12 }]}
                      onPress={() => { removeLocation(pendingKey); setConfirmVisible(false); }}
                    >
                      <Text style={styles.dangerBtnText}>Eliminar</Text>
                    </TouchableOpacity>
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

const createStyles = (palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  list: {
    ...(Platform.OS === 'web'
      ? {
          scrollbarWidth: 'thin',
          scrollbarColor: `${palette.accent} ${palette.surface2}`,
          scrollbarGutter: 'stable both-edges',
          overscrollBehavior: 'contain',
        }
      : {}),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.surface2,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  rowText: { color: palette.text, fontWeight: '700' },
  rowSub: { color: palette.textDim, fontSize: 12 },
  badge: { marginTop: 4 },
  smallBtn: {
    backgroundColor: palette.surface3,
    borderColor: palette.border,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginLeft: 8,
  },
  smallBtnText: { color: palette.text },
  smallBtnAccent: { backgroundColor: palette.accent, borderColor: '#e2b06c' },
  smallBtnAccentText: { color: '#1b1d22', fontWeight: '700' },
  smallBtnDanger: { backgroundColor: palette.danger, borderColor: '#ad2c2c' },
  smallBtnDangerText: { color: '#fff', fontWeight: '700' },

  editor: {
    backgroundColor: palette.surface,
    borderTopWidth: 1,
    borderColor: palette.border,
    padding: 12,
  },
  editorTitle: { color: palette.text, fontWeight: '700', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface2,
    color: palette.text,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'web' ? 10 : 8,
    marginBottom: 8,
  },
  iconChip: {
    backgroundColor: palette.surface3,
    borderColor: palette.border,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  iconChipOn: { backgroundColor: palette.surface2, borderColor: palette.accent },

  btn: {
    backgroundColor: palette.surface3,
    borderColor: palette.border,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: { color: palette.text },
  primaryBtn: {
    backgroundColor: palette.accent,
    borderColor: '#e2b06c',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#1b1d22', fontWeight: '700' },
  dangerBtn: {
    backgroundColor: palette.danger,
    borderColor: '#ad2c2c',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  dangerBtnText: { color: '#fff', fontWeight: '700' },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  modalCard: { backgroundColor: palette.surface, borderRadius: 12, borderWidth: 1, borderColor: palette.border, padding: 16, width: '100%', maxWidth: 420 },
  modalBody: { color: palette.text, marginBottom: 12 },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between' },
});
