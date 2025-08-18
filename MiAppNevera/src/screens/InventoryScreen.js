// InventoryScreen.js – dark–premium v2.2.6 (gradientes por ítem + selector segmentado)
import React, { useState, useLayoutEffect, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Button,
  TouchableOpacity,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Pressable,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useInventory } from '../context/InventoryContext';
import { useShopping } from '../context/ShoppingContext';
import FoodPickerModal from '../components/FoodPickerModal';
import AddItemModal from '../components/AddItemModal';
import EditItemModal from '../components/EditItemModal';
import BatchAddItemModal from '../components/BatchAddItemModal';
import { getFoodIcon } from '../foodIcons';
import { useUnits } from '../context/UnitsContext';
import { useLocations } from '../context/LocationsContext';
import { useCategories } from '../context/CategoriesContext';
import { useTheme, useThemeController } from '../context/ThemeContext';
import { gradientForKey } from '../theme/gradients';

// ===== Helpers =====
const getExpiryMeta = (palette, d) => {
  if (d === null || isNaN(d)) return null;
  if (d <= 0)  return { bg: palette.danger, text: '#fff', label: 'Venc.' };
  if (d <= 3)  return { bg: palette.warn,   text: '#1b1d22', label: `D-${d}` };
  return        { bg: palette.accent, text: '#1b1d22', label: `D-${d}` };
};

const SELECTED_BORDER_WIDTH = 2;

