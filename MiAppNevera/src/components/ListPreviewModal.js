import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../context/LanguageContext';
import ShoppingListPreview from './ShoppingListPreview';

export default function ListPreviewModal({ visible, name, items = [], onClose }) {
  const palette = useTheme();
  const t = useTranslation();
  const styles = useMemo(() => createStyles(palette), [palette]);
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Text style={styles.iconText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{name || t('titles.shopping')}</Text>
        </View>
        <ShoppingListPreview items={items} style={{ flex: 1 }} />
      </View>
    </Modal>
  );
}

const createStyles = palette =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.bg },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      borderBottomWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
    },
    iconBtn: { marginRight: 12 },
    iconText: { color: palette.text, fontSize: 18 },
    title: { color: palette.text, fontWeight: '700', fontSize: 18 },
  });
