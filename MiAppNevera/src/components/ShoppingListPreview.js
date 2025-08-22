import React, { useMemo } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useUnits } from '../context/UnitsContext';
import { useCategories } from '../context/CategoriesContext';
import { useTheme } from '../context/ThemeContext';

export default function ShoppingListPreview({ items = [], onItemPress, onItemLongPress, selected = [], style }) {
  const { getLabel } = useUnits();
  const { categories } = useCategories();
  const palette = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);

  const grouped = items.reduce((acc, it, index) => {
    const cat = it.foodCategory || 'varios';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push({ item: it, index });
    return acc;
  }, {});

  return (
    <ScrollView style={[styles.scroll, style]} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
      {Object.entries(grouped).map(([cat, arr]) => (
        <View key={cat} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {categories[cat]?.name || cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </View>
          {arr.map(({ item, index }) => {
            const isSelected = selected.includes(index);
            return (
              <TouchableOpacity
                key={index}
                onPress={() => onItemPress && onItemPress(index)}
                onLongPress={() => onItemLongPress && onItemLongPress(index)}
                disabled={!onItemPress && !onItemLongPress}
              >
                <View style={[styles.row, isSelected && styles.rowSelected]}>
                  {item.icon && <Image source={item.icon} style={styles.icon} />}
                  <Text style={styles.rowText} numberOfLines={2}>
                    <Text style={{ color: palette.foodName }}>{item.name}</Text>
                    {` — ${item.quantity} ${getLabel(item.quantity, item.unit)}`}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const createStyles = palette =>
  StyleSheet.create({
    scroll: {
      backgroundColor: palette.bg,
    },
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
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface2,
    },
    rowSelected: {
      backgroundColor: palette.selected,
      borderLeftWidth: 3,
      borderLeftColor: palette.accent,
    },
    icon: { width: 30, height: 30, marginRight: 10, resizeMode: 'contain' },
    rowText: { color: palette.text },
  });
