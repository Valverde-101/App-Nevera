import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  Animated,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUnits } from '../context/UnitsContext';
import { useTheme, useThemeController } from '../context/ThemeContext';
import { gradientForKey } from '../theme/gradients';

export default function AddShoppingItemModal({
  visible,
  foodName,
  foodIcon,
  onSave,
  onClose,
  initialQuantity,
  initialUnit,
}) {
  const palette = useTheme();
  const { themeName } = useThemeController();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { units } = useUnits();
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState(units[0]?.key || 'units');
  const qtyScale = useRef(new Animated.Value(1)).current;

  const bumpQty = () => {
    Animated.sequence([
      Animated.timing(qtyScale, {
        toValue: 1.1,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(qtyScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (visible) {
      setQuantity(initialQuantity ?? 1);
      setUnit(initialUnit || units[0]?.key || 'units');
    }
  }, [visible, initialQuantity, initialUnit, units]);

  const g = gradientForKey(themeName, foodName || 'item');

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
              <Text style={styles.iconText}>←</Text>
            </TouchableOpacity>
          </View>

          <LinearGradient
            colors={g.colors}
            locations={g.locations}
            start={g.start}
            end={g.end}
            style={styles.hero}
          >
            <View style={styles.foodIconBox}>
              {foodIcon && (
                <Image
                  source={foodIcon}
                  style={{ width: 64, height: 64 }}
                  resizeMode="contain"
                />
              )}
            </View>
            <Text style={styles.foodName} numberOfLines={2}>
              {foodName}
            </Text>
          </LinearGradient>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ padding: 16 }}
          >
            <Text style={styles.labelBold}>Cantidad</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                onPress={() => {
                  setQuantity((q) => Math.max(0, (q || 0) - 1));
                  bumpQty();
                }}
                style={styles.qtyBtn}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>

              <Animated.View style={{ transform: [{ scale: qtyScale }] }}>
                <TextInput
                  style={styles.qtyInput}
                  keyboardType="numeric"
                  value={String(quantity)}
                  onChangeText={(t) => {
                    const v = parseFloat(t.replace(/[^0-9.]/g, ''));
                    setQuantity(Number.isFinite(v) ? v : 0);
                  }}
                />
              </Animated.View>

              <TouchableOpacity
                onPress={() => {
                  setQuantity((q) => (q || 0) + 1);
                  bumpQty();
                }}
                style={styles.qtyBtn}
              >
                <Text style={styles.qtyBtnText}>＋</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.labelBold}>Unidad</Text>
            <View style={styles.chipWrap}>
              {units.map((opt, idx) => (
                <Pressable
                  key={opt.key}
                  onPress={() => setUnit(opt.key)}
                  style={[
                    styles.chip,
                    unit === opt.key ? styles.chipSelected : null,
                    idx % 3 === 0 && { marginLeft: 0 },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      unit === opt.key && styles.chipTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {opt.plural}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.footerBtn} onPress={onClose}>
              <Text style={styles.footerBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerBtn, styles.footerPrimary]}
              onPress={() => onSave({ quantity: quantity || 0, unit })}
            >
              <Text
                style={[styles.footerBtnText, styles.footerPrimaryText]}
              >
                Guardar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (palette) =>
  StyleSheet.create({
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    sheet: {
      maxHeight: '80%',
      minHeight: '50%',
      width: '90%',
      backgroundColor: palette.bg,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: palette.border,
      overflow: 'hidden',
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
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
    iconText: { color: palette.text, fontSize: 18 },
    hero: {
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderColor: palette.frame,
    },
    foodIconBox: {
      width: 72,
      height: 72,
      borderRadius: 16,
      backgroundColor: palette.surface2,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: palette.frame,
      marginRight: 12,
    },
    foodName: {
      flex: 1,
      color: palette.accent,
      fontSize: 18,
      fontWeight: '400',
    },
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
    labelBold: {
      color: palette.text,
      fontWeight: '700',
      marginBottom: 6,
      marginTop: 10,
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
    chipSelected: {
      backgroundColor: palette.surface3,
      borderColor: palette.accent,
    },
    chipText: { color: palette.text },
    chipTextSelected: { color: palette.accent },
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
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 16,
      borderTopWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
    },
    footerBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface2,
      marginHorizontal: 4,
      alignItems: 'center',
    },
    footerBtnText: { color: palette.text, fontSize: 16 },
    footerPrimary: { backgroundColor: palette.accent, borderColor: '#e2b06c' },
    footerPrimaryText: { color: '#1b1d22', fontWeight: '600' },
  });

