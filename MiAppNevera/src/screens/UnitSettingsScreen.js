
// UnitSettingsScreen.js – dark–premium v2.2.12
import React, { useState, useLayoutEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUnits } from '../context/UnitsContext';
import { useTheme } from '../context/ThemeContext';

export default function UnitSettingsScreen() {
  const palette = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const nav = useNavigation();
  useLayoutEffect(() => {
    nav.setOptions?.({
      headerStyle: { backgroundColor: palette.surface },
      headerTintColor: palette.text,
      headerTitleStyle: { color: palette.text },
      headerShadowVisible: false,
    });
  }, [nav, palette]);

  const { units, addUnit, updateUnit, removeUnit } = useUnits();
  const [singular, setSingular] = useState('');
  const [plural, setPlural] = useState('');
  const [editingKey, setEditingKey] = useState(null);
  const [error, setError] = useState('');

  const startEdit = item => { setEditingKey(item.key); setSingular(item.singular); setPlural(item.plural); setError(''); };
  const cancelEdit = () => { setEditingKey(null); setSingular(''); setPlural(''); setError(''); };

  const onSubmit = () => {
    const s = (singular || '').trim();
    const p = (plural || '').trim();
    if (!s || !p) { setError('Completa singular y plural.'); return; }
    if (editingKey) { updateUnit(editingKey, s, p); cancelEdit(); }
    else { addUnit(s, p); setSingular(''); setPlural(''); setError(''); }
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowText}>{item.singular} / {item.plural}</Text>
        <Text style={styles.rowSub}>{item.key}</Text>
      </View>
      <TouchableOpacity style={styles.smallBtn} onPress={() => startEdit(item)}>
        <Text style={styles.smallBtnText}>✏️ Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.smallBtn, { backgroundColor: '#2a1d1d', borderColor: '#5a2e2e', marginLeft: 8 }]} onPress={() => removeUnit(item.key)}>
        <Text style={{ color: '#ff9f9f' }}>🗑️ Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={units}
        keyExtractor={item => item.key}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        style={styles.list}
        showsVerticalScrollIndicator={Platform.OS === 'web'}
      />

      <View style={styles.editor}>
        <Text style={styles.editorTitle}>{editingKey ? 'Editar unidad' : 'Añadir unidad'}</Text>
        <TextInput placeholder="Singular" placeholderTextColor={palette.textDim} value={singular}
          onChangeText={t => { setSingular(t); setError(''); }} style={styles.input} />
        <TextInput placeholder="Plural" placeholderTextColor={palette.textDim} value={plural}
          onChangeText={t => { setPlural(t); setError(''); }} style={styles.input} />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={{ flexDirection: 'row', marginTop: 6 }}>
          <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]} onPress={onSubmit}>
            <Text style={styles.primaryBtnText}>{editingKey ? 'Actualizar' : 'Añadir'}</Text>
          </TouchableOpacity>
          {editingKey ? (
            <TouchableOpacity style={[styles.btn, { flex: 1, marginLeft: 10 }]} onPress={cancelEdit}>
              <Text style={styles.btnText}>Cancelar</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const createStyles = (palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  list: {
    ...(Platform.OS === 'web' ? {
      scrollbarWidth: 'thin',
      scrollbarColor: `${palette.accent} ${palette.surface2}`,
      scrollbarGutter: 'stable both-edges',
      overscrollBehavior: 'contain',
    } : {}),
  },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.surface2, borderColor: palette.border, borderWidth: 1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 10 },
  rowText: { color: palette.text, fontWeight: '700' },
  rowSub: { color: palette.textDim, fontSize: 12 },
  smallBtn: { backgroundColor: palette.surface3, borderColor: palette.border, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10 },
  smallBtnText: { color: palette.text },
  editor: { backgroundColor: palette.surface, borderTopWidth: 1, borderColor: palette.border, padding: 12 },
  editorTitle: { color: palette.text, fontWeight: '700', marginBottom: 6 },
  input: { backgroundColor: palette.surface2, color: palette.text, borderColor: palette.border, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: Platform.OS === 'web' ? 10 : 8, marginBottom: 8 },
  error: { color: '#ff9f9f', marginBottom: 6 },
  btn: { backgroundColor: palette.surface3, borderColor: palette.border, borderWidth: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  btnText: { color: palette.text },
  primaryBtn: { backgroundColor: palette.accent, borderColor: '#e2b06c', borderWidth: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  primaryBtnText: { color: '#1b1d22', fontWeight: '700' },
});

