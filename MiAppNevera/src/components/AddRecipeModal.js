// AddRecipeModal.js – dark–premium v2.2.15
// - Tema consistente (bg oscuro, superficies, dorado #F2B56B)
// - Inputs grises, chips de dificultad, stepper de personas
// - Lista de ingredientes con selección múltiple (long-press)
// - Picker de unidades en modal oscuro
// - Botones personalizados (accent/neutral/danger), sin <Button> nativo
// - Soporte de imagen (galería o URL)
// - Compatible con initialRecipe para editar
import React, { useEffect, useMemo, useState, useRef } from 'react';
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
import { useLanguage } from '../context/LanguageContext';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';

const isWeb = Platform.OS === 'web';
let RichEditor, RichToolbar, actions;
if (!isWeb) {
  const rich = require('react-native-pell-rich-editor');
  RichEditor = rich.RichEditor;
  RichToolbar = rich.RichToolbar;
  actions = rich.actions;
}

export default function AddRecipeModal({
  visible,
  onSave,
  onClose,
  initialRecipe,
}) {
  const palette = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { t, lang } = useLanguage();
  const { units, getLabel } = useUnits();
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [persons, setPersons] = useState('1');
  const [difficulty, setDifficulty] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState('');
  const [fontLevel, setFontLevel] = useState(3); // track last used font size level
  const richText = useRef(null);
  const webEditor = useRef(null);
  const fileInput = useRef(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [unitPickerVisible, setUnitPickerVisible] = useState(false);
  const [unitPickerIndex, setUnitPickerIndex] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const isEditing = !!initialRecipe;

  const ensureMediaPermission = async () => {
    let perm = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (perm.granted) return true;
    perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setErrorMsg(t('permiso_galeria') || 'Permiso de galería requerido');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const ok = await ensureMediaPermission();
    if (!ok) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const sizeMap = { 1: '10px', 2: '13px', 3: '16px', 4: '18px', 5: '24px', 6: '32px', 7: '48px' };
  const normalizeFontTags = html =>
    html
      ? html.replace(/<font[^>]*size="([1-7])"[^>]*>(.*?)<\/font>/gi, (_, s, c) =>
          `<span style="font-size:${sizeMap[s]};">${c}</span>`,
        )
      : '';

  const handleWebChange = () => {
    if (isWeb && webEditor.current) {
      setSteps(normalizeFontTags(webEditor.current.innerHTML));
    }
  };

  const handleInsertImage = async () => {
    if (isWeb) {
      fileInput.current?.click();
      return;
    }
    const ok = await ensureMediaPermission();
    if (!ok) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      base64: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      const uri = `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`;
      richText.current?.focusContentEditor();
      richText.current?.insertImage({ src: uri, width: '100%' });
      resizeImage('100%');
      alignImage('center');
    }
  };

  const onFileChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      document.execCommand('insertImage', false, reader.result);
      alignImage('center');
      handleWebChange();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const lastRange = useRef(null);
  const selectedImage = useRef(null);
  const updateFontFromSelection = () => {
    if (isWeb) {
      const sel = window.getSelection();
      if (sel && sel.focusNode) {
        const node = sel.focusNode.nodeType === 3 ? sel.focusNode.parentElement : sel.focusNode;
        if (node) {
          const size = window.getComputedStyle(node).fontSize;
          const found = Object.entries(sizeMap).find(([, v]) => parseInt(v) === parseInt(size));
          if (found) setFontLevel(Number(found[0]));
        }
      }
    } else {
      richText.current?.commandDOM?.(`(function(){
        var sel = window.getSelection();
        if(sel && sel.focusNode){
          var node = sel.focusNode.nodeType===3? sel.focusNode.parentElement : sel.focusNode;
          var size = window.getComputedStyle(node).fontSize;
          window.ReactNativeWebView.postMessage(JSON.stringify({type:'FONT_SIZE', data:size}));
        }
      })()`);
    }
  };
  const saveRange = e => {
    if (!isWeb) return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      lastRange.current = sel.getRangeAt(0).cloneRange();
    }
    selectedImage.current = e?.target?.tagName === 'IMG' ? e.target : null;
    updateFontFromSelection();
  };

  const resizeImage = pct => {
    if (isWeb) {
      const sel = window.getSelection();
      if (lastRange.current && sel) {
        sel.removeAllRanges();
        sel.addRange(lastRange.current);
      }
      let img = selectedImage.current;
      if (!img && sel && sel.focusNode) {
        const node = sel.focusNode.nodeType === 3 ? sel.focusNode.parentElement : sel.focusNode;
        if (node && node.tagName === 'IMG') img = node;
      }
      if (img) {
        img.style.width = pct;
        handleWebChange();
        selectedImage.current = img;
      }
    } else {
      richText.current?.commandDOM?.(`(function(){
        var sel = window.getSelection();
        if(!sel || !sel.rangeCount) return;
        var range = sel.getRangeAt(0);
        var node = range.startContainer;
        var img = null;
        if(node.nodeType===1 && node.tagName==='IMG') img=node;
        else if(node.nodeType===1){
          var child=node.childNodes[range.startOffset];
          if(child && child.tagName==='IMG') img=child;
          else if(range.startOffset>0){
            var prev=node.childNodes[range.startOffset-1];
            if(prev && prev.tagName==='IMG') img=prev;
          }
        } else if(node.nodeType===3){
          var parent=node.parentElement;
          if(parent.tagName==='IMG') img=parent;
          else if(parent){
            var child2=parent.childNodes[range.startOffset];
            if(child2 && child2.tagName==='IMG') img=child2;
            else if(range.startOffset>0){
              var prev2=parent.childNodes[range.startOffset-1];
              if(prev2 && prev2.tagName==='IMG') img=prev2;
            }
          }
        }
        if(img){
          img.style.width='${pct}';
          img.style.height='auto';
          img.setAttribute('width','${pct}');
          img.removeAttribute('height');
        }
        saveSelection && saveSelection();
      })()`);
    }
  };

  const alignImage = dir => {
    if (isWeb) {
      const sel = window.getSelection();
      if (lastRange.current && sel) {
        sel.removeAllRanges();
        sel.addRange(lastRange.current);
      }
      let img = selectedImage.current;
      if (!img && sel && sel.focusNode) {
        const node = sel.focusNode.nodeType === 3 ? sel.focusNode.parentElement : sel.focusNode;
        if (node && node.tagName === 'IMG') img = node;
      }
      if (img) {
        img.setAttribute('data-align', dir);
        if (dir === 'center') {
          img.style.display = 'block';
          img.style.margin = '0 auto';
          img.style.float = '';
          img.style.alignSelf = 'center';
        } else if (dir === 'left') {
          img.style.display = 'block';
          img.style.marginLeft = '0';
          img.style.marginRight = 'auto';
          img.style.float = '';
          img.style.alignSelf = 'flex-start';
        } else if (dir === 'right') {
          img.style.display = 'block';
          img.style.marginLeft = 'auto';
          img.style.marginRight = '0';
          img.style.float = '';
          img.style.alignSelf = 'flex-end';
        }
        handleWebChange();
        selectedImage.current = img;
      }
    } else {
      richText.current?.commandDOM?.(`(function(){
        var sel = window.getSelection();
        if(!sel || !sel.rangeCount) return;
        var range = sel.getRangeAt(0);
        var node = range.startContainer;
        var img = null;
        if(node.nodeType===1 && node.tagName==='IMG') img=node;
        else if(node.nodeType===1){
          var child=node.childNodes[range.startOffset];
          if(child && child.tagName==='IMG') img=child;
          else if(range.startOffset>0){
            var prev=node.childNodes[range.startOffset-1];
            if(prev && prev.tagName==='IMG') img=prev;
          }
        } else if(node.nodeType===3){
          var parent=node.parentElement;
          if(parent.tagName==='IMG') img=parent;
          else if(parent){
            var child2=parent.childNodes[range.startOffset];
            if(child2 && child2.tagName==='IMG') img=child2;
            else if(range.startOffset>0){
              var prev2=parent.childNodes[range.startOffset-1];
              if(prev2 && prev2.tagName==='IMG') img=prev2;
            }
          }
        }
        if(img){
          img.setAttribute('data-align','${dir}');
          if('${dir}'==='center'){
            img.style.display='block';
            img.style.margin='0 auto';
            img.style.float='';
            img.style.alignSelf='center';
          } else if('${dir}'==='left'){
            img.style.display='block';
            img.style.marginLeft='0';
            img.style.marginRight='auto';
            img.style.float='';
            img.style.alignSelf='flex-start';
          } else if('${dir}'==='right'){
            img.style.display='block';
            img.style.marginLeft='auto';
            img.style.marginRight='0';
            img.style.float='';
            img.style.alignSelf='flex-end';
          }
        }
        saveSelection && saveSelection();
      })()`);
    }
  };

  const changeFontSize = dir => {
    setFontLevel(level => {
      const next = Math.max(1, Math.min(7, level + dir));
      if (isWeb) {
        const sel = window.getSelection();
        if (lastRange.current && sel) {
          sel.removeAllRanges();
          sel.addRange(lastRange.current);
          document.execCommand('fontSize', false, String(next));
          handleWebChange();
          sel.removeAllRanges();
          sel.addRange(lastRange.current);
          lastRange.current = sel.getRangeAt(0).cloneRange();
        } else {
          document.execCommand('fontSize', false, String(next));
          handleWebChange();
        }
      } else {
        richText.current?.commandDOM?.(`(function(){
          var sel = window.getSelection();
          if(!sel || !sel.rangeCount) return;
          var range = sel.getRangeAt(0);
          document.execCommand('fontSize', false, '${next}');
          sel.removeAllRanges();
          sel.addRange(range);
          saveSelection && saveSelection();
        })()`);
      }
      return next;
    });
  };

  const handleEditorMessage = message => {
    if (message?.type === 'FONT_SIZE') {
      const px = parseInt(message.data);
      const found = Object.entries(sizeMap).find(([, v]) => parseInt(v) === px);
      if (found) setFontLevel(Number(found[0]));
    }
  };

  const handleToolbarPress = action => {
    if (action === 'fontSizeLabel') {
      return;
    } else if (action === 'resize100') {
      resizeImage('100%');
    } else if (action === 'resize50') {
      resizeImage('50%');
    } else if (action === 'resize25') {
      resizeImage('25%');
    } else if (action === 'fontDecrease') {
      changeFontSize(-1);
    } else if (action === 'fontIncrease') {
      changeFontSize(1);
    } else if (action === actions.alignLeft) {
      richText.current?.command?.(action);
      alignImage('left');
    } else if (action === actions.alignCenter) {
      richText.current?.command?.(action);
      alignImage('center');
    } else if (action === actions.alignRight) {
      richText.current?.command?.(action);
      alignImage('right');
    } else {
      richText.current?.command?.(action);
    }
  };

  useEffect(() => {
    if (!isWeb && visible) {
      richText.current?.registerToolbar(() => updateFontFromSelection());
    }
  }, [visible]);

  // cargar/limpiar datos
  useEffect(() => {
    if (visible && initialRecipe) {
      setName(initialRecipe.name || '');
      setImage(initialRecipe.image || '');
      setPersons(String(initialRecipe.persons || 1));
      setDifficulty(initialRecipe.difficulty || '');
      const initialSteps = normalizeFontTags(initialRecipe.steps || '');
      setSteps(initialSteps);
      setFontLevel(3);
      if (isWeb && webEditor.current) {
        webEditor.current.innerHTML = initialSteps;
      } else {
        richText.current?.setContentHTML?.(initialSteps);
      }
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
    } else if (visible && !initialRecipe) {
      if (isWeb && webEditor.current) {
        webEditor.current.innerHTML = '';
      } else {
        richText.current?.setContentHTML?.('');
      }
      setFontLevel(3);
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
      setFontLevel(3);
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
  if (!nm) { setErrorMsg(t('system.recipes.add.errorName')); return; }
  if (!ingredients.length) { setErrorMsg(t('system.recipes.add.errorIngredients')); return; }
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

  const diffOptions = useMemo(() => ['easy', 'medium', 'hard'], []);

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, backgroundColor: palette.bg }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Text style={styles.iconTxt}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? t('system.recipes.add.editTitle') : t('system.recipes.add.newTitle')}</Text>
          <TouchableOpacity onPress={save} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>{t('system.common.save')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
          showsVerticalScrollIndicator={Platform.OS === 'web' ? true : false}
        >
          {/* Nombre */}
          <Text style={styles.label}>{t('system.recipes.add.nameLabel')}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={t('system.recipes.add.namePlaceholder')}
            placeholderTextColor={palette.textDim}
          />

          {/* Imagen */}
          <Text style={styles.label}>{t('system.recipes.add.imageLabel')}</Text>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
                <Text style={{ color: palette.textDim }}>{t('system.recipes.add.noImage')}</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <TouchableOpacity style={[styles.btn, styles.btnNeutral, { flex: 1 }]} onPress={pickImage}>
                <Text style={styles.btnNeutralText}>{t('system.recipes.add.selectImage')}</Text>
              </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { flex: 1, marginLeft: 10 }]}
              onPress={() => setImage('')}
            >
                <Text style={styles.btnText}>{t('system.recipes.add.remove')}</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            placeholder={t('system.recipes.add.urlPlaceholder')}
            placeholderTextColor={palette.textDim}
            value={image}
            onChangeText={setImage}
          />

          {/* Personas */}
          <Text style={styles.label}>{t('system.recipes.add.personsLabel')}</Text>
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
          <Text style={styles.label}>{t('system.recipes.add.difficultyLabel')}</Text>
          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            {diffOptions.map(level => (
              <TouchableOpacity
                key={level}
                onPress={() => setDifficulty(level)}
                style={[styles.chip, difficulty === level && styles.chipOn]}
              >
                <Text style={[styles.chipTxt, difficulty === level && styles.chipTxtOn]}>
                  {t(`system.recipes.add.difficulty.${level}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Ingredientes */}
          <Text style={styles.label}>{t('system.recipes.add.ingredientsLabel')}</Text>
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
                    {`${ing.quantity} ${getLabel(ing.quantity, ing.unit)} ${t('system.common.of')} ${
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
                <Text style={styles.btnText}>{t('system.common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnDanger, { flex: 1, marginLeft: 10 }]}
                onPress={deleteSelectedIngredients}
              >
                <Text style={styles.btnDangerText}>{t('system.common.delete')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setPickerVisible(true)}
              style={[styles.btn, styles.btnNeutral, { alignSelf: 'center', marginTop: 6 }]}
            >
              <Text style={styles.btnNeutralText}>
                {t('system.recipes.add.addIngredient')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Pasos */}
          <Text style={styles.label}>{t('system.recipes.add.stepsLabel')}</Text>
          {isWeb ? (
            <>
              <div
                ref={webEditor}
                contentEditable
                suppressContentEditableWarning
                style={{
                  ...StyleSheet.flatten(styles.rich),
                  minHeight: 120,
                  outline: 'none',
                  fontSize: 16,
                }}
                onInput={handleWebChange}
                onKeyUp={saveRange}
                onMouseUp={saveRange}
                onClick={saveRange}
              />
              <View style={styles.richBar}>
                <TouchableOpacity
                  onPress={() => changeFontSize(-1)}
                  style={styles.richBtn}
                >
                  <Text style={{ color: palette.text, fontSize: 16 }}>A-</Text>
                </TouchableOpacity>
                <Text style={styles.stepSize}>{parseInt(sizeMap[fontLevel])}</Text>
                <TouchableOpacity
                  onPress={() => changeFontSize(1)}
                  style={styles.richBtn}
                >
                  <Text style={{ color: palette.text, fontSize: 16 }}>A+</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => document.execCommand('bold')}
                  style={styles.richBtn}
                >
                  <Text style={{ color: palette.text, fontWeight: '700', fontSize: 16 }}>
                    B
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => document.execCommand('italic')}
                  style={styles.richBtn}
                >
                  <Text style={{ color: palette.text, fontSize: 16, fontStyle: 'italic' }}>
                    I
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => document.execCommand('underline')}
                  style={styles.richBtn}
                >
                  <Text style={{ color: palette.text, textDecorationLine: 'underline', fontSize: 16 }}>
                    U
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => document.execCommand('insertUnorderedList')}
                  style={styles.richBtn}
                >
                  <Text style={{ color: palette.text, fontSize: 16 }}>•</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => document.execCommand('insertOrderedList')}
                  style={styles.richBtn}
                >
                  <Text style={{ color: palette.text, fontSize: 16 }}>1.</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    document.execCommand('justifyLeft');
                    alignImage('left');
                    handleWebChange();
                  }}
                  style={styles.richBtn}
                >
                  <Text style={{ color: palette.text, fontSize: 16 }}>L</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    document.execCommand('justifyCenter');
                    alignImage('center');
                    handleWebChange();
                  }}
                  style={styles.richBtn}
                >
                  <Text style={{ color: palette.text, fontSize: 16 }}>C</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    document.execCommand('justifyRight');
                    alignImage('right');
                    handleWebChange();
                  }}
                  style={styles.richBtn}
                >
                  <Text style={{ color: palette.text, fontSize: 16 }}>R</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleInsertImage} style={styles.richBtn}>
                  <Text style={{ color: palette.text, fontSize: 16 }}>🖼️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => resizeImage('100%')} style={styles.richBtn}>
                  <Text style={{ color: palette.text, fontSize: 14 }}>100%</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => resizeImage('50%')} style={styles.richBtn}>
                  <Text style={{ color: palette.text, fontSize: 14 }}>50%</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => resizeImage('25%')} style={styles.richBtn}>
                  <Text style={{ color: palette.text, fontSize: 14 }}>25%</Text>
                </TouchableOpacity>
              </View>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                style={{ display: 'none' }}
              />
            </>
          ) : (
            <>
              <RichEditor
                ref={richText}
                initialContentHTML={steps}
                style={[styles.rich, { minHeight: 120 }]}
                editorStyle={{
                  backgroundColor: palette.surface2,
                  cssText: `color:${palette.text}; background-color:${palette.surface2};`,
                  contentCSSText: `color:${palette.text}; background-color:${palette.surface2};`,
                }}
                placeholder={t('system.recipes.add.stepsPlaceholder')}
                onChange={html => setSteps(normalizeFontTags(html))}
                onMessage={handleEditorMessage}
              />
              <RichToolbar
                editor={richText}
                actions={[
                  'fontDecrease',
                  'fontSizeLabel',
                  'fontIncrease',
                  actions.setBold,
                  actions.setItalic,
                  actions.setUnderline,
                  actions.insertBulletsList,
                  actions.insertOrderedList,
                  actions.alignLeft,
                  actions.alignCenter,
                  actions.alignRight,
                actions.insertImage,
                'resize100',
                'resize50',
                'resize25',
              ]}
              style={styles.richBar}
              iconTint={palette.text}
              selectedIconTint={palette.accent}
              onPressAddImage={handleInsertImage}
              onPress={action =>
                action === 'fontSizeLabel' || action === actions.insertImage
                  ? null
                  : handleToolbarPress(action)
              }
              iconMap={{
                  fontDecrease: ({ tintColor }) => (
                    <Text style={{ color: tintColor, fontSize: 16 }}>A-</Text>
                  ),
                  fontSizeLabel: () => (
                    <Text style={styles.stepSize}>{parseInt(sizeMap[fontLevel])}</Text>
                  ),
                  fontIncrease: ({ tintColor }) => (
                    <Text style={{ color: tintColor, fontSize: 16 }}>A+</Text>
                  ),
                  [actions.insertImage]: ({ tintColor }) => (
                    <Text style={{ color: tintColor }}>🖼️</Text>
                  ),
                  resize100: ({ tintColor }) => (
                    <Text style={{ color: tintColor, fontSize: 12 }}>100%</Text>
                  ),
                  resize50: ({ tintColor }) => (
                    <Text style={{ color: tintColor, fontSize: 12 }}>50%</Text>
                  ),
                  resize25: ({ tintColor }) => (
                    <Text style={{ color: tintColor, fontSize: 12 }}>25%</Text>
                  ),
                  [actions.alignLeft]: ({ tintColor }) => (
                    <Text style={{ color: tintColor, fontSize: 12 }}>L</Text>
                  ),
                  [actions.alignCenter]: ({ tintColor }) => (
                    <Text style={{ color: tintColor, fontSize: 12 }}>C</Text>
                  ),
                  [actions.alignRight]: ({ tintColor }) => (
                    <Text style={{ color: tintColor, fontSize: 12 }}>R</Text>
                  ),
                  [actions.setUnderline]: ({ tintColor }) => (
                    <Text style={{ color: tintColor, textDecorationLine: 'underline', fontSize: 12 }}>
                      U
                    </Text>
                  ),
                  [actions.setItalic]: ({ tintColor }) => (
                    <Text style={{ color: tintColor, fontSize: 12, fontStyle: 'italic' }}>I</Text>
                  ),
                }}
              />
            </>
          )}
        </ScrollView>

        {/* Picker de unidades */}
        <Modal visible={unitPickerVisible} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={() => setUnitPickerVisible(false)}>
            <View style={styles.modalBackdrop}>
              <TouchableWithoutFeedback>
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>{t('system.recipes.add.chooseUnit')}</Text>
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
          <Text style={styles.modalTitle}>{t('system.recipes.add.errorTitle')}</Text>
          <Text style={styles.modalErrorText}>{errorMsg}</Text>
          <View style={styles.modalRow}>
            <TouchableOpacity onPress={() => setErrorMsg(null)} style={[styles.modalBtnOK]}>
              <Text style={styles.modalBtnOKText}>{t('system.recipes.add.accept')}</Text>
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
  rich: {
    backgroundColor: palette.surface2,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    padding: 8,
    color: palette.text,
  },
  richBar: {
    backgroundColor: palette.surface3,
    borderRadius: 16,
    marginTop: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  richBtn: {
    width: 32,
    height: 32,
    margin: 4,
    borderRadius: 8,
    backgroundColor: palette.surface2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  stepSize: { color: palette.text, alignSelf: 'center', marginHorizontal: 6 },

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
