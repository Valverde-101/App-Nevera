// AddRecipeModal.js – dark–premium v2.2.15
// - Tema consistente (bg oscuro, superficies, dorado #F2B56B)
// - Inputs grises, chips de dificultad, stepper de personas
// - Lista de ingredientes con selección múltiple (long-press)
// - Picker de unidades en modal oscuro
// - Botones personalizados (accent/neutral/danger), sin <Button> nativo
// - Soporte de imagen (galería o URL)
// - Compatible con initialRecipe para editar
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
} from 'react-native';
import FoodPickerModal from './FoodPickerModal';
import { getFoodIcon, getFoodInfo } from '../foodIcons';
import { useUnits } from '../context/UnitsContext';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';

export default function AddRecipeModal({
  visible,
  onSave,
  onClose,
  initialRecipe,
}) {
  const palette = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { units, getLabel } = useUnits();
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [persons, setPersons] = useState('1');
  const [difficulty, setDifficulty] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [unitPickerVisible, setUnitPickerVisible] = useState(false);
  const [unitPickerIndex, setUnitPickerIndex] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const isEditing = !!initialRecipe;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // cargar/limpiar datos
  useEffect(() => {
    if (visible && initialRecipe) {
      setName(initialRecipe.name || '');
      setImage(initialRecipe.image || '');
      setPersons(String(initialRecipe.persons || 1));
      setDifficulty(initialRecipe.difficulty || '');
      setSteps(initialRecipe.steps || '');
      setIngredients(
        initialRecipe.ingredients
          ? initialRecipe.ingredients.map(ing => ({
              name: ing.name,
              quantity: String(ing.quantity),
              unit: ing.unit,
              icon: ing.icon || getFoodIcon(ing.name),
            }))
          : [],
      );
    } else if (!visible) {
      // resetear cuando se cierra
      setName('');
      setImage('');
      setPersons('1');
      setDifficulty('');
      setSteps('');
      setIngredients([]);
      setSelectMode(false);
      setSelected([]);
    }
  }, [visible, initialRecipe]);

  const addIngredient = (foodName, foodIcon) => {
    setIngredients(prev => [
      ...prev,
      {
        name: foodName,
        quantity: '1',
        unit: units[0]?.key || 'units',
        icon: foodIcon || getFoodIcon(foodName),
      },
    ]);
    setPickerVisible(false);
  };

  const addIngredients = foodNames => {
    setIngredients(prev => [
      ...prev,
      ...foodNames.map(name => ({
        name,
        quantity: '1',
        unit: units[0]?.key || 'units',
        icon: getFoodIcon(name),
      })),
    ]);
    setPickerVisible(false);
  };

  const updateIngredient = (index, field, value) => {
    setIngredients(ings =>
      ings.map((ing, idx) => (idx === index ? { ...ing, [field]: value } : ing)),
    );
  };

  const toggleSelectIngredient = index => {
    setSelected(sel =>
      sel.includes(index) ? sel.filter(i => i !== index) : [...sel, index],
    );
  };

  const startSelectMode = index => {
    setSelectMode(true);
    setSelected([index]);
  };

  const cancelSelect = () => {
    setSelectMode(false);
    setSelected([]);
  };

  const deleteSelectedIngredients = () => {
    setIngredients(ings => ings.filter((_, idx) => !selected.includes(idx)));
    cancelSelect();
  };

  const openUnitPicker = index => {
    setUnitPickerIndex(index);
    setUnitPickerVisible(true);
  };

  const selectUnit = unit => {
    if (unitPickerIndex !== null) {
      updateIngredient(unitPickerIndex, 'unit', unit);
    }
    setUnitPickerVisible(false);
    setUnitPickerIndex(null);
  };

  
const save = () => {
  const nm = (name || '').trim();
  if (!nm) { setErrorMsg('Escribe el nombre de la receta.'); return; }
  if (!ingredients.length) { setErrorMsg('Añade al menos un ingrediente.'); return; }
  const per = Math.max(1, parseInt(persons, 10) || 0);
  onSave({

      name: nm,
      image: image.trim(),
      persons: per,
      difficulty,
      steps,
      ingredients: ingredients.map(ing => ({
        name: ing.name,
        quantity: parseFloat(ing.quantity) || 0,
        unit: ing.unit,
        icon: ing.icon,
      })),
    });
  };

  const diffOptions = useMemo(() => ['facil', 'intermedio', 'dificil'], []);

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, backgroundColor: palette.bg }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Text style={styles.iconTxt}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'Editar receta' : 'Nueva receta'}</Text>
          <TouchableOpacity onPress={save} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Guardar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
          showsVerticalScrollIndicator={Platform.OS === 'web' ? true : false}
        >
          {/* Nombre */}
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ej. Pasta con salsa roja"
            placeholderTextColor={palette.textDim}
          />

          {/* Imagen */}
          <Text style={styles.label}>Foto</Text>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text style={{ color: palette.textDim }}>Sin imagen</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <TouchableOpacity style={[styles.btn, styles.btnNeutral, { flex: 1 }]} onPress={pickImage}>
              <Text style={styles.btnNeutralText}>Seleccionar imagen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { flex: 1, marginLeft: 10 }]}
              onPress={() => setImage('')}
            >
              <Text style={styles.btnText}>Quitar</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            placeholder="o pega una URL"
            placeholderTextColor={palette.textDim}
            value={image}
            onChangeText={setImage}
          />

          {/* Personas */}
          <Text style={styles.label}>Personas</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <TouchableOpacity
              onPress={() => setPersons(p => String(Math.max(1, (parseInt(p, 10) || 1) - 1)))}
              style={styles.smallBtn}
            >
              <Text style={styles.smallBtnText}>−</Text>
            </TouchableOpacity>
            <TextInput
              keyboardType="numeric"
              style={[styles.input, { width: 80, textAlign: 'center', marginHorizontal: 8 }]}
              value={persons}
              onChangeText={setPersons}
            />
            <TouchableOpacity
              onPress={() => setPersons(p => String((parseInt(p, 10) || 0) + 1))}
              style={styles.smallBtn}
            >
              <Text style={styles.smallBtnText}>＋</Text>
            </TouchableOpacity>
          </View>

          {/* Dificultad */}
          <Text style={styles.label}>Dificultad</Text>
          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            {diffOptions.map(level => (
              <TouchableOpacity
                key={level}
                onPress={() => setDifficulty(level)}
                style={[styles.chip, difficulty === level && styles.chipOn]}
              >
                <Text style={[styles.chipTxt, difficulty === level && styles.chipTxtOn]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Ingredientes */}
          <Text style={styles.label}>Ingredientes</Text>
          {ingredients.map((ing, idx) => (
            <TouchableOpacity
              key={idx}
              onLongPress={() => startSelectMode(idx)}
              onPress={() => selectMode && toggleSelectIngredient(idx)}
              activeOpacity={1}
            >
              <View
                style={[
                  styles.ingRow,
                  selectMode && selected.includes(idx) && styles.ingRowSelected,
                ]}
              >
                {ing.icon ? (
                  <Image source={ing.icon} style={styles.ingIcon} />
                ) : null}
                <TouchableOpacity
                  style={{ flex: 1 }}
                  disabled={selectMode}
                  onPress={() => openUnitPicker(idx)}
                >
                  <Text style={styles.ingText}>
                    {`${ing.quantity} ${getLabel(ing.quantity, ing.unit)} de ${
                      getFoodInfo(ing.name)?.name || ing.name
                    }`}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={selectMode}
                  onPress={() =>
                    updateIngredient(
                      idx,
                      'quantity',
                      String(Math.max(0, (parseFloat(ing.quantity) || 0) - 1)),
                    )
                  }
                  style={styles.smallBtn}
                >
                  <Text style={styles.smallBtnText}>−</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.input, { width: 60, textAlign: 'center', marginHorizontal: 8, paddingVertical: Platform.OS === 'web' ? 8 : 6 }]}
                  keyboardType="numeric"
                  editable={!selectMode}
                  value={ing.quantity}
                  onChangeText={t => updateIngredient(idx, 'quantity', t)}
                />
                <TouchableOpacity
                  disabled={selectMode}
                  onPress={() =>
                    updateIngredient(
                      idx,
                      'quantity',
                      String((parseFloat(ing.quantity) || 0) + 1),
                    )
                  }
                  style={styles.smallBtn}
                >
                  <Text style={styles.smallBtnText}>＋</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
          {selectMode ? (
            <View style={{ flexDirection: 'row', marginTop: 6 }}>
              <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={cancelSelect}>
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnDanger, { flex: 1, marginLeft: 10 }]}
                onPress={deleteSelectedIngredients}
              >
                <Text style={styles.btnDangerText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setPickerVisible(true)} style={[styles.btn, styles.btnNeutral, { alignSelf: 'center', marginTop: 6 }]}>
              <Text style={styles.btnNeutralText}>Añadir ingrediente</Text>
            </TouchableOpacity>
          )}

          {/* Pasos */}
          <Text style={styles.label}>Pasos (admite Markdown)</Text>
          <TextInput
            multiline
            style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
            placeholder="Usa **negrita**, - listas, 1. enumeraciones"
            placeholderTextColor={palette.textDim}
            value={steps}
            onChangeText={setSteps}
          />
        </ScrollView>

        {/* Picker de unidades */}
        <Modal visible={unitPickerVisible} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={() => setUnitPickerVisible(false)}>
            <View style={styles.modalBackdrop}>
              <TouchableWithoutFeedback>
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>Elegir unidad</Text>
                  <ScrollView style={{ maxHeight: 260 }}>
                    {units.map(opt => (
                      <TouchableOpacity key={opt.key} onPress={() => selectUnit(opt.key)} style={styles.optionRow}>
                        <Text style={styles.optionText}>{opt.singular} / {opt.plural}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* FoodPicker */}

{/* Modal de error de validación */}
<Modal visible={!!errorMsg} transparent animationType="fade" onRequestClose={() => setErrorMsg(null)}>
  <TouchableWithoutFeedback onPress={() => setErrorMsg(null)}>
    <View style={styles.modalBackdrop}>
      <TouchableWithoutFeedback>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Revisa los datos</Text>
          <Text style={styles.modalErrorText}>{errorMsg}</Text>
          <View style={styles.modalRow}>
            <TouchableOpacity onPress={() => setErrorMsg(null)} style={[styles.modalBtnOK]}>
              <Text style={styles.modalBtnOKText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  </TouchableWithoutFeedback>
</Modal>

        <FoodPickerModal
          visible={pickerVisible}
          onSelect={addIngredient}
          onMultiSelect={addIngredients}
          onClose={() => setPickerVisible(false)}
        />
      </View>
    </Modal>
  );
}

const createStyles = (palette) => StyleSheet.create({
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
  headerTitle: { color: palette.text, fontWeight: '700' },
  saveBtn: {
    backgroundColor: palette.accent,
    borderColor: '#e2b06c',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveBtnText: { color: '#1b1d22', fontWeight: '700' },

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

  label: { color: palette.text, fontWeight: '700', marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: palette.surface2,
    color: palette.text,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'web' ? 10 : 8,
  },

  // image
  image: { width: '60%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    alignSelf: 'center',
    maxWidth: 360
  },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },

  // chips
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: palette.surface3,
    borderWidth: 1,
    borderColor: palette.border,
    marginRight: 8,
  },
  chipOn: { backgroundColor: palette.surface2, borderColor: palette.accent },
  chipTxt: { color: palette.text },
  chipTxtOn: { color: palette.accent, fontWeight: '700' },

  // small controls
  smallBtn: {
    backgroundColor: palette.surface3,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  smallBtnText: { color: palette.text, fontSize: 18, lineHeight: 18 },

  // ingredients
  ingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface2,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  ingRowSelected: { backgroundColor: palette.selected, borderColor: '#6a4a1a' },
  ingIcon: { width: 30, height: 30, marginRight: 8, resizeMode: 'contain' },
  ingText: { color: palette.text },

  // buttons
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
  btnDanger: { backgroundColor: '#2a1d1d', borderColor: '#5a2e2e' },
  btnDangerText: { color: '#ff9f9f' },

  // unit picker modal
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
  modalErrorText: { color: '#ff9f9f', marginBottom: 12 },
  modalBtnOK: { backgroundColor: palette.accent, borderColor: '#e2b06c', borderWidth: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  modalBtnOKText: { color: '#1b1d22', fontWeight: '700' },
  optionRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: palette.border,
  },
  optionText: { color: palette.text },
});
