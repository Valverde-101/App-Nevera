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
import EditDefaultFoodModal from './EditDefaultFoodModal';
import { useCustomFoods } from '../context/CustomFoodsContext';
import { useCategories } from '../context/CategoriesContext';
import { useDefaultFoods } from '../context/DefaultFoodsContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, useThemeController } from '../context/ThemeContext';
import { gradientForKey } from '../theme/gradients';

export default function FoodPickerModal({
  visible,
  onSelect,
  onClose,
  onMultiSelect,
  showCreate = true,
  showMenu = true,
}) {
  const palette = useTheme();
  const { themeName } = useThemeController();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { categories } = useCategories();
  // subscribe to default food overrides so default names update after refresh
  const { overrides } = useDefaultFoods();
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
  const [editKey, setEditKey] = useState(null);

  // === Estados para "ocultar" scrollbars sin mover layout (web) ===
  const [hoverCat, setHoverCat] = useState(false);
  const [hoverGrid, setHoverGrid] = useState(false);
  const [hoverManageCat, setHoverManageCat] = useState(false);
  const [hoverManageGrid, setHoverManageGrid] = useState(false);
  const [manageCategory, setManageCategory] = useState(baseCategoryNames[0] || '');
  const hiddenBg = themeName === 'dark' ? '#181b22' : '#d0d0d0';

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
    if (manageVisible && baseCategoryNames.length) {
      setManageCategory(baseCategoryNames[0]);
    }
  }, [manageVisible]);

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
      onMultiSelect(selected);
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
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() =>
                    setSearchVisible(v => {
                      if (v) setSearch('');
                      return !v;
                    })
                  }
                  style={[styles.iconBtn, { marginRight: showCreate || showMenu ? 8 : 0 }]}
                >
                  <Text style={styles.iconText}>🔍</Text>
                </TouchableOpacity>
                {showCreate && (
                  <TouchableOpacity
                    onPress={() => setAddVisible(true)}
                    style={[styles.createBtn, { marginRight: showMenu ? 8 : 0 }]}
                  >
                    <Text style={styles.createText}>Crear Nuevo</Text>
                  </TouchableOpacity>
                )}
                {showMenu && (
                  <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.iconBtn}>
                    <Text style={styles.iconText}>⋮</Text>
                  </TouchableOpacity>
                )}
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
                        : onSelect(food.key, food.icon)
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
      {showMenu && (
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
      )}

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
                <Text style={{ textAlign: 'center', color: palette.textDim }}>
                  Mantener presionado el alimento para editar más detalles
                </Text>
              </View>
              <View style={styles.catBar}>
                <ScrollView
                  horizontal
                  contentContainerStyle={styles.catRow}
                  onMouseEnter={() => setHoverManageCat(true)}
                  onMouseLeave={() => setHoverManageCat(false)}
                  showsHorizontalScrollIndicator={Platform.OS === 'web' ? true : false}
                  style={[
                    Platform.OS === 'web' ? webScrollBase : null,
                    Platform.OS === 'web' ? (hoverManageCat ? webScrollVisible : webScrollHidden) : null,
                  ]}
                >
                  {baseCategoryNames.map(cat => {
                    const active = manageCategory === cat;
                    const g = gradientForKey(themeName, cat);
                    return (
                      <Pressable key={cat} onPress={() => setManageCategory(cat)} style={{ paddingHorizontal: 6 }}>
                        <View style={[styles.catCard, active && styles.catCardActive, { width: catCardSize, height: catCardSize }]}>
                          <LinearGradient colors={g.colors} locations={g.locations} start={g.start} end={g.end} style={[styles.catCardGrad, { flex: 1 }]}>
                            <View style={styles.catIconBox}>
                              {baseCategories[cat]?.icon && (
                                <Image source={baseCategories[cat].icon} style={{ width: 44, height: 44 }} resizeMode="contain" />
                              )}
                            </View>
                            <Text style={[styles.catTitle, active && styles.catTitleActive]} numberOfLines={1}>
                              {baseCategories[cat]?.name || cat}
                            </Text>
                          </LinearGradient>
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
              <ScrollView
                onMouseEnter={() => setHoverManageGrid(true)}
                onMouseLeave={() => setHoverManageGrid(false)}
                style={[
                  { flex: 1 },
                  Platform.OS === 'web' ? webScrollBase : null,
                  Platform.OS === 'web' ? (hoverManageGrid ? webScrollVisible : webScrollHidden) : null,
                ]}
                contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', padding: 8 }}
                showsVerticalScrollIndicator={Platform.OS === 'web' ? true : false}
              >
                {(baseCategories[manageCategory]?.items || []).map(name => {
                  const hidden = hiddenFoods.includes(name);
                  const g = gradientForKey(themeName, name);
                  return (
                    <Pressable
                      key={name}
                      style={{ width: '25%', padding: 6 }}
                      onPress={() =>
                        setHiddenFoods(prev =>
                          prev.includes(name)
                            ? prev.filter(n => n !== name)
                            : [...prev, name],
                        )
                      }
                      onLongPress={() => setEditKey(name)}
                    >
                      <View style={styles.card}>
                        <LinearGradient
                          colors={g.colors}
                          locations={g.locations}
                          start={g.start}
                          end={g.end}
                          style={styles.cardGrad}
                        >
                          <View style={styles.foodIconBox}>
                            <Image source={foodIcons[name]} style={{ width: 44, height: 44 }} resizeMode="contain" />
                          </View>
                          <Text numberOfLines={2} style={styles.foodLabel}>
                            {getFoodInfo(name)?.name || name}
                          </Text>
                        </LinearGradient>
                        {hidden && (
                          <View
                            style={[
                              styles.hiddenOverlay,
                              { backgroundColor: hiddenBg, opacity: 0.6 },
                            ]}
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <TouchableOpacity onPress={() => setManageVisible(false)} style={[styles.bottomBtn, { alignSelf: 'center', backgroundColor: palette.accent, marginBottom: 10 }]}>
                <Text style={{ color: '#1b1d22', fontWeight: '700' }}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      {/* Añadir personalizado */}
      <AddCustomFoodModal visible={addVisible} onClose={() => setAddVisible(false)} />
      <EditDefaultFoodModal
        visible={!!editKey}
        foodKey={editKey}
        onClose={() => setEditKey(null)}
      />
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
    height: 40,
    paddingHorizontal: 10,
    backgroundColor: palette.surface2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { color: palette.text, fontSize: 18 },
  createBtn: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.accent,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2b06c',
  },
  createText: { color: palette.bg, fontSize: 16, fontWeight: '600' },

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

  hiddenOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

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