// ===== StorageSelector (segmentado, ancho uniforme, clic en todo el segmento) =====
function StorageSelector({ current, onChange }) {
  const palette = useTheme();
  const selectorStyles = useMemo(() => createSelectorStyles(palette), [palette]);
  const { locations } = useLocations();
  const active = locations.filter(l => l.active);
  return (
    <View style={selectorStyles.row}>
      {active.map((opt, idx) => (
        <Pressable
          key={opt.key}
          onPress={() => onChange(opt.key)}
          hitSlop={8}
          style={({ pressed }) => [
            selectorStyles.segment,
            current === opt.key ? selectorStyles.segmentSelected : selectorStyles.segmentIdle,
            pressed && selectorStyles.segmentPressed,
            idx === 0 && selectorStyles.leftRadius,
            idx === active.length - 1 && selectorStyles.rightRadius,
          ]}
        >
          <Text
            style={[selectorStyles.label, current === opt.key && selectorStyles.labelSelected]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {current === opt.key ? opt.name : (opt.icon || '•')}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const createSelectorStyles = (palette) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6 },
  segment: {
    flex: 1, minHeight: 44, marginHorizontal: 4,
    borderWidth: 1, borderColor: palette.border,
    justifyContent: 'center', alignItems: 'center',
    borderRadius: 14,
  },
  leftRadius: { borderTopLeftRadius: 14, borderBottomLeftRadius: 14 },
  rightRadius: { borderTopRightRadius: 14, borderBottomRightRadius: 14 },
  segmentSelected: { backgroundColor: palette.surface2, borderColor: palette.accent },
  segmentIdle: { backgroundColor: palette.surface },
  segmentPressed: { opacity: 0.9 },
  label: { fontSize: 15, color: palette.text },
  labelSelected: { color: palette.accent, fontWeight: '700' },
});

export default function InventoryScreen({ navigation }) {
  const palette = useTheme();
  const { themeName } = useThemeController();
  const { inventory, addItem, updateItem, removeItem, updateQuantity } = useInventory();
  const { addItems: addShoppingItems } = useShopping();
  const { getLabel } = useUnits();
  const { locations } = useLocations();
  const { categories } = useCategories();
  const [storage, setStorage] = useState(locations[0]?.key || 'fridge');

  useEffect(() => {
    if (!locations.find(l => l.key === storage && l.active)) {
      const first = locations.find(l => l.active);
      if (first) setStorage(first.key);
    }
  }, [locations]);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [addVisible, setAddVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [multiAddVisible, setMultiAddVisible] = useState(false);
  const [multiItems, setMultiItems] = useState([]);

  const screenWidth = Dimensions.get('window').width;
  const numColumns = Math.max(1, Math.floor(screenWidth / 120));
  const itemWidth = `${100 / numColumns}%`;

  const cleanZeroItems = name => {
    locations.forEach(loc => {
      for (let i = inventory[loc.key].length - 1; i >= 0; i--) {
        const invItem = inventory[loc.key][i];
        if (invItem.name === name && invItem.quantity === 0 && (!invItem.note || invItem.note.trim() === '')) {
          removeItem(loc.key, i);
        }
      }
    });
  };

  const [search, setSearch] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [viewVisible, setViewVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState('name');
  const [groupBy, setGroupBy] = useState('category');
  const [viewType, setViewType] = useState('grid');
  const [tempSortOrder, setTempSortOrder] = useState(sortOrder);
  const [tempGroupBy, setTempGroupBy] = useState(groupBy);
  const [tempViewType, setTempViewType] = useState(viewType);
  const [searchVisible, setSearchVisible] = useState(false);

  // ---- Selección múltiple ----
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  // ---- Transfer / Compras / Confirmación ----
  const [transferType, setTransferType] = useState(null); // 'move' | 'copy'
  const [shoppingVisible, setShoppingVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => { if (sortVisible) { setTempSortOrder(sortOrder); setTempGroupBy(groupBy); } }, [sortVisible]);
  useEffect(() => { if (viewVisible) { setTempViewType(viewType); } }, [viewVisible]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: palette.bg },
      headerTintColor: palette.text,
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={() => setSearchVisible(v => { if (v) setSearch(''); return !v; })}
            style={{ marginRight: 15 }}
          >
            <Text style={{ fontSize: 18, color: palette.text }}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Recipes')} style={{ marginRight: 15 }}>
            <Text style={{ fontSize: 18, color: palette.text }}>📖</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Shopping')} style={{ marginRight: 15 }}>
            <Text style={{ fontSize: 18, color: palette.text }}>🛒</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Text
              style={{
                fontSize: 22,
                paddingHorizontal: 8,
                borderRadius: 6,
                color: palette.text,
                backgroundColor: palette.surface2,
                borderWidth: 1,
                borderColor: palette.border,
              }}
            >
              ⋮
            </Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, palette]);

  const allItems = locations.flatMap(loc =>
    inventory[loc.key]?.map((item, index) => ({ ...item, location: loc.key, index })) || [],
  );

  const searchLower = search.toLowerCase();
  const filteredItems = search
    ? allItems.filter(it =>
        (it.name && it.name.toLowerCase().includes(searchLower)) ||
        (it.location && it.location.toLowerCase().includes(searchLower)) ||
        (it.foodCategory && it.foodCategory.toLowerCase().includes(searchLower)) ||
        (it.note && it.note.toLowerCase().includes(searchLower)),
      )
    : inventory[storage]?.map((item, index) => ({ ...item, location: storage, index })) || [];

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortOrder === 'name') return a.name.localeCompare(b.name);
    if (sortOrder === 'expiration') return new Date(a.expiration || '9999-12-31') - new Date(b.expiration || '9999-12-31');
    if (sortOrder === 'registered') return new Date(a.registered || '9999-12-31') - new Date(b.registered || '9999-12-31');
    return 0;
  });

  let grouped = {};
  let groupOrder = [];

  if (groupBy === 'category') {
    grouped = sortedItems.reduce((acc, item) => {
      const cat = item.foodCategory || 'otros';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
    groupOrder = Object.keys(categories);
    if (grouped['otros']) groupOrder.push('otros');
  } else if (groupBy === 'registered') {
    grouped = sortedItems.reduce((acc, item) => {
      const key = item.registered || 'Sin registro';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
    groupOrder = Object.keys(grouped).sort();
  } else {
    grouped = { all: sortedItems };
    groupOrder = ['all'];
  }

  const onSelectFood = (name, icon) => { setSelectedFood({ name, icon }); setPickerVisible(false); setAddVisible(true); };
  const onMultiSelectFoods = names => { const items = names.map(name => ({ name, icon: getFoodIcon(name) })); setMultiItems(items); setPickerVisible(false); setMultiAddVisible(true); };

  const onSave = data => {
    cleanZeroItems(selectedFood.name);
    const qty = parseFloat(data.quantity) || 0;
    const hasNote = data.note && data.note.trim() !== '';
    if (qty !== 0 || hasNote) addItem(data.location, selectedFood.name, qty, data.unit, data.registered, data.expiration, data.note);
    setAddVisible(false);
  };

  const handleBatchAddSave = entries => {
    const names = new Set(multiItems.map(it => it.name));
    locations.forEach(loc => {
      for (let i = inventory[loc.key].length - 1; i >= 0; i--) {
        const invItem = inventory[loc.key][i];
        if (names.has(invItem.name) && invItem.quantity === 0 && (!invItem.note || invItem.note.trim() === '')) removeItem(loc.key, i);
      }
    });
    for (let i = 0; i < entries.length; i++) {
      const { location, quantity, unit, regDate, expDate, note } = entries[i];
      const item = multiItems[i];
      const qty = parseFloat(quantity) || 0;
      const hasNote = note && note.trim() !== '';
      if (qty !== 0 || hasNote) addItem(location, item.name, qty, unit, regDate, expDate, note);
    }
    setMultiAddVisible(false); setMultiItems([]);
  };

  // ---- Selección múltiple ----
  const toggleSelection = (location, index) => {
    const key = `${location}-${index}`;
    setSelectedItems(prev => {
      const exists = prev.find(it => it.key === key);
      const updated = exists ? prev.filter(it => it.key !== key) : [...prev, { key, location, index }];
      if (updated.length === 0) setMultiSelect(false);
      return updated;
    });
  };
  const addButtonBottom = multiSelect && selectedItems.length > 0 ? 80 : 20;
  const getSelectedFullItems = () => selectedItems.map(sel => ({ ...inventory[sel.location][sel.index], location: sel.location, index: sel.index }));
  const clearSelection = () => { setSelectedItems([]); setMultiSelect(false); };

  const getVisibleKeyOrder = () => groupOrder.flatMap(group => grouped[group]?.map(item => `${item.location}-${item.index}`) || []);
  const selectAll = () => { const allKeys = getVisibleKeyOrder().map(k => { const [location, indexStr] = k.split('-'); return { key: k, location, index: parseInt(indexStr, 10) }; }); setSelectedItems(allKeys); setMultiSelect(true); };
  const selectIntersection = () => {
    if (selectedItems.length < 2) return;
    const keyOrder = getVisibleKeyOrder();
    const indices = selectedItems.map(sel => keyOrder.indexOf(sel.key)).filter(i => i !== -1).sort((a, b) => a - b);
    if (indices.length < 2) return;
    const start = indices[0]; const end = indices[indices.length - 1];
    const newSelection = keyOrder.slice(start, end + 1).map(k => { const [location, indexStr] = k.split('-'); return { key: k, location, index: parseInt(indexStr, 10) }; });
    setSelectedItems(newSelection); setMultiSelect(true);
  };

  // ---- Transfer / Compras / Confirmación ----
  // 'move' | 'copy'
  const handleTransfer = target => {
    const items = getSelectedFullItems();
    if (transferType === 'move') {
      selectedItems.slice().sort((a, b) => a.location === b.location ? b.index - a.index : a.location.localeCompare(b.location)).forEach(sel => removeItem(sel.location, sel.index));
    }
    items.forEach(item => addItem(target, item.name, item.quantity, item.unit, item.registered, item.expiration, item.note));
    clearSelection(); setTransferType(null);
  };

  const handleAddToShopping = () => {
    const items = getSelectedFullItems().map(it => ({ name: it.name, quantity: it.quantity, unit: it.unit }));
    addShoppingItems(items);
    clearSelection();
    setShoppingVisible(false);
  };

  const handleDelete = () => {
    selectedItems.slice().sort((a, b) => a.location === b.location ? b.index - a.index : a.location.localeCompare(b.location)).forEach(sel => removeItem(sel.location, sel.index));
    clearSelection(); setConfirmVisible(false);
  };

  // ===== Scrollbar (custom, tema consistente) =====
  const [containerH, setContainerH] = useState(1);
  const [contentH, setContentH] = useState(1);
  const scrollY = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  const showScrollbar = () => {
    fade.setValue(1);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      Animated.timing(fade, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }, 700);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false, listener: showScrollbar }
  );

  const thumbH = Math.max(24, containerH * (containerH / Math.max(contentH, 1)));
  const maxScroll = Math.max(contentH - containerH, 1);
  const maxThumbTravel = Math.max(containerH - thumbH, 0);
  const thumbTranslateY = scrollY.interpolate({
    inputRange: [0, maxScroll],
    outputRange: [0, maxThumbTravel],
    extrapolate: 'clamp',
  });

  const scrollable = contentH > containerH;

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <StorageSelector current={storage} onChange={setStorage} />

      <View
        style={{ paddingHorizontal: 12, paddingTop: 6, flex: 1, position: 'relative' }}
        onLayout={e => setContainerH(e.nativeEvent.layout.height)}
      >
        {searchVisible && (
          <TextInput
            placeholder="Buscar..."
            placeholderTextColor={palette.textDim}
            value={search}
            onChangeText={setSearch}
            style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface2, color: palette.text, marginBottom: 8, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 }}
          />
        )}

        <Animated.ScrollView
          style={{ marginTop: 4 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={(w, h) => setContentH(h)}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onScrollBeginDrag={showScrollbar}
          onMomentumScrollBegin={showScrollbar}
        >
          {groupOrder.map(cat => {
            const items = grouped[cat];
            if (!items || items.length === 0) return null;
            return (
              <View key={cat} style={{ marginBottom: 14 }}>
                {groupBy !== 'none' && (
                  <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: palette.surface2, borderWidth: 1, borderColor: palette.frame, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, marginBottom: 8 }}>
                    {groupBy === 'category' && categories[cat]?.icon && (
                      <Image source={categories[cat].icon} style={{ width: 18, height: 18, marginRight: 6 }} />
                    )}
                    <Text style={{ fontSize: 14, color: palette.text }}>
                      {groupBy === 'category' ? (categories[cat]?.name || cat.charAt(0).toUpperCase() + cat.slice(1)) : cat}
                    </Text>
                  </View>
                )}

                {viewType === 'list' ? (
                  items.map(item => {
                    const key = `${item.location}-${item.index}`;
                    const selected = selectedItems.some(it => it.key === key);
                    const daysLeft = item.expiration ? Math.ceil((new Date(item.expiration) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                    const meta = getExpiryMeta(palette, daysLeft);
                    const g = gradientForKey(themeName, item.name || key);

                    return (
                      <TouchableOpacity
                        key={key}
                        style={{ marginBottom: 8, opacity: item.quantity === 0 ? 0.55 : 1 }}
                        onLongPress={() => { setMultiSelect(true); toggleSelection(item.location, item.index); }}
                        onPress={() => { if (multiSelect) toggleSelection(item.location, item.index); else setEditingItem({ ...item, index: item.index, category: item.location, location: item.location }); }}
                      >
                        <View style={{ borderRadius: 14, borderWidth: selected ? SELECTED_BORDER_WIDTH : 1, borderColor: selected ? palette.accent : palette.frame, overflow: 'hidden', position: 'relative' }}>
                          
                          <LinearGradient colors={g.colors} locations={g.locations} start={g.start} end={g.end} style={{ padding: 10, flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: palette.surface2, alignItems: 'center', justifyContent: 'center', marginRight: 10, borderWidth: 1, borderColor: palette.frame }}>
                              {item.icon && (<Image source={item.icon} style={{ width: 40, height: 40 }} resizeMode="contain" />)}
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 6 }}>
                              {/* Nombre + badge pegado a la izquierda */}
                              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', minWidth: 0 }}>
                                <Text style={{ color: palette.accent, fontSize: 15, fontWeight: '400', flexShrink: 1 }} numberOfLines={2}>{item.name}</Text>
                                {meta && (
                                  <View style={{ marginLeft: 10, backgroundColor: meta.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                                    <Text style={{ color: meta.text, fontSize: 12, fontWeight: '700' }}>{meta.label}</Text>
                                  </View>
                                )}
                              </View>
                              {/* Controles de cantidad a la derecha */}
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => updateQuantity(item.location, item.index, -1)} style={{ backgroundColor: palette.surface3, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, marginHorizontal: 2 }}>
                                  <Text style={{ color: palette.accent, fontSize: 16 }}>←</Text>
                                </TouchableOpacity>
                                <View style={{ width: 80, alignItems: 'center' }}>
                                  <Text style={{ color: palette.textDim, fontSize: 12 }}>
                                    {item.quantity} {getLabel(item.quantity, item.unit)}
                                  </Text>
                                </View>
                                <TouchableOpacity onPress={() => updateQuantity(item.location, item.index, 1)} style={{ backgroundColor: palette.surface3, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, marginHorizontal: 2 }}>
                                  <Text style={{ color: palette.accent, fontSize: 16 }}>→</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </LinearGradient>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {items.map(item => {
                      const key = `${item.location}-${item.index}`;
                      const selected = selectedItems.some(it => it.key === key);
                      const daysLeft = item.expiration ? Math.ceil((new Date(item.expiration) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                      const meta = getExpiryMeta(palette, daysLeft);
                      const g = gradientForKey(themeName, item.name || key);

                      return (
                        <TouchableOpacity
                          key={key}
                          style={{ width: itemWidth, padding: 6, opacity: item.quantity === 0 ? 0.55 : 1 }}
                          onLongPress={() => { setMultiSelect(true); toggleSelection(item.location, item.index); }}
                          onPress={() => { if (multiSelect) toggleSelection(item.location, item.index); else setEditingItem({ ...item, index: item.index, category: item.location, location: item.location }); }}
                        >
                          <View style={{ borderRadius: 16, borderWidth: selected ? SELECTED_BORDER_WIDTH : 1, borderColor: selected ? palette.accent : palette.frame, overflow: 'hidden', position: 'relative' }}>
                            {meta && (
                              <View style={{ position: 'absolute', top: 6, left: 6, paddingHorizontal: 7, paddingVertical: 3, backgroundColor: meta.bg, borderRadius: 6, zIndex: 20 }}>
                                <Text style={{ fontSize: 11, color: meta.text, fontWeight: '700' }}>{meta.label}</Text>
                              </View>
                            )}
                            <LinearGradient colors={g.colors} locations={g.locations} start={g.start} end={g.end} style={{ padding: 10 }}>
                              <View style={{ backgroundColor: palette.surface2, borderRadius: 12, padding: 6, alignItems: 'center', marginBottom: 6, borderWidth: 1, borderColor: palette.frame }}>
                                {item.icon && (<Image source={item.icon} style={{ width: 54, height: 54 }} resizeMode="contain" />)}
                              </View>
                              <Text style={{ textAlign: 'center', color: palette.accent, fontSize: 12, fontWeight: '400' }} numberOfLines={2}>
                                {item.name}
                              </Text>
                              <Text style={{ textAlign: 'center', color: palette.textDim, fontSize: 11 }}>
                                {item.quantity} {getLabel(item.quantity, item.unit)}
                              </Text>
                            </LinearGradient>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </Animated.ScrollView>

        {/* Scrollbar overlay */}
        {scrollable && (
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 6,
              bottom: 6,
              right: 4,
              width: 4,
              borderRadius: 2,
              backgroundColor: 'transparent',
              opacity: fade,
            }}
          >
            <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, borderRadius: 2, backgroundColor: 'rgba(44,48,56,0.35)' }} />
            <Animated.View
              style={{
                position: 'absolute',
                left: 0,
                width: 4,
                borderRadius: 2,
                height: thumbH,
                transform: [{ translateY: thumbTranslateY }],
                backgroundColor: palette.accent,
              }}
            />
          </Animated.View>
        )}
      </View>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setPickerVisible(true)}
        style={{ position: 'absolute', right: 20, bottom: addButtonBottom, backgroundColor: palette.accent, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e2b06c' }}
      >
        <Text style={{ fontSize: 30, color: '#211c13', marginTop: -2 }}>＋</Text>
      </TouchableOpacity>

      {/* Toolbar multiselección */}
      {multiSelect && selectedItems.length > 0 && (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', backgroundColor: palette.surface2, padding: 10, borderTopWidth: 1, borderColor: palette.border }}>
          <TouchableOpacity style={{ backgroundColor: palette.surface3, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, margin: 4, borderWidth: 1, borderColor: palette.border }} onPress={() => { setSelectedItems([]); setMultiSelect(false); }}>
            <Text style={{ fontSize: 16, color: palette.text }}>❌</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ backgroundColor: palette.surface3, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, margin: 4, borderWidth: 1, borderColor: palette.border }} onPress={selectAll}>
            <Text style={{ fontSize: 16, color: palette.text }}>Seleccionar todo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ backgroundColor: palette.surface3, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, margin: 4, borderWidth: 1, borderColor: palette.border }} onPress={selectIntersection}>
            <Text style={{ fontSize: 16, color: palette.text }}>Intersección</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ backgroundColor: palette.accent, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, margin: 4 }} onPress={() => setTransferType('move')}>
            <Text style={{ color: '#1b1d22', fontSize: 16 }}>🔀</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ backgroundColor: palette.accent, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, margin: 4 }} onPress={() => setTransferType('copy')}>
            <Text style={{ color: '#1b1d22', fontSize: 16 }}>📄</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ backgroundColor: '#4caf50', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, margin: 4 }} onPress={() => setShoppingVisible(true)}>
            <Text style={{ color: '#fff', fontSize: 16 }}>🛒</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ backgroundColor: '#e53935', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, margin: 4 }} onPress={() => setConfirmVisible(true)}>
            <Text style={{ color: '#fff', fontSize: 16 }}>🗑️</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Menú, Sort, View */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }}>
            <TouchableWithoutFeedback>
              <View style={{ position: 'absolute', top: 40, right: 10, backgroundColor: palette.surface, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: palette.border }}>
                <Button title="Clasificar" color={palette.accent} onPress={() => { setMenuVisible(false); setSortVisible(true); }} />
                <View style={{ height: 8 }} />
                <Button title="Tipo de vista" color={palette.accent} onPress={() => { setMenuVisible(false); setViewVisible(true); }} />
                <View style={{ height: 8 }} />
                <Button title="Ajustes" color={palette.accent} onPress={() => { setMenuVisible(false); navigation.navigate('Settings'); }} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal visible={sortVisible} transparent animationType="fade" onRequestClose={() => setSortVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setSortVisible(false)}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)' }}>
            <TouchableWithoutFeedback>
              <View style={{ backgroundColor: palette.surface, padding: 20, borderRadius: 12, width: '80%', maxWidth: 300, borderWidth: 1, borderColor: palette.border }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: palette.text }}>Ordenar por</Text>
                {[{ key: 'name', label: 'Nombre' },{ key: 'expiration', label: 'Fecha de caducidad' },{ key: 'registered', label: 'Fecha de registro' }].map(opt => (
                  <TouchableOpacity key={opt.key} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }} onPress={() => setTempSortOrder(opt.key)}>
                    <Text style={{ color: palette.text }}>{tempSortOrder === opt.key ? '◉' : '○'}</Text>
                    <Text style={{ marginLeft: 6, color: palette.text }}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: palette.text }}>Agrupar por</Text>
                {[{ key: 'category', label: 'Categoría' },{ key: 'none', label: 'Sin agrupación' },{ key: 'registered', label: 'Fecha de registro' }].map(opt => (
                  <TouchableOpacity key={opt.key} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }} onPress={() => setTempGroupBy(opt.key)}>
                    <Text style={{ color: palette.text }}>{tempGroupBy === opt.key ? '◉' : '○'}</Text>
                    <Text style={{ marginLeft: 6, color: palette.text }}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                  <TouchableOpacity onPress={() => setSortVisible(false)} style={{ padding: 10, marginRight: 10 }}>
                    <Text style={{ color: palette.accent }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setSortOrder(tempSortOrder); setGroupBy(tempGroupBy); setSortVisible(false); }} style={{ backgroundColor: palette.accent, padding: 10, borderRadius: 6 }}>
                    <Text style={{ color: '#1b1d22' }}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal visible={viewVisible} transparent animationType="fade" onRequestClose={() => setViewVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setViewVisible(false)}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)' }}>
            <TouchableWithoutFeedback>
              <View style={{ backgroundColor: palette.surface, padding: 20, borderRadius: 12, width: '80%', maxWidth: 300, borderWidth: 1, borderColor: palette.border }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: palette.text }}>Tipo de vista</Text>
                {[{ key: 'list', label: 'Lista' },{ key: 'grid', label: 'Cuadrícula' }].map(opt => (
                  <TouchableOpacity key={opt.key} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }} onPress={() => setTempViewType(opt.key)}>
                    <Text style={{ color: palette.text }}>{tempViewType === opt.key ? '◉' : '○'}</Text>
                    <Text style={{ marginLeft: 6, color: palette.text }}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                  <TouchableOpacity onPress={() => setViewVisible(false)} style={{ padding: 10, marginRight: 10 }}>
                    <Text style={{ color: palette.accent }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setViewType(tempViewType); setViewVisible(false); }} style={{ backgroundColor: palette.accent, padding: 10, borderRadius: 6 }}>
                    <Text style={{ color: '#1b1d22' }}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modales de negocio */}
      <FoodPickerModal visible={pickerVisible} onSelect={onSelectFood} onMultiSelect={onMultiSelectFoods} onClose={() => setPickerVisible(false)} />
      <AddItemModal visible={addVisible} foodName={selectedFood?.name} foodIcon={selectedFood?.icon} initialLocation={storage} onSave={onSave} onClose={() => setAddVisible(false)} />
      <BatchAddItemModal visible={multiAddVisible} items={multiItems} onSave={handleBatchAddSave} onClose={() => setMultiAddVisible(false)} />
      <EditItemModal
        visible={!!editingItem}
        item={editingItem}
        onSave={data => { updateItem(editingItem.category, editingItem.index, data); setEditingItem(null); }}
        onDelete={() => { removeItem(editingItem.category, editingItem.index); setEditingItem(null); }}
        onClose={() => setEditingItem(null)}
      />

      <Modal visible={shoppingVisible} transparent animationType="fade" onRequestClose={() => setShoppingVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setShoppingVisible(false)}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)' }}>
            <TouchableWithoutFeedback>
              <View style={{ backgroundColor: palette.surface, padding: 20, borderRadius: 12, maxHeight: '80%', width: '80%', borderWidth: 1, borderColor: palette.border }}>
                <Text style={{ marginBottom: 10, color: palette.text }}>
                  Añadir los siguientes {selectedItems.length} elementos a la lista de compras?
                </Text>
                <ScrollView style={{ marginBottom: 10 }}>
                  {getSelectedFullItems().map((item, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface2, padding: 6, marginBottom: 6, borderRadius: 8 }}>
                      {item.icon && <Image source={item.icon} style={{ width: 30, height: 30, marginRight: 10 }} />}
                      <Text style={{ color: palette.text }}>{item.name} - {item.quantity} {getLabel(item.quantity, item.unit)}</Text>
                    </View>
                  ))}
                </ScrollView>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                  <Button title="Cancelar" color={palette.accent} onPress={() => setShoppingVisible(false)} />
                  <Button title="Añadir" color={palette.accent} onPress={handleAddToShopping} />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal visible={!!transferType} transparent animationType="fade" onRequestClose={() => setTransferType(null)}>
        <TouchableWithoutFeedback onPress={() => setTransferType(null)}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)' }}>
            <TouchableWithoutFeedback>
              <View style={{ backgroundColor: palette.surface, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: palette.border }}>
                <Text style={{ marginBottom: 10, color: palette.text }}>
                  {transferType === 'move' ? 'Mover a:' : 'Copiar a:'}
                </Text>
                {locations.map(opt => (
                  <Button key={opt.key} title={opt.name} color={palette.accent} onPress={() => handleTransfer(opt.key)} />
                ))}
                <View style={{ height: 8 }} />
                <Button title="Cancelar" color={palette.accent} onPress={() => setTransferType(null)} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={() => setConfirmVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setConfirmVisible(false)}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)' }}>
            <TouchableWithoutFeedback>
              <View style={{ backgroundColor: palette.surface, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: palette.border }}>
                <Text style={{ marginBottom: 10, color: palette.text }}>
                  ¿Eliminar {selectedItems.length} items?
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                  <Button title="Cancelar" color={palette.accent} onPress={() => setConfirmVisible(false)} />
                  <Button title="Eliminar" color={palette.accent} onPress={handleDelete} />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

