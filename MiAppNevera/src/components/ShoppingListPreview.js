import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useUnits } from '../context/UnitsContext';
import { useCategories } from '../context/CategoriesContext';
import { useTheme } from '../context/ThemeContext';
import { getFoodInfo } from '../foodIcons';
import { useDefaultFoods } from '../context/DefaultFoodsContext';
import CostPieChart from './CostPieChart';

export default function ShoppingListPreview({ items = [], onItemPress, onItemLongPress, selected = [], style }) {
  const { getLabel } = useUnits();
  const { categories } = useCategories();
  const palette = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  // subscribe to default food overrides so preview names update
  const { overrides } = useDefaultFoods();

  const [detailsVisible, setDetailsVisible] = useState(false);

  const grouped = items.reduce((acc, it, index) => {
    const cat = it.foodCategory || 'varios';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push({ item: it, index });
    return acc;
  }, {});

  const totalCost = useMemo(
    () => items.reduce((sum, it) => sum + (it.totalPrice || 0), 0),
    [items],
  );

  const costByCategory = useMemo(() => {
    const totals = {};
    items.forEach(it => {
      const cat = it.foodCategory || 'otros';
      const price = it.totalPrice || 0;
      if (price > 0) totals[cat] = (totals[cat] || 0) + price;
    });
    return totals;
  }, [items]);

  const chartData = useMemo(() => {
    const paletteColors = [
      '#4e79a7',
      '#f28e2b',
      '#e15759',
      '#76b7b2',
      '#59a14f',
      '#edc949',
      '#af7aa1',
      '#ff9da7',
      '#9c755f',
      '#bab0ab',
    ];
    return Object.entries(costByCategory).map(([key, value], idx) => ({
      key,
      value,
      color: paletteColors[idx % paletteColors.length],
      percent: totalCost ? (value / totalCost) * 100 : 0,
    }));
  }, [costByCategory, totalCost]);

  return (
    <>
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
              const label = getFoodInfo(item.name)?.name || item.name;
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
                      {label} - {item.quantity} {getLabel(item.quantity, item.unit)}
                    </Text>
                    {item.totalPrice > 0 && (
                      <Text style={styles.priceBadge}>
                        {`S/${item.totalPrice.toFixed(2)}`}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
        {items.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Detalles de lista de compra</Text>
            </View>
            <View style={styles.detailsRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => setDetailsVisible(true)}>
                <Text style={styles.actionText}>Más detalles</Text>
              </TouchableOpacity>
              <Text style={styles.totalText}>{`Costo Total: S/${totalCost.toFixed(2)}`}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={detailsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailsVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDetailsVisible(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={[styles.card, { alignItems: 'center' }]}>
                <Text style={[styles.cardTitle, { marginBottom: 16 }]}>Distribución de costos</Text>
                {totalCost > 0 ? (
                  <>
                    <CostPieChart data={chartData} size={200} />
                    <View style={{ marginTop: 16, alignSelf: 'stretch' }}>
                      {chartData.map(d => (
                        <View key={d.key} style={styles.legendRow}>
                          <View style={[styles.legendColor, { backgroundColor: d.color }]} />
                          <Text style={[styles.legendLabel, { flex: 1 }]}>
                            {categories[d.key]?.name || d.key}
                          </Text>
                          <Text style={styles.legendValue}>{`S/${d.value.toFixed(2)}`}</Text>
                          <Text style={styles.legendPercent}>{`${d.percent.toFixed(0)}%`}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : (
                  <Text style={{ color: palette.textDim }}>Sin datos de costo</Text>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
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
    rowText: { color: palette.text, flex: 1 },
    priceBadge: { color: palette.accent, fontWeight: '700', marginLeft: 8 },
    actionBtn: {
      backgroundColor: palette.accent,
      borderColor: '#e2b06c',
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
    },
    actionText: { color: '#1b1d22', fontWeight: '700' },
    detailsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    totalText: { color: palette.text, fontWeight: '700' },
    legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    legendColor: { width: 12, height: 12, borderRadius: 2, marginRight: 8 },
    legendLabel: { color: palette.text },
    legendValue: { color: palette.text, marginLeft: 8 },
    legendPercent: { color: palette.textDim, marginLeft: 8 },
    modalBackdrop: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.35)',
      paddingHorizontal: 20,
    },
    card: {
      backgroundColor: palette.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.border,
      padding: 16,
      width: '100%',
      maxWidth: 420,
    },
    cardTitle: { color: palette.text, fontWeight: '700', fontSize: 16, marginBottom: 8 },
  });
