import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { useSavedLists } from '../context/SavedListsContext';
import { useShopping } from '../context/ShoppingContext';
import SaveListModal from '../components/SaveListModal';
import ListPreviewModal from '../components/ListPreviewModal';
import { useTheme } from '../context/ThemeContext';

export default function SavedListsScreen({ navigation }) {
  const { savedLists, deleteList, saveList } = useSavedLists();
  const { replaceList } = useShopping();
  const palette = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);

  const [editing, setEditing] = useState(null);
  const [previewing, setPreviewing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {savedLists.map(list => {
          const totalCost = list.items?.reduce((sum, it) => sum + (it.totalPrice || 0), 0) || 0;
          return (
            <View key={list.id} style={styles.card}>
              <View style={styles.headerRow}>
                <Text style={styles.title}>{list.name || 'Sin título'}</Text>
                <Text style={styles.total}>{`Costo Total: S/${totalCost.toFixed(2)}`}</Text>
              </View>
              {list.note ? <Text style={styles.note}>{list.note}</Text> : null}
              <Text style={styles.count}>{list.items?.length || 0} artículos</Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: palette.accent }]}
                  onPress={() => {
                    replaceList(list.items || []);
                    navigation.navigate('Shopping');
                  }}
                >
                  <Text style={{ color: '#1b1d22', fontWeight: '700' }}>Cargar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => setPreviewing(list)}>
                  <Text style={styles.actionText}>Previsualizar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => setEditing(list)}>
                  <Text style={styles.actionText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: palette.danger }]}
                  onPress={() => setConfirmDel(list.id)}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <SaveListModal
        visible={!!editing}
        items={editing?.items || []}
        initialName={editing?.name}
        initialNote={editing?.note}
        onSave={({ name, note, items }) => {
          saveList(name, note, items, editing.id);
          setEditing(null);
        }}
        onClose={() => setEditing(null)}
      />

      <ListPreviewModal
        visible={!!previewing}
        name={previewing?.name}
        items={previewing?.items || []}
        onClose={() => setPreviewing(null)}
      />

      <Modal visible={!!confirmDel} transparent animationType="fade" onRequestClose={() => setConfirmDel(null)}>
        <TouchableWithoutFeedback onPress={() => setConfirmDel(null)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.cardModal}>
                <Text style={styles.modalTitle}>Eliminar lista</Text>
                <Text style={styles.modalBody}>¿Eliminar esta lista guardada?</Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: palette.surface3 }]} onPress={() => setConfirmDel(null)}>
                    <Text style={{ color: palette.text }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: palette.danger }]}
                    onPress={() => {
                      deleteList(confirmDel);
                      setConfirmDel(null);
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Eliminar</Text>
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

const createStyles = palette =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.bg },
    content: { padding: 14 },
    card: {
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface2,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    title: { color: palette.text, fontWeight: '700', fontSize: 16, flex: 1, marginRight: 8 },
    total: { color: palette.accent, fontWeight: '700' },
    note: { color: palette.textDim, marginVertical: 4 },
    count: { color: palette.textDim, marginBottom: 8 },
    actions: { flexDirection: 'row', justifyContent: 'space-between' },
    actionBtn: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
      marginHorizontal: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface3,
    },
    actionText: { color: palette.text },
    modalBackdrop: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.35)',
      paddingHorizontal: 20,
    },
    cardModal: {
      backgroundColor: palette.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.border,
      padding: 16,
      width: '100%',
      maxWidth: 420,
    },
    modalTitle: { color: palette.text, fontWeight: '700', fontSize: 16, marginBottom: 8 },
    modalBody: { color: palette.textDim, marginBottom: 14 },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
    modalBtn: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.border,
      marginHorizontal: 6,
    },
  });

