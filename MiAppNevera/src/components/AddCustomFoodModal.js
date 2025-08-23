// AddCustomFoodModal.js – dark–premium v2.2.13
// - UI consistente con la app (bg oscuro, inputs grises, botones accent)
// - ScrollView con scrollbar dorada en Web y gutter estable
// - Gestión de ingredientes/categorías con modales coherentes
// - Confirmaciones estilizadas y avisos cuando algo está en uso
import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getFoodIcon, getFoodCategory } from '../foodIcons';
import { useCustomFoods } from '../context/CustomFoodsContext';
import { useCategories } from '../context/CategoriesContext';
import { useInventory } from '../context/InventoryContext';
import { useShopping } from '../context/ShoppingContext';
import { useRecipes } from '../context/RecipeContext';
import AddCategoryModal from './AddCategoryModal';
import { useTheme } from '../context/ThemeContext';
import { useUnits } from '../context/UnitsContext';
import { useTranslation } from '../context/LanguageContext';

// ========================
// Gestor de personalizados
// ========================
function ManageCustomFoodsModal({ visible, onClose, onEdit }) {
  const palette = useTheme();
  const t = useTranslation();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { customFoods, removeCustomFood } = useCustomFoods();
  const { customCategories, categories, removeCategory } = useCategories();
  const { inventory } = useInventory();
  const { list: shoppingList } = useShopping();
  const { recipes } = useRecipes();
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [foodToDelete, setFoodToDelete] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [warning, setWarning] = useState(null);

  const foodsByCategory = customFoods.reduce((acc, food) => {
    const cat = food.category || 'otros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(food);
    return acc;
  }, {});
  const categoryOrder = Object.keys(categories);

  const toggleSelect = key => {
    setSelected(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]));
  };

  const selectAll = () => setSelected(customFoods.map(f => f.key));

  const isFoodInUse = name => {
    const inInventory = Object.values(inventory).some(items => items.some(it => it.name === name));
    const inShopping = shoppingList.some(it => it.name === name);
    const inRecipes = recipes.some(rec => rec.ingredients.some(ing => ing.name === name));
    return inInventory || inShopping || inRecipes;
  };

  const isCategoryInUse = key => {
    const inInventory = Object.values(inventory).some(items => items.some(it => it.foodCategory === key));
    const inShopping = shoppingList.some(it => it.foodCategory === key);
    const inRecipes = recipes.some(rec => rec.ingredients.some(ing => getFoodCategory(ing.name) === key));
    return inInventory || inShopping || inRecipes;
  };

  const deleteSelected = () => {
    const foods = customFoods.filter(f => selected.includes(f.key));
    const inUse = foods.filter(f => isFoodInUse(f.name));
    if (inUse.length) {
      setWarning(t('customFood.inUseWarning'));
      return;
    }
    setFoodToDelete({ multiple: true, items: foods });
  };

  const handleDeleteFood = food => {
    if (isFoodInUse(food.name)) {
      setWarning(t('customFood.cannotDelete', { name: food.name }));
    } else {
      setFoodToDelete(food);
    }
  };

  const handleDeleteCategory = cat => {
    if (customFoods.some(f => f.category === cat.key)) {
      setWarning(t('customFood.categoryHasItems'));
      return;
    }
    if (isCategoryInUse(cat.key)) {
      setWarning(t('customFood.categoryInUse', { name: cat.name }));
      return;
    }
    setCategoryToDelete(cat);
  };

  const confirmDeleteFood = () => {
    if (foodToDelete) {
      if (foodToDelete.multiple) {
        foodToDelete.items.forEach(f => removeCustomFood(f.key));
        setSelected([]);
        setSelectMode(false);
      } else {
        removeCustomFood(foodToDelete.key);
      }
    }
    setFoodToDelete(null);
  };

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      removeCategory(categoryToDelete.key);
    }
    setCategoryToDelete(null);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, backgroundColor: palette.bg }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => { setSelectMode(false); setSelected([]); onClose(); }} style={styles.iconBtn}>
            <Text style={styles.iconTxt}>←</Text>
          </TouchableOpacity>
          {selectMode ? (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={selectAll} style={[styles.actionBtn, { marginRight: 8 }]}>
                <Text style={styles.actionTxt}>{t('common.selectAll')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={deleteSelected} style={[styles.actionBtn, styles.actionBtnDanger, { marginRight: 8 }]}>
                <Text style={styles.actionBtnDangerText}>{t('common.delete')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setSelectMode(false); setSelected([]); }} style={styles.actionBtn}>
                <Text style={styles.actionTxt}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setSelectMode(true)} style={styles.actionBtn}>
              <Text style={styles.actionTxt}>{t('common.select')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
          showsVerticalScrollIndicator={Platform.OS === 'web' ? true : false}
        >
          <Text style={styles.blockTitle}>{t('customFood.customCategories')}</Text>
          {customCategories.map(cat => (
            <View key={cat.key} style={styles.row}>
              {cat.icon && <Image source={{ uri: cat.icon }} style={styles.icon} />}
              <Text style={[styles.rowText, { flex: 1 }]}>{cat.name} <Text style={styles.rowSub}>• {cat.key}</Text></Text>
              <TouchableOpacity onPress={() => handleDeleteCategory(cat)} style={[styles.smallBtn, styles.smallBtnDanger]}>
                <Text style={styles.smallBtnDangerText}>{t('common.delete')}</Text>
              </TouchableOpacity>
            </View>
          ))}

          <Text style={[styles.blockTitle, { marginTop: 10 }]}>{t('customFood.customIngredients')}</Text>
          {categoryOrder.map(catKey => {
            const list = foodsByCategory[catKey];
            if (!list || list.length === 0) return null;
            return (
              <View key={catKey} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{categories[catKey]?.name || catKey}</Text>
                </View>
                {list.map(f => {
                  const isSelected = selected.includes(f.key);
                  return (
                    <View key={f.key} style={[styles.row, isSelected && styles.rowSelected]}>
                      {(f.icon || getFoodIcon(f.baseIcon || f.name)) && (
                        <Image source={f.icon ? { uri: f.icon } : getFoodIcon(f.baseIcon || f.name)} style={styles.icon} />
                      )}
                      <Text style={[styles.rowText, { flex: 1 }]}>{f.name}</Text>
                      {selectMode ? (
                        <TouchableOpacity onPress={() => toggleSelect(f.key)} style={[styles.smallBtn, isSelected && styles.smallBtnAccent]}>
                          <Text style={isSelected ? styles.smallBtnAccentText : styles.smallBtnText}>
                            {isSelected ? '☑' : '☐'}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <>
                          <TouchableOpacity onPress={() => onEdit(f)} style={styles.smallBtn}>
                            <Text style={styles.smallBtnText}>{t('common.edit')}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDeleteFood(f)} style={[styles.smallBtn, styles.smallBtnDanger]}>
                            <Text style={styles.smallBtnDangerText}>{t('common.delete')}</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </ScrollView>

        {/* Confirmar eliminación de alimentos */}
        {foodToDelete && (
          <Modal visible animationType="fade" transparent onRequestClose={() => setFoodToDelete(null)}>
            <TouchableWithoutFeedback onPress={() => setFoodToDelete(null)}>
              <View style={styles.modalBackdrop}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalCard}>
                    {foodToDelete.multiple ? (
                      <>
                        <Text style={styles.modalTitle}>{t('customFood.deleteSelectedTitle')}</Text>
                        <ScrollView style={{ maxHeight: 200, width: '100%' }}>
                          {foodToDelete.items.map(item => (
                            <View key={item.key} style={[styles.row, { backgroundColor: 'transparent', borderWidth: 0, paddingHorizontal: 0 }]}>
                              {(item.icon || getFoodIcon(item.baseIcon || item.name)) && (
                                <Image
                                  source={item.icon ? { uri: item.icon } : getFoodIcon(item.baseIcon || item.name)}
                                  style={[styles.icon, { width: 28, height: 28 }]}
                                />
                              )}
                              <Text style={styles.rowText}>{item.name}</Text>
                            </View>
                          ))}
                        </ScrollView>
                      </>
                    ) : (
                      <>
                        {(foodToDelete.icon || getFoodIcon(foodToDelete.baseIcon || foodToDelete.name)) && (
                          <Image
                            source={foodToDelete.icon ? { uri: foodToDelete.icon } : getFoodIcon(foodToDelete.baseIcon || foodToDelete.name)}
                            style={[styles.icon, { width: 40, height: 40, marginBottom: 10 }]}
                          />
                        )}
                        <Text style={styles.modalBody}>{t('customFood.deleteQuestion', { name: foodToDelete.name })}</Text>
                      </>
                    )}
                    <View style={styles.modalRow}>
                      <TouchableOpacity onPress={() => setFoodToDelete(null)} style={[styles.btn, { flex: 1 }]}>
                        <Text style={styles.btnText}>{t('common.cancel')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={confirmDeleteFood} style={[styles.btn, styles.btnDanger, { flex: 1, marginLeft: 12 }]}>
                        <Text style={styles.btnDangerText}>{t('common.delete')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}

        {/* Confirmar eliminación de categoría */}
        {categoryToDelete && (
          <Modal visible animationType="fade" transparent onRequestClose={() => setCategoryToDelete(null)}>
            <TouchableWithoutFeedback onPress={() => setCategoryToDelete(null)}>
              <View style={styles.modalBackdrop}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalCard}>
                    {categoryToDelete.icon && <Image source={{ uri: categoryToDelete.icon }} style={[styles.icon, { width: 40, height: 40, marginBottom: 10 }]} />}
                    <Text style={styles.modalBody}>{t('customFood.deleteQuestion', { name: categoryToDelete.name })}</Text>
                    <View style={styles.modalRow}>
                      <TouchableOpacity onPress={() => setCategoryToDelete(null)} style={[styles.btn, { flex: 1 }]}>
                        <Text style={styles.btnText}>{t('common.cancel')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={confirmDeleteCategory} style={[styles.btn, styles.btnDanger, { flex: 1, marginLeft: 12 }]}>
                        <Text style={styles.btnDangerText}>{t('common.delete')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}

        {/* Aviso simple */}
        {warning && (
          <Modal visible animationType="fade" transparent onRequestClose={() => setWarning(null)}>
            <TouchableWithoutFeedback onPress={() => setWarning(null)}>
              <View style={styles.modalBackdrop}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalCard}>
                    <Text style={styles.modalBody}>{warning}</Text>
                    <View style={styles.modalRow}>
                      <TouchableOpacity onPress={() => setWarning(null)} style={[styles.btn, styles.btnPrimary, { flex: 1 }]}>
                        <Text style={styles.btnPrimaryText}>{t('common.accept')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}
      </View>
    </Modal>
  );
}

// =====================
// Formulario principal
// =====================
export default function AddCustomFoodModal({ visible, onClose }) {
  const palette = useTheme();
  const t = useTranslation();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { addCustomFood, updateCustomFood } = useCustomFoods();
  const { categories, addCategory } = useCategories();
  const { units } = useUnits();
  const categoryNames = Object.keys(categories);
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categoryNames[0]);
  const [iconUri, setIconUri] = useState(null);
  const [baseIcon, setBaseIcon] = useState(null);
  const [expirationDays, setExpirationDays] = useState('');
  const [defaultUnit, setDefaultUnit] = useState(units[0]?.key || 'units');
  const [defaultPrice, setDefaultPrice] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [manageVisible, setManageVisible] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [catModalVisible, setCatModalVisible] = useState(false);
  // Lazy-load para evitar require cycle con FoodPickerModal
  const FoodPickerModal = React.useMemo(() => require('./FoodPickerModal').default, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setIconUri(result.assets[0].uri);
      setBaseIcon(null);
    }
  };

  const selectDefault = (foodName) => {
    setBaseIcon(foodName);
    setIconUri(null);
    setPickerVisible(false);
  };

  const startEdit = food => {
    setName(food.name);
    setCategory(food.category);
    setIconUri(food.icon);
    setBaseIcon(food.baseIcon);
    setExpirationDays(food.expirationDays != null ? String(food.expirationDays) : '');
    setDefaultUnit(food.defaultUnit || units[0]?.key || 'units');
    setDefaultPrice(food.defaultPrice != null ? String(food.defaultPrice) : '');
    setEditingKey(food.key);
    setManageVisible(false);
  };

  const resetForm = () => {
    setName('');
    const first = Object.keys(categories)[0];
    setCategory(first);
    setIconUri(null);
    setBaseIcon(null);
    setExpirationDays('');
    setDefaultUnit(units[0]?.key || 'units');
    setDefaultPrice('');
    setEditingKey(null);
  };

  const save = () => {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    const days = parseInt(expirationDays, 10);
    const data = {
      name: trimmed,
      category,
      icon: iconUri,
      baseIcon,
      expirationDays: isNaN(days) ? null : days,
      defaultUnit,
      defaultPrice: defaultPrice === '' ? null : Number(defaultPrice),
    };
    if (editingKey) {
      updateCustomFood(editingKey, data);
    } else {
      addCustomFood(data);
    }
    resetForm();
    onClose && onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, backgroundColor: palette.bg }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => { resetForm(); onClose && onClose(); }} style={styles.iconBtn}>
            <Text style={styles.iconTxt}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setManageVisible(true)} style={styles.actionBtn}>
            <Text style={styles.actionTxt}>{t('customFood.manage')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={Platform.OS === 'web' ? true : false}
        >
          <Text style={styles.helpCentered}>
            {t('customFood.help')}
          </Text>

          <Text style={styles.label}>{t('customFood.name')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('customFood.namePlaceholder')}
            placeholderTextColor={palette.textDim}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>{t('customFood.category')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {categoryNames.map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={[styles.chip, category === cat && styles.chipOn]}
              >
                <Text style={[styles.chipTxt, category === cat && styles.chipTxtOn]}>
                  {categories[cat]?.name || cat}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setCatModalVisible(true)} style={[styles.chip, { borderStyle: 'dashed' }]}>
              <Text style={styles.chipTxt}>＋</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>{t('customFood.defaultExpiration')}</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={expirationDays}
            onChangeText={t => setExpirationDays(t.replace(/[^0-9]/g, ''))}
            placeholder={t('itemForm.optional')}
            placeholderTextColor={palette.textDim}
          />

          <Text style={styles.label}>{t('customFood.defaultUnit')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {units.map(u => (
              <TouchableOpacity
                key={u.key}
                onPress={() => setDefaultUnit(u.key)}
                style={[styles.chip, defaultUnit === u.key && styles.chipOn]}
              >
                <Text style={[styles.chipTxt, defaultUnit === u.key && styles.chipTxtOn]}>
                  {u.singular}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>{t('customFood.defaultPrice')}</Text>
          <TextInput
            style={styles.input}
            value={defaultPrice}
            onChangeText={t => {
              let sanitized = t.replace(/[^0-9.]/g, '');
              const parts = sanitized.split('.');
              if (parts.length > 2) {
                sanitized = parts[0] + '.' + parts.slice(1).join('');
              }
              setDefaultPrice(sanitized);
            }}
            keyboardType="decimal-pad"
            inputMode="decimal"
            placeholder={t('itemForm.optional')}
            placeholderTextColor={palette.textDim}
          />

          <Text style={styles.label}>{t('customFood.icon')}</Text>
          {(iconUri || baseIcon) ? (
            <Image source={iconUri ? { uri: iconUri } : getFoodIcon(baseIcon)} style={styles.preview} />
          ) : (
            <View style={[styles.preview, { alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ color: palette.textDim, fontSize: 12 }}>{t('customFood.noIcon')}</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <TouchableOpacity onPress={() => setPickerVisible(true)} style={[styles.btn, styles.btnNeutral, { flex: 1 }]}>
              <Text style={styles.btnNeutralText}>{t('customFood.useDefault')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage} style={[styles.btn, styles.btnNeutral, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.btnNeutralText}>{t('common.load')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Guardar */}
        <TouchableOpacity onPress={save} style={styles.fab}>
          <Text style={styles.fabTxt}>{t('common.save')}</Text>
        </TouchableOpacity>

        {/* Modales internos */}
        <FoodPickerModal
          visible={pickerVisible}
          onSelect={selectDefault}
          onClose={() => setPickerVisible(false)}
          showCreate={false}
          showMenu={false}
        />
        <ManageCustomFoodsModal visible={manageVisible} onClose={() => setManageVisible(false)} onEdit={startEdit} />
        <AddCategoryModal
          visible={catModalVisible}
          onClose={() => setCatModalVisible(false)}
          onSave={data => {
            const key = addCategory(data);
            setCategory(key);
          }}
        />
      </View>
    </Modal>
  );
}

const createStyles = (palette) => StyleSheet.create({
  // layout
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  iconBtn: {
    backgroundColor: palette.surface2,
    borderColor: palette.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  iconTxt: { color: palette.text, fontSize: 18 },
  actionBtn: {
    backgroundColor: palette.surface2,
    borderColor: palette.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionTxt: { color: palette.text },
  actionBtnDanger: { backgroundColor: palette.danger, borderColor: '#ad2c2c' },
  actionBtnDangerText: { color: '#fff', fontWeight: '700' },

  // scrolling
  scroll: {
    ...(Platform.OS === 'web'
      ? {
          scrollbarWidth: 'thin',
          scrollbarColor: `${palette.accent} ${palette.surface2}`,
          scrollbarGutter: 'stable both-edges',
          overscrollBehavior: 'contain',
        }
      : {}),
  },

  // inputs / labels
  helpCentered: { color: palette.textDim, textAlign: 'center', marginBottom: 12 },
  label: { color: palette.text, fontWeight: '700', marginBottom: 6, marginTop: 10 },
  blockTitle: { color: palette.text, fontWeight: '700', fontSize: 16, marginTop: 8, marginBottom: 6 },
  input: {
    backgroundColor: palette.surface2,
    color: palette.text,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'web' ? 10 : 8,
  },

  // chips
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: palette.surface3,
    borderWidth: 1,
    borderColor: palette.border,
    marginRight: 8,
    marginBottom: 8,
  },
  chipOn: { backgroundColor: palette.surface2, borderColor: palette.accent },
  chipTxt: { color: palette.text },
  chipTxtOn: { color: palette.accent },

  // preview
  preview: {
    width: 72, height: 72, borderRadius: 12,
    borderWidth: 1, borderColor: palette.border,
    backgroundColor: palette.surface2,
  },

  // small buttons
  btn: {
    backgroundColor: palette.surface3,
    borderColor: palette.border,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: { color: palette.text },
  btnNeutral: { backgroundColor: palette.surface3 },
  btnNeutralText: { color: palette.text },
  btnDanger: { backgroundColor: palette.danger, borderColor: '#ad2c2c' },
  btnDangerText: { color: '#fff', fontWeight: '700' },
  btnPrimary: { backgroundColor: palette.accent, borderColor: '#e2b06c' },
  btnPrimaryText: { color: '#1b1d22', fontWeight: '700' },

  // list / rows
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
    backgroundColor: palette.surface2,
    borderColor: palette.border,
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  rowSelected: { backgroundColor: palette.selected },
  rowText: { color: palette.text },
  rowSub: { color: palette.textDim, fontSize: 12 },
  icon: { width: 30, height: 30, marginRight: 10, resizeMode: 'contain' },
  smallBtn: {
    backgroundColor: palette.surface3,
    borderColor: palette.border,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginLeft: 6,
  },
  smallBtnText: { color: palette.text, fontSize: 14 },
  smallBtnAccent: { backgroundColor: palette.accent, borderColor: '#e2b06c' },
  smallBtnAccentText: { color: '#1b1d22', fontWeight: '700' },
  smallBtnDanger: { backgroundColor: palette.danger, borderColor: '#ad2c2c', marginLeft: 8 },
  smallBtnDangerText: { color: '#fff', fontWeight: '700' },

  // modal styles
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    width: '100%',
    maxWidth: 420,
  },
  modalTitle: { color: palette.text, fontWeight: '700', fontSize: 16, marginBottom: 8 },
  modalBody: { color: palette.text, marginBottom: 12 },

  // save FAB
  fab: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: palette.accent,
    borderColor: '#e2b06c',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  fabTxt: { color: '#1b1d22', fontWeight: '700' },
});
