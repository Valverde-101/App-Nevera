// ShoppingListScreen.js – dark–premium v2.2.12
// Cambios de esta versión:
// - RESTAURADO: AutoAdd (botón ⚡ y modal) que agrega con cantidad = 0 y evita duplicados.
// - MANTENIDO: Encabezado de navegación en tema dark–premium (evita barra blanca en “Compras”).
// - MANTENIDO: Scrollbar dorada en Web, secciones por categoría, estados seleccionado/comprado y modales.
import React, { useMemo, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useShopping } from '../context/ShoppingContext';
import { useInventory } from '../context/InventoryContext';
import FoodPickerModal from '../components/FoodPickerModal';
import AddShoppingItemModal from '../components/AddShoppingItemModal';
import AddCustomItemModal from '../components/AddCustomItemModal';
import SaveListModal from '../components/SaveListModal';
import BatchAddItemModal from '../components/BatchAddItemModal';
import { useUnits } from '../context/UnitsContext';
import { useLocations } from '../context/LocationsContext';
import { useCategories } from '../context/CategoriesContext';
import { useTheme } from '../context/ThemeContext';
import { useSavedLists } from '../context/SavedListsContext';

export default function ShoppingListScreen() {
  const palette = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions?.({
      headerStyle: { backgroundColor: palette.surface },
      headerTintColor: palette.text,
      headerTitleStyle: { color: palette.text },
      headerShadowVisible: false,
    });
  }, [navigation, palette]);

  const {
    list,
    addItem,
    addCustomItem,
    addItems,
    togglePurchased,
    removeItems,
    markPurchased,
    resetShopping,
  } = useShopping();
  const { saveList } = useSavedLists();
  const { inventory, addItem: addInventoryItem, removeItem: removeInventoryItem } = useInventory();
  const { getLabel } = useUnits();
  const { locations } = useLocations();
  const { categories } = useCategories();

  const [pickerVisible, setPickerVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [batchVisible, setBatchVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [autoVisible, setAutoVisible] = useState(false);
  const [customVisible, setCustomVisible] = useState(false);
  const [saveVisible, setSaveVisible] = useState(false);
  const [clearVisible, setClearVisible] = useState(false);

  const onSelectFood = (name, icon) => {
    setSelectedFood({ name, icon });
    setPickerVisible(false);
    setAddVisible(true);
  };

  const onSave = ({ quantity, unit }) => {
    if (selectedFood) {
      addItem(selectedFood.name, quantity, unit);
      setSelectedFood(null);
      setAddVisible(false);
    }
  };

  const onSaveCustom = ({ name, quantity, unit }) => {
    if (name) {
      addCustomItem(name, quantity, unit);
      setCustomVisible(false);
    }
  };

  // AutoAdd: añade a la lista todos los alimentos del inventario con cantidad 0 (placeholders)
  // Evita duplicados y NO modifica el inventario aquí
  const handleAutoAdd = () => {
    const zeroItems = locations.flatMap(loc =>
      (inventory[loc.key] || []).filter(item => (item.quantity ?? 0) === 0)
    );
    const newItems = zeroItems
      .filter(it => !list.some(l => l.name === it.name))
      .map(it => ({ name: it.name, quantity: 0, unit: it.unit })); // cantidad 0 según especificación
    if (newItems.length) addItems(newItems);
    setAutoVisible(false);
  };

  const toggleSelect = (index) => {
    setSelected(prev => {
      const updated = prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index];
      if (updated.length === 0) setSelectMode(false);
      return updated;
    });
  };

  const selectAll = () => {
    if (selected.length === list.length) {
      setSelected([]);
      setSelectMode(false);
    } else {
      setSelected(list.map((_, idx) => idx));
      setSelectMode(true);
    }
  };

  const deleteSelected = () => {
    removeItems(selected);
    setSelected([]);
    setSelectMode(false);
    setConfirmVisible(false);
  };

  const handleSaveCurrent = ({ name, note, items }) => {
    saveList(name, note, items);
    setSaveVisible(false);
  };

  const clearAll = () => {
    resetShopping();
    setClearVisible(false);
  };

  // Guardado por lotes (igual que antes)
  const handleBatchSave = (entries) => {
    const names = new Set(entries.map(e => e.name));
    // eliminar placeholders qty=0 sin nota de inventario para los que sí guardaremos
    locations.forEach(loc => {
      const arr = inventory[loc.key] || [];
      for (let i = arr.length - 1; i >= 0; i--) {
        const invItem = arr[i];
        if (names.has(invItem.name) && (invItem.quantity ?? 0) === 0 && (!invItem.note || invItem.note.trim() === '')) {
          removeInventoryItem(loc.key, i);
        }
      }
    });

    // añadir/actualizar inventario
    for (const entry of entries) {
      const { name, location, quantity, unit, regDate, expDate, note } = entry;
      const qty = parseFloat(quantity) || 0;
      const hasNote = note && note.trim() !== '';
      if (qty !== 0 || hasNote) {
        addInventoryItem(location, name, qty, unit, regDate, expDate, note);
      }
    }

    // marcar como comprados lo editado y los de qty=0 no editados
    const zeroUnselected = list
      .map((it, idx) => ({ it, idx }))
      .filter(({ it, idx }) => (it.quantity ?? 0) === 0 && !entries.some(e => e.index === idx))
      .map(({ idx }) => idx);
    const toMark = [...new Set([...zeroUnselected, ...entries.map(e => e.index)])];
    if (toMark.length) markPurchased(toMark);

    setBatchVisible(false);
    setSelected([]);
    setSelectMode(false);
  };

  // Agrupar por categoría
  const grouped = useMemo(() => {
    const g = {};
    list.forEach((item, index) => {
      const cat = item.foodCategory || 'otros';
      if (!g[cat]) g[cat] = [];
      g[cat].push({ item, index });
    });
    return g;
  }, [list]);

  const empty = list.length === 0;

  return (
    <View style={styles.container}>
      {/* Header interno */}
      <View style={styles.headerRow}>
        {!selectMode ? (
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setPickerVisible(true)}>
              <Text style={styles.actionText}>＋ Añadir</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { marginLeft: 8 }]} onPress={() => setCustomVisible(true)}>
              <Text style={styles.actionText}>✎ Personalizado</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={[styles.iconBtn, { marginLeft: 8 }]} onPress={() => setAutoVisible(true)}>
                <Text style={styles.iconEmoji}>⚡</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, { marginLeft: 8 }]} onPress={() => setSaveVisible(true)}>
                <Text style={styles.iconEmoji}>💾</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, { marginLeft: 8 }]} onPress={() => setClearVisible(true)}>
                <Text style={styles.iconEmoji}>🗑️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, { marginLeft: 8 }]} onPress={() => navigation.navigate('SavedLists')}>
                <Text style={styles.iconEmoji}>📁</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={selectAll}>
              <Text style={styles.actionText}>Seleccionar todo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: palette.surface3, borderColor: palette.border }]} onPress={() => setBatchVisible(true)}>
              <Text style={[styles.actionText, { color: palette.accent }]}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2a1d1d', borderColor: '#5a2e2e' }]} onPress={() => setConfirmVisible(true)}>
              <Text style={[styles.actionText, { color: '#ff9f9f' }]}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Lista */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 14, paddingBottom: 80 }}
        showsVerticalScrollIndicator={Platform.OS === 'web' ? true : false}
      >
        {empty ? (
          <View style={styles.emptyWrap}>
            <Text style={{ color: palette.textDim, marginBottom: 8 }}>Tu lista de compras está vacía</Text>
            <TouchableOpacity onPress={() => setPickerVisible(true)} style={styles.emptyBtn}>
              <Text style={{ color: '#1b1d22', fontWeight: '700' }}>Añadir alimento</Text>
            </TouchableOpacity>
          </View>
        ) : (
          Object.entries(grouped).map(([cat, items]) => (
            <View key={cat} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {categories[cat]?.name || cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </View>
              {items.map(({ item, index }) => {
                const isSel = selectMode && selected.includes(index);
                const purchased = !!item.purchased;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => (selectMode ? toggleSelect(index) : togglePurchased(index))}
                    onLongPress={() => {
                      if (!selectMode) {
                        setSelectMode(true);
                        setSelected([index]);
                      } else {
                        toggleSelect(index);
                      }
                    }}
                  >
                    <View
                      style={[
                        styles.row,
                        purchased && styles.rowPurchased,
                        isSel && styles.rowSelected,
                      ]}
                    >
                      {selectMode && (
                        <View style={[styles.check, isSel && styles.checkOn]}>
                          <Text style={{ color: isSel ? '#1b1d22' : palette.textDim }}>
                            {isSel ? '✓' : ''}
                          </Text>
                        </View>
                      )}
                      {item.icon && <Image source={item.icon} style={styles.icon} />}
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.rowText,
                            purchased && { textDecorationLine: 'line-through', color: palette.textDim },
                          ]}
                          numberOfLines={2}
                        >
                          {item.name} — {item.quantity} {getLabel(item.quantity, item.unit)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>

      {/* Modales funcionales */}
      <FoodPickerModal
        visible={pickerVisible}
        onSelect={onSelectFood}
        onClose={() => setPickerVisible(false)}
      />
      <AddShoppingItemModal
        visible={addVisible}
        foodName={selectedFood?.name}
        foodIcon={selectedFood?.icon}
        onSave={onSave}
        onClose={() => setAddVisible(false)}
      />
      <AddCustomItemModal
        visible={customVisible}
        onSave={onSaveCustom}
        onClose={() => setCustomVisible(false)}
      />
      <BatchAddItemModal
        visible={batchVisible}
        items={selected.map(idx => ({ ...list[idx], index: idx }))}
        onSave={handleBatchSave}
        onClose={() => setBatchVisible(false)}
      />
      <SaveListModal
        visible={saveVisible}
        items={list}
        onSave={handleSaveCurrent}
        onClose={() => setSaveVisible(false)}
      />

      {/* Confirmar eliminación */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setConfirmVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Eliminar seleccionados</Text>
                <Text style={styles.cardBody}>
                  ¿Eliminar {selected.length} {selected.length === 1 ? 'alimento' : 'alimentos'} de la lista de compras?
                </Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => setConfirmVisible(false)} style={[styles.cardBtn, { backgroundColor: palette.surface3 }]}>
                    <Text style={{ color: palette.text }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={deleteSelected} style={[styles.cardBtn, { backgroundColor: palette.danger }]}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Clear all modal */}
      <Modal
        visible={clearVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setClearVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setClearVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Limpiar lista</Text>
                <Text style={styles.cardBody}>¿Eliminar todos los alimentos de la lista de compras?</Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => setClearVisible(false)} style={[styles.cardBtn, { backgroundColor: palette.surface3 }]}>
                    <Text style={{ color: palette.text }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={clearAll} style={[styles.cardBtn, { backgroundColor: palette.danger }]}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Auto-add modal */}
      <Modal
        visible={autoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAutoVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setAutoVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Añadir automáticamente</Text>
                <Text style={styles.cardBody}>
                  ¿Deseas añadir todos los alimentos con cantidad 0 del inventario a la lista de compras? Los que ya estén en la lista no se agregarán.
                </Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => setAutoVisible(false)} style={[styles.cardBtn, { backgroundColor: palette.surface3 }]}>
                    <Text style={{ color: palette.text }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleAutoAdd} style={[styles.cardBtn, { backgroundColor: palette.accent }]}>
                    <Text style={{ color: '#1b1d22', fontWeight: '700' }}>Aceptar</Text>
                  </TouchableOpacity>
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
  headerRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actionBtn: {
    backgroundColor: palette.accent,
    borderColor: '#e2b06c',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionText: { color: '#1b1d22', fontWeight: '700' },
  iconBtn: {
    backgroundColor: palette.surface2,
    borderColor: palette.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  iconEmoji: { color: palette.accent, fontSize: 18 },

  // ScrollView (Web): barra dorada + gutter estable
  scroll: {
    ...(Platform.OS === 'web'
      ? {
          scrollbarWidth: 'thin',                          // Firefox
          scrollbarColor: `${palette.accent} ${palette.surface2}`,
          scrollbarGutter: 'stable both-edges',
          overscrollBehavior: 'contain',
        }
      : {}),
  },

  section: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: palette.surface3,
    borderBottomWidth: 1,
    borderColor: palette.border,
  },
  sectionTitle: { color: palette.text, fontWeight: '700' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface2,
  },
  rowPurchased: { backgroundColor: palette.marked },
  rowSelected: { backgroundColor: palette.selected, borderLeftWidth: 3, borderLeftColor: palette.accent },
  check: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1, borderColor: palette.border,
    marginRight: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.surface3,
  },
  checkOn: { backgroundColor: palette.accent, borderColor: '#e2b06c' },
  icon: { width: 30, height: 30, marginRight: 10, resizeMode: 'contain' },
  rowText: { color: palette.text },

  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyBtn: {
    backgroundColor: palette.accent,
    borderColor: '#e2b06c',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  // modal styles
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    width: '100%',
    maxWidth: 420,
  },
  cardTitle: { color: palette.text, fontWeight: '700', fontSize: 16, marginBottom: 8 },
  cardBody: { color: palette.textDim, marginBottom: 14 },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between' },
  cardBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.border,
    marginHorizontal: 6,
  },
});


