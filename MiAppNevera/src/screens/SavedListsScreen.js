import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSavedLists } from '../context/SavedListsContext';
import { useShopping } from '../context/ShoppingContext';
import SaveShoppingListModal from '../components/SaveShoppingListModal';
import { useNavigation } from '@react-navigation/native';

export default function SavedListsScreen() {
  const palette = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { savedLists, removeList, updateList } = useSavedLists();
  const { replaceList } = useShopping();
  const navigation = useNavigation();
  const [editing, setEditing] = useState(null); // list object

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {savedLists.map(list => (
          <View key={list.id} style={styles.card}>
            <Text style={styles.cardTitle}>{list.name}</Text>
            {list.note ? <Text style={styles.cardNote}>{list.note}</Text> : null}
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => { replaceList(list.items); navigation.navigate('Shopping'); }} style={styles.smallBtn}>
                <Text style={styles.btnText}>Cargar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditing(list)} style={styles.smallBtn}>
                <Text style={styles.btnText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeList(list.id)} style={[styles.smallBtn, styles.smallBtnDanger]}>
                <Text style={[styles.btnText, { color: '#fff' }]}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {savedLists.length === 0 && (
          <Text style={{ color: palette.textDim }}>No hay listas guardadas.</Text>
        )}
      </ScrollView>
      {editing && (
        <SaveShoppingListModal
          visible={true}
          items={editing.items}
          initialName={editing.name}
          initialNote={editing.note}
          onClose={() => setEditing(null)}
          onSave={({ name, note }) => { updateList(editing.id, name, note); setEditing(null); }}
        />
      )}
    </View>
  );
}

const createStyles = (palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  card: { borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface, borderRadius: 12, padding: 12, marginBottom: 12 },
  cardTitle: { color: palette.text, fontWeight: '700', fontSize: 16 },
  cardNote: { color: palette.textDim, marginTop: 4 },
  cardActions: { flexDirection: 'row', marginTop: 8 },
  smallBtn: { marginRight: 8, backgroundColor: palette.accent, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  smallBtnDanger: { backgroundColor: palette.danger },
  btnText: { color: '#1b1d22', fontWeight: '700' },
});
