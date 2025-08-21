// FoodPickerModal.js – dark–premium v2.2.10 (stable, overlay-like scrollbars on web)
import React, { useEffect, useState, useMemo } from 'react';
import {
  Button,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  Pressable,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import foodIcons, {
  categories as baseCategories,
  getFoodIcon,
  getFoodInfo,
  normalizeFoodName,
} from '../foodIcons';
import AddCustomFoodModal from './AddCustomFoodModal';
import { useCustomFoods } from '../context/CustomFoodsContext';
import { useCategories } from '../context/CategoriesContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, useThemeController } from '../context/ThemeContext';
import { gradientForKey } from '../theme/gradients';

export default function FoodPickerModal({
  visible,
  onSelect,
  onClose,
  onMultiSelect,
}) {
  const palette = useTheme();
  const { themeName } = useThemeController();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { categories } = useCategories();
  const categoryNames = Object.keys(categories);
  const baseCategoryNames = Object.keys(baseCategories);
  const [currentCategory, setCurrentCategory] = useState(categoryNames[0] || '');
  const [search, setSearch] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [manageVisible, setManageVisible] = useState(false);
  const [hiddenFoods, setHiddenFoods] = useState([]);
  const { customFoods } = useCustomFoods();
  const [addVisible, setAddVisible] = useState(false);

  // === Estados para "ocultar" scrollbars sin mover layout (web) ===
  const [hoverCat, setHoverCat] = useState(false);
  const [hoverGrid, setHoverGrid] = useState(false);
  const [hoverManage, setHoverManage] = useState(false);

  useEffect(() => {
    const names = Object.keys(categories);
    if (names.length && !names.includes(currentCategory)) {
      setCurrentCategory(names[0]);
    }
  }, [categories, currentCategory]);

  useEffect(() => {
    if (!visible) {
      setSelectMode(false);
      setSelected([]);
      setSearch('');
      setSearchVisible(false);
    }
  }, [visible]);

  useEffect(() => {
    AsyncStorage.getItem('hiddenFoods').then(data => {
      if (data) setHiddenFoods(JSON.parse(data));
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('hiddenFoods', JSON.stringify(hiddenFoods));
  }, [hiddenFoods]);

  const toggleSelect = key => {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(n => n !== key) : [...prev, key],
    );
  };

  const handleSave = () => {
    if (onMultiSelect && selected.length) {
      const names = selected.map(k => customFoodMap[k]?.name || getFoodInfo(k)?.name || k);
      onMultiSelect(names);
    }
    setSelectMode(false);
    setSelected([]);
  };

  const customFoodMap = {};
  customFoods.forEach(f => {
    customFoodMap[f.key] = f;
  });

  const defaultFoods = (categories[currentCategory]?.items || [])
    .filter(name => !hiddenFoods.includes(name))
    .filter(name => {
      const info = getFoodInfo(name);
      return normalizeFoodName(info?.name || '').includes(
        normalizeFoodName(search),
      );
    })
    .map(name => {
      const info = getFoodInfo(name);
      return { key: name, label: info?.name || name, icon: foodIcons[name] };
    });

  const customList = customFoods
    .filter(f => f.category === currentCategory)
    .filter(f => !hiddenFoods.includes(f.key))
    .filter(f => normalizeFoodName(f.name).includes(normalizeFoodName(search)))
    .map(f => ({
      key: f.key,
      label: f.name,
      icon: f.icon ? { uri: f.icon } : getFoodIcon(f.baseIcon || f.name),
    }));

  const foods = [...defaultFoods, ...customList];

  // Cards de categoría cuadradas
  const winW = Dimensions.get('window').width;
  const catCardSize = Math.max(80, Math.min(120, Math.floor(winW * 0.25)));

  // ==== Scrollbar helpers (WEB): mantener gutter estable y "ocultar" con transparencia ====
  const webScrollBase = Platform.OS === 'web' ? { scrollbarWidth: 'thin', scrollbarGutter: 'stable both-edges' } : null;
  const webScrollVisible = Platform.OS === 'web' ? { scrollbarColor: `${palette.accent} ${palette.surface2}` } : null;
  const webScrollHidden = Platform.OS === 'web' ? { scrollbarColor: `transparent transparent` } : null;

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
                <Text style={styles.iconText}>←</Text>
              </TouchableOpacity>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  onPress={() =>
                    setSearchVisible(v => {
                      if (v) setSearch('');
                      return !v;
                    })
                  }
                  style={[styles.iconBtn, { marginRight: 8 }]}
                >
                  <Text style={styles.iconText}>🔍</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setAddVisible(true)} style={[styles.iconBtn, { marginRight: 8 }]}> 
                  <Text style={[styles.iconText, { fontSize: 14 }]}>Crear Personalizado</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.iconBtn}>
                  <Text style={styles.iconText}>⋮</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Categorías: cards grandes en carrusel horizontal */}
            <View style={styles.catBar}>
              <ScrollView
                horizontal
                contentContainerStyle={styles.catRow}
                onMouseEnter={() => setHoverCat(true)}
                onMouseLeave={() => setHoverCat(false)}
                showsHorizontalScrollIndicator={Platform.OS === 'web' ? true : false}
                style={[
                  Platform.OS === 'web' ? webScrollBase : null,
                  Platform.OS === 'web' ? (hoverCat ? webScrollVisible : webScrollHidden) : null,
                ]}
              >
                {categoryNames.map((cat) => {
                  const active = currentCategory === cat;
                  const g = gradientForKey(themeName, cat);
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setCurrentCategory(cat)}
                      style={{ paddingHorizontal: 6 }}
                    >
                      <View style={[styles.catCard, active && styles.catCardActive, { width: catCardSize, height: catCardSize }]}>
                        <LinearGradient colors={g.colors} locations={g.locations} start={g.start} end={g.end} style={[styles.catCardGrad, { flex: 1 }]}> 
                          <View style={styles.catIconBox}>
                            {categories[cat]?.icon && (
                              <Image
                                source={categories[cat].icon}
                                style={{ width: 44, height: 44 }}
                                resizeMode="contain"
                              />
                            )}
                          </View>
                          <Text style={[styles.catTitle, active && styles.catTitleActive]} numberOfLines={1}>
                            {categories[cat]?.name || cat}
                          </Text>
                        </LinearGradient>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Search */}
            {searchVisible && (
              <View style={{ paddingHorizontal: 12, paddingTop: 6, backgroundColor: palette.bg }}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar alimento"
                  placeholderTextColor={palette.textDim}
                  value={search}
                  onChangeText={setSearch}
                />
              </View>
            )}

            {/* Foods grid */}
            <ScrollView
              onMouseEnter={() => setHoverGrid(true)}
              onMouseLeave={() => setHoverGrid(false)}
              style={[
                { flex: 1 },
                Platform.OS === 'web' ? webScrollBase : null,
                Platform.OS === 'web' ? (hoverGrid ? webScrollVisible : webScrollHidden) : null,
              ]}
              contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', padding: 8 }}
              showsVerticalScrollIndicator={Platform.OS === 'web' ? true : false}
            >
              {foods.map(food => {
                const isSelected = selected.includes(food.key);
                const g = gradientForKey(themeName, food.key);
                return (
                  <TouchableOpacity
                    key={food.key}
                    style={{ width: '25%', padding: 6 }}
                    onPress={() =>
                      selectMode
                        ? toggleSelect(food.key)
                        : onSelect(food.label, food.icon)
                    }
                    onLongPress={() => {
                      if (!selectMode) {
                        setSelectMode(true);
                        toggleSelect(food.key);
                      }
                    }}
                  >
                    <View style={[styles.card, isSelected && styles.cardSelected]}>
                      {/* Badge selección */}
                      {selectMode && (
                        <View style={[styles.badge, { backgroundColor: isSelected ? palette.accent : palette.surface3 }]}>
                          <Text style={{ color: isSelected ? '#1b1d22' : palette.text }}>✓</Text>
                        </View>
                      )}
                      <LinearGradient colors={g.colors} locations={g.locations} start={g.start} end={g.end} style={styles.cardGrad}>
                        <View style={styles.foodIconBox}>
                          {food.icon && (
                            <Image source={food.icon} style={{ width: 44, height: 44 }} resizeMode="contain" />
                          )}
                        </View>
                        <Text numberOfLines={2} style={styles.foodLabel}>{food.label}</Text>
                      </LinearGradient>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Toolbar selección */}
            {selectMode ? (
              <View style={styles.bottomBar}>
                <TouchableOpacity
                  onPress={() => { setSelectMode(false); setSelected([]); }}
                  style={[styles.bottomBtn, { backgroundColor: palette.surface3 }]}
                >
                  <Text style={{ color: palette.text }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={[styles.bottomBtn, { backgroundColor: palette.accent }]}>
                  <Text style={{ color: '#1b1d22', fontWeight: '700' }}>Guardar</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Menú */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuBackdrop}>
            <View style={styles.menuCard}>
              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  setManageVisible(true);
                }}
                style={styles.menuItem}
              >
                <Text style={{ color: palette.text }}>Administrar alimentos predeterminados</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Administrar predeterminados */}
      <Modal visible={manageVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.sheet, { padding: 12 }]}>
            <View style={{ borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface2, padding: 10, marginBottom: 10, borderRadius: 10 }}>
              <Text style={{ textAlign: 'center', color: palette.text }}>
                Lista completa de todos los alimentos predeterminados
              </Text>
              <Text style={{ textAlign: 'center', color: palette.textDim }}>
                Los alimentos sombreados no se mostrarán en la lista de agregar
              </Text>
            </View>
            <ScrollView
              onMouseEnter={() => setHoverManage(true)}
              onMouseLeave={() => setHoverManage(false)}
              style={[
                { flex: 1 },
                Platform.OS === 'web' ? webScrollBase : null,
                Platform.OS === 'web' ? (hoverManage ? webScrollVisible : webScrollHidden) : null,
              ]}
              contentContainerStyle={{ paddingBottom: 10 }}
              showsVerticalScrollIndicator={Platform.OS === 'web' ? true : false}
            >
              {baseCategoryNames.map(cat => (
                <View key={cat} style={{ marginBottom: 14 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 6, color: palette.accent }}>
                    {baseCategories[cat]?.name || cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {baseCategories[cat].items.map(name => {
                      const hidden = hiddenFoods.includes(name);
                      return (
                        <Pressable
                          key={name}
                          style={{ width: '25%', padding: 6, alignItems: 'center' }}
                          onPress={() =>
                            setHiddenFoods(prev =>
                              prev.includes(name)
                                ? prev.filter(n => n !== name)
                                : [...prev, name],
                            )
                          }
                        >
                          <View
                            style={{
                              borderRadius: 12,
                              padding: 6,
                              backgroundColor: hidden ? palette.surface3 : palette.surface2,
                              borderWidth: 1,
                              borderColor: palette.border,
                            }}
                          >
                            <Image
                              source={foodIcons[name]}
                              style={{ width: 44, height: 44, opacity: hidden ? 0.5 : 1 }}
                              resizeMode="contain"
                            />
                          </View>
                          <Text style={{ textAlign: 'center', marginTop: 5, color: palette.text }} numberOfLines={2}>{name}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setManageVisible(false)} style={[styles.bottomBtn, { alignSelf: 'center', backgroundColor: palette.accent, marginBottom: 10 }]}>
              <Text style={{ color: '#1b1d22', fontWeight: '700' }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Añadir personalizado */}
      <AddCustomFoodModal visible={addVisible} onClose={() => setAddVisible(false)} />
    </>
  );
}

const createStyles = (palette) => StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    flex: 1,
    backgroundColor: palette.bg,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: palette.surface,
    borderBottomWidth: 1,
    borderColor: palette.border,
  },
  iconBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: palette.surface2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
  },
  iconText: { color: palette.text, fontSize: 18 },

  // === Categorías (cards grandes en carrusel) ===
  catBar: {
    backgroundColor: palette.surface,
    borderBottomWidth: 1,
    borderColor: palette.frame,
  },
  catRow: {
    alignItems: 'stretch',
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  catCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.frame,
    overflow: 'hidden',
  },
  catCardActive: { borderColor: palette.accent },
  catCardGrad: { padding: 10, alignItems: 'center', justifyContent: 'center' },
  catIconBox: {
    width: 56, height: 56, borderRadius: 12,
    backgroundColor: palette.surface2,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: palette.frame,
    marginBottom: 6,
  },
  catTitle: { color: palette.text, fontSize: 14 },
  catTitleActive: { color: palette.accent },

  // === Search ===
  searchInput: {
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface2,
    color: palette.text,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },

  // === Food cards ===
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.frame,
    overflow: 'hidden',
    position: 'relative',
  },
  cardSelected: { borderColor: palette.accent },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 10,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: palette.border,
  },
  cardGrad: { padding: 8, alignItems: 'center' },
  foodIconBox: {
    width: 56, height: 56, borderRadius: 12,
    backgroundColor: palette.surface2,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: palette.frame,
    marginBottom: 6,
  },
  foodLabel: { textAlign: 'center', color: palette.accent, fontSize: 12, fontWeight: '400' },

  bottomBar: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: palette.surface2,
    borderTopWidth: 1,
    borderColor: palette.border,
  },
  bottomBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.border,
    minWidth: 120,
    alignItems: 'center',
  },

  // === Menú ===
  menuBackdrop: {
    flex: 1,
    alignItems: 'flex-end',
    paddingTop: 40,
    paddingRight: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  menuCard: {
    backgroundColor: palette.surface,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.border,
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
});

