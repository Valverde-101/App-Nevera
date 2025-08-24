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
import SaveListModal from '../components/SaveListModal';
import BatchAddShoppingModal from '../components/BatchAddShoppingModal';
import BatchAddItemModal from '../components/BatchAddItemModal';
import { useUnits } from '../context/UnitsContext';
import { useLocations } from '../context/LocationsContext';
import { useCategories } from '../context/CategoriesContext';
import { useTheme } from '../context/ThemeContext';
import { useSavedLists } from '../context/SavedListsContext';
import { useCurrency } from '../context/CurrencyContext';
import { getFoodIcon, getFoodInfo } from '../foodIcons';
import CostPieChart from '../components/CostPieChart';
import { useDefaultFoods } from '../context/DefaultFoodsContext';

export default function ShoppingListScreen() {
  const palette = useTheme();
  const { symbol } = useCurrency();
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
    addItems,
    editItem,
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
  // subscribe to default food overrides so shopping names update after refresh
  const { overrides } = useDefaultFoods();

  const [pickerVisible, setPickerVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [multiItems, setMultiItems] = useState([]);
  const [multiAddVisible, setMultiAddVisible] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [batchVisible, setBatchVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [autoVisible, setAutoVisible] = useState(false);
  const [saveVisible, setSaveVisible] = useState(false);
  const [clearVisible, setClearVisible] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

    const onSelectFood = (key, icon) => {
      const info = getFoodInfo(key);
      setSelectedFood({
        key,
        name: info?.name || key,
        icon,
        unit: info?.defaultUnit,
        unitPrice: info?.defaultPrice,
        totalPrice: info?.defaultPrice,
      });
      setPickerVisible(false);
      setAddVisible(true);
    };

    const onMultiSelectFoods = keys => {
      const items = keys.map(k => {
        const info = getFoodInfo(k);
        return {
          name: k,
          icon: getFoodIcon(k),
          defaultUnit: info?.defaultUnit,
          defaultPrice: info?.defaultPrice,
        };
      });
      setMultiItems(items);
      setPickerVisible(false);
      setMultiAddVisible(true);
    };

    const onSave = ({ quantity, unit, unitPrice, totalPrice }) => {
      if (selectedFood) {
        addItem(selectedFood.key, quantity, unit, unitPrice, totalPrice);
        setSelectedFood(null);
        setAddVisible(false);
      }
    };

  const handleMultiAddSave = entries => {
    addItems(
      entries.map(e => ({
        name: e.name,
        quantity: parseFloat(e.quantity) || 0,
        unit: e.unit,
        unitPrice: parseFloat(e.unitPrice) || 0,
        totalPrice: parseFloat(e.totalPrice) || 0,
      })),
    );
    setMultiAddVisible(false);
    setMultiItems([]);
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

  const totalCost = useMemo(
    () => list.reduce((sum, it) => sum + (it.totalPrice || 0), 0),
    [list],
  );

  const costByCategory = useMemo(() => {
    const totals = {};
    list.forEach(it => {
      const cat = it.foodCategory || 'otros';
      const price = it.totalPrice || 0;
      if (price > 0) totals[cat] = (totals[cat] || 0) + price;
    });
    return totals;
  }, [list]);

  const chartData = useMemo(() => {
    const paletteColors = [
      '#4e79a7',
      '#f28e2b',
      '#e15759',
      '#76b7b2',
      '#59a14f',
      '#edc949',
      '#af7aa1',
      '#ff9da7',
      '#9c755f',
      '#bab0ab',
    ];
    return Object.entries(costByCategory).map(([key, value], idx) => ({
      key,
      value,
      color: paletteColors[idx % paletteColors.length],
      percent: totalCost ? (value / totalCost) * 100 : 0,
    }));
  }, [costByCategory, totalCost]);

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
            {selected.length === 1 && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: palette.surface3, borderColor: palette.border }]}
                onPress={() => setEditIdx(selected[0])}
              >
                <Text style={[styles.actionText, { color: palette.accent }]}>Editar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: palette.surface3, borderColor: palette.border }]}
              onPress={() => setBatchVisible(true)}
            >
              <Text style={[styles.actionText, { color: palette.accent }]}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: palette.danger, borderColor: '#ad2c2c' }]}
              onPress={() => setConfirmVisible(true)}
            >
              <Text style={[styles.actionText, { color: '#fff' }]}>Eliminar</Text>
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
          <>
            {Object.entries(grouped).map(([cat, items]) => (
              <View key={cat} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {categories[cat]?.name || cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                </View>
                {items.map(({ item, index }) => {
                  const isSel = selectMode && selected.includes(index);
                  const purchased = !!item.purchased;
                  const label = getFoodInfo(item.name)?.name || item.name;
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
                            {label} - {item.quantity} {getLabel(item.quantity, item.unit)}
                          </Text>
                        </View>
                        {item.totalPrice > 0 && (
                          <Text style={styles.priceBadge}>
                            {`${symbol}${item.totalPrice.toFixed(2)}`}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Detalles de lista de compra</Text>
              </View>
              <View style={styles.detailsRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => setDetailsVisible(true)}>
                  <Text style={styles.actionText}>Más detalles</Text>
                </TouchableOpacity>
                <Text style={styles.totalText}>{`Costo Total: ${symbol}${totalCost.toFixed(2)}`}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Modales funcionales */}
      <FoodPickerModal
        visible={pickerVisible}
        onSelect={onSelectFood}
        onMultiSelect={onMultiSelectFoods}
        onClose={() => setPickerVisible(false)}
      />
      <AddShoppingItemModal
        visible={addVisible}
        foodName={selectedFood?.key}
        foodIcon={selectedFood?.icon}
        onSave={onSave}
        onClose={() => setAddVisible(false)}
        initialUnit={selectedFood?.unit}
        initialUnitPrice={selectedFood?.unitPrice}
        initialTotalPrice={selectedFood?.totalPrice}
      />
      <AddShoppingItemModal
        visible={editIdx !== null}
        foodName={list[editIdx]?.name}
        foodIcon={list[editIdx]?.icon}
        initialQuantity={list[editIdx]?.quantity}
        initialUnit={list[editIdx]?.unit}
        initialUnitPrice={list[editIdx]?.unitPrice}
        initialTotalPrice={list[editIdx]?.totalPrice}
        onSave={({ quantity, unit, unitPrice, totalPrice }) => {
          editItem(editIdx, quantity, unit, unitPrice, totalPrice);
          setEditIdx(null);
          setSelected([]);
          setSelectMode(false);
        }}
        onClose={() => setEditIdx(null)}
      />
      <BatchAddShoppingModal
        visible={multiAddVisible}
        items={multiItems}
        onSave={handleMultiAddSave}
        onClose={() => setMultiAddVisible(false)}
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

      <Modal
        visible={detailsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailsVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDetailsVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={[styles.card, { alignItems: 'center' }]}> 
                <Text style={[styles.cardTitle, { marginBottom: 16 }]}>Distribución de costos</Text>
                {totalCost > 0 ? (
                  <>
                    <CostPieChart data={chartData} size={200} />
                    <View style={{ marginTop: 16, alignSelf: 'stretch' }}>
                      {chartData.map(d => (
                        <View key={d.key} style={styles.legendRow}>
                          <View style={[styles.legendColor, { backgroundColor: d.color }]} />
                          <Text style={[styles.legendLabel, { flex: 1 }]}> 
                            {categories[d.key]?.name || d.key}
                          </Text>
                          <Text style={styles.legendValue}>{`${symbol}${d.value.toFixed(2)}`}</Text>
                          <Text style={styles.legendPercent}>{`${d.percent.toFixed(0)}%`}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : (
                  <Text style={{ color: palette.textDim }}>Sin datos de costo</Text>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

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
  priceBadge: { color: palette.accent, fontWeight: '700', marginLeft: 8 },

  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  totalText: { color: palette.text, fontWeight: '700' },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  legendColor: { width: 12, height: 12, borderRadius: 2, marginRight: 8 },
  legendLabel: { color: palette.text },
  legendValue: { color: palette.text, marginLeft: 8 },
  legendPercent: { color: palette.textDim, marginLeft: 8 },

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


