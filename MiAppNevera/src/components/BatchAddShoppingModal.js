import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Platform,
  Pressable,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUnits } from '../context/UnitsContext';
import { useTheme, useThemeController } from '../context/ThemeContext';
import { gradientForKey } from '../theme/gradients';

export default function BatchAddShoppingModal({ visible, items = [], onSave, onClose }) {
  const palette = useTheme();
  const { themeName } = useThemeController();
  const styles = useMemo(() => createStyles(palette, themeName), [palette, themeName]);
  const { units, getLabel } = useUnits();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (visible) {
      setData(
        items.map(() => ({
          quantity: '1',
          unit: units[0]?.key || 'units',
        })),
      );
    }
  }, [visible, items, units]);

  const updateField = (index, field, value) => {
    setData(prev => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  };

  const saveAll = () => {
    onSave(
      items.map((item, idx) => ({
        name: item.name,
        quantity: data[idx]?.quantity || '1',
        unit: data[idx]?.unit || units[0]?.key || 'units',
      })),
    );
  };

  const g = gradientForKey(themeName, 'batch');

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
              <Text style={styles.iconText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={saveAll} style={styles.iconBtnAccent}>
              <Text style={styles.iconTextOnAccent}>Guardar</Text>
            </TouchableOpacity>
          </View>

          <LinearGradient
            colors={g.colors}
            locations={g.locations}
            start={g.start}
            end={g.end}
            style={styles.hero}
          >
            <Text style={styles.heroTitle}>Añadir {items.length} alimento(s)</Text>
          </LinearGradient>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
            showsVerticalScrollIndicator={Platform.OS === 'web'}
          >
            {items.map((item, idx) => {
              const gi = gradientForKey(themeName, item.name);
              const qty = parseFloat(data[idx]?.quantity) || 0;
              return (
                <View key={idx} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <LinearGradient
                      colors={gi.colors}
                      locations={gi.locations}
                      start={gi.start}
                      end={gi.end}
                      style={styles.cardRibbon}
                    >
                      {item.icon && <Image source={item.icon} style={styles.ribbonIcon} />}
                      <Text style={styles.ribbonTitle} numberOfLines={1} ellipsizeMode="tail">
                        {item.name}
                      </Text>
                    </LinearGradient>
                    <Text style={styles.cardMeta}>
                      {qty} {getLabel(qty, data[idx]?.unit)}
                    </Text>
                  </View>

                  <Text style={styles.labelBold}>Cantidad</Text>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      onPress={() =>
                        updateField(idx, 'quantity', String(Math.max(0, qty - 1)))
                      }
                      style={styles.qtyBtn}
                    >
                      <Text style={styles.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={styles.qtyInput}
                      keyboardType="numeric"
                      value={String(data[idx]?.quantity)}
                      onChangeText={t => updateField(idx, 'quantity', t)}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        updateField(idx, 'quantity', String(qty + 1))
                      }
                      style={styles.qtyBtn}
                    >
                      <Text style={styles.qtyBtnText}>＋</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.labelBold}>Unidad</Text>
                  <View style={styles.chipWrap}>
                    {units.map(opt => (
                      <Pressable
                        key={opt.key}
                        onPress={() => updateField(idx, 'unit', opt.key)}
                        style={[
                          styles.chip,
                          data[idx]?.unit === opt.key && styles.chipSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            data[idx]?.unit === opt.key && styles.chipTextSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {opt.plural}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(palette, themeName) {
  return StyleSheet.create({
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    sheet: {
      maxHeight: '80%',
      width: '90%',
      backgroundColor: palette.bg,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: palette.border,
      overflow: 'hidden',
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 6,
      backgroundColor: palette.surface,
      borderBottomWidth: 1,
      borderColor: palette.border,
    },
    iconBtn: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: palette.surface2,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.border,
    },
    iconBtnAccent: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: palette.accent,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#e2b06c',
    },
    iconText: { color: palette.text, fontSize: 18 },
    iconTextOnAccent: {
      color: themeName === 'light' ? '#1b1d22' : palette.bg,
      fontWeight: '700',
    },
    hero: {
      padding: 14,
      borderBottomWidth: 1,
      borderColor: palette.frame,
    },
    heroTitle: { color: palette.accent, fontSize: 18, fontWeight: '400' },
    scroll: {
      ...(Platform.OS === 'web'
        ? {
            scrollbarWidth: 'thin',
            scrollbarColor: `${palette.border} transparent`,
            scrollbarGutter: 'stable both-edges',
            overscrollBehavior: 'contain',
          }
        : {}),
    },
    card: {
      backgroundColor: palette.surface2,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.border,
      padding: 12,
      marginBottom: 12,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    cardRibbon: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.frame || palette.border,
    },
    ribbonIcon: { width: 32, height: 32, marginRight: 10, resizeMode: 'contain' },
    ribbonTitle: { color: palette.foodName, fontWeight: '800', fontSize: 18 },
    cardMeta: { color: palette.textDim },
    labelBold: { color: palette.text, fontWeight: '700', marginBottom: 6, marginTop: 10 },
    qtyRow: { flexDirection: 'row', alignItems: 'center' },
    qtyBtn: {
      backgroundColor: palette.surface3,
      borderWidth: 1,
      borderColor: palette.border,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      marginHorizontal: 4,
    },
    qtyBtnText: { color: palette.accent, fontSize: 18 },
    qtyInput: {
      width: 80,
      textAlign: 'center',
      backgroundColor: palette.surface2,
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 10,
      color: palette.text,
    },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 10,
      backgroundColor: palette.surface2,
      borderWidth: 1,
      borderColor: palette.border,
      marginRight: 8,
      marginBottom: 8,
    },
    chipSelected: { backgroundColor: palette.surface3, borderColor: palette.accent },
    chipText: { color: palette.text },
    chipTextSelected: { color: palette.accent },
  });
}
