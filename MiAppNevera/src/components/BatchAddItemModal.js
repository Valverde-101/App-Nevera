
// BatchAddItemModal.js – compatible con temas v2.2.17 (alineado con AddItemModal)
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUnits } from '../context/UnitsContext';
import { useLocations } from '../context/LocationsContext';
import DatePicker from './DatePicker';
import { getFoodInfo } from '../foodIcons';
import { useDefaultFoods } from '../context/DefaultFoodsContext';
import { useTheme, useThemeController } from '../context/ThemeContext';
import { gradientForKey } from '../theme/gradients';

export default function BatchAddItemModal({ visible, items = [], onSave, onClose }) {
  const palette = useTheme();
  const { themeName } = useThemeController();
  const styles = useMemo(() => createStyles(palette, themeName), [palette, themeName]);

  const today = new Date().toISOString().split('T')[0];
  const { units, getLabel } = useUnits();
  const { locations } = useLocations();
  // subscribe to default food overrides so batch defaults update after refresh
  const { overrides } = useDefaultFoods();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (visible) {
      setData(
        items.map(item => {
          const info = getFoodInfo(item.name);
          let exp = '';
          if (info?.expirationDays != null) {
            const d = new Date();
            d.setDate(d.getDate() + info.expirationDays);
            exp = d.toISOString().split('T')[0];
          }
          return {
            location: locations[0]?.key || 'fridge',
            quantity: '1',
            unit: info?.defaultUnit || units[0]?.key || 'units',
            regDate: today,
            expDate: exp,
            note: '',
            price: info?.defaultPrice != null ? String(info.defaultPrice) : '',
          };
        }),
      );
    }
  }, [visible, items, today, units, locations, overrides]);

  const updateField = (index, field, value) => {
    setData(prev => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  };

  const saveAll = () => {
    onSave(
      data.map((d, idx) => ({
        ...d,
        price: parseFloat(d.price) || 0,
        index: items[idx].index,
        name: items[idx].name,
      })),
    );
  };

  // Gradiente estilo AddItemModal (clave genérica "batch")
  const g = gradientForKey(themeName, 'batch');

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
              <Text style={styles.iconText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={saveAll} style={styles.iconBtnAccent}>
              <Text style={styles.iconTextOnAccent}>Guardar</Text>
            </TouchableOpacity>
          </View>

          {/* Hero con gradiente y resumen */}
          <LinearGradient colors={g.colors} locations={g.locations} start={g.start} end={g.end} style={styles.hero}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.heroTitle}>Añadir {items.length} alimento(s)</Text>
            </View>
          </LinearGradient>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
            showsVerticalScrollIndicator={Platform.OS === 'web' ? true : false}
          >
            {items.map((item, idx) => {
              const info = getFoodInfo(item.name);
              const label = info?.name || item.name;
              return (
                <View key={idx} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <LinearGradient colors={g.colors} locations={g.locations} start={g.start} end={g.end} style={styles.cardRibbon}>
                    {item.icon && <Image source={item.icon} style={styles.ribbonIcon} />}
                    <Text style={styles.ribbonTitle} numberOfLines={1} ellipsizeMode="tail">{label}</Text>
                  </LinearGradient>
                  <Text style={styles.cardMeta}>
                      {data[idx]?.quantity || 0} {getLabel(parseFloat(data[idx]?.quantity) || 0, data[idx]?.unit)}
                    </Text>
                  </View>

                {/* Ubicación */}
                <Text style={styles.labelBold}>Ubicación</Text>
                <View style={styles.chipWrap}>
                  {locations.map((opt, k) => (
                    <Pressable
                      key={opt.key}
                      onPress={() => updateField(idx, 'location', opt.key)}
                      style={[
                        styles.chip,
                        data[idx]?.location === opt.key && styles.chipSelected,
                        (k % 3 === 0) && { marginLeft: 0 },
                      ]}
                    >
                      <Text
                        style={[styles.chipText, data[idx]?.location === opt.key && styles.chipTextSelected]}
                        numberOfLines={1}
                      >
                        {opt.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Cantidad */}
                <Text style={styles.labelBold}>Cantidad</Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    onPress={() => updateField(idx, 'quantity', String(Math.max(0, (parseFloat(data[idx]?.quantity) || 0) - 1)))}
                    style={styles.qtyBtn}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>

                  <TextInput
                    style={styles.qtyInput}
                    keyboardType="numeric"
                    value={String(data[idx]?.quantity ?? '0')}
                    onChangeText={(t) => {
                      const v = parseFloat(t.replace(/[^0-9.]/g, ''));
                      updateField(idx, 'quantity', Number.isFinite(v) ? String(v) : '0');
                    }}
                  />

                  <TouchableOpacity
                    onPress={() => updateField(idx, 'quantity', String((parseFloat(data[idx]?.quantity) || 0) + 1))}
                    style={styles.qtyBtn}
                  >
                    <Text style={styles.qtyBtnText}>＋</Text>
                  </TouchableOpacity>
                </View>

                {/* Unidad */}
                <Text style={styles.labelBold}>Unidad</Text>
                <View style={styles.chipWrap}>
                  {units.map((opt, k) => (
                    <Pressable
                      key={opt.key}
                      onPress={() => updateField(idx, 'unit', opt.key)}
                      style={[
                        styles.chip,
                        data[idx]?.unit === opt.key && styles.chipSelected,
                        (k % 3 === 0) && { marginLeft: 0 },
                      ]}
                    >
                      <Text
                        style={[styles.chipText, data[idx]?.unit === opt.key && styles.chipTextSelected]}
                        numberOfLines={1}
                      >
                        {opt.plural}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Precio */}
                <Text style={styles.labelBold}>Precio unitario</Text>
                <TextInput
                  style={styles.priceInput}
                  value={data[idx]?.price}
                  onChangeText={t => {
                    let sanitized = t.replace(/[^0-9.]/g, '');
                    const parts = sanitized.split('.');
                    if (parts.length > 2) {
                      sanitized = parts[0] + '.' + parts.slice(1).join('');
                    }
                    updateField(idx, 'price', sanitized);
                  }}
                  keyboardType="decimal-pad"
                  inputMode="decimal"
                  placeholder="Opcional"
                  placeholderTextColor={palette.textDim}
                />

                {/* Fechas */}
                <View style={{ marginTop: 6 }}>
                  <Text style={styles.labelBold}>Fecha de registro</Text>
                  <DatePicker
                    value={data[idx]?.regDate}
                    onChange={t => updateField(idx, 'regDate', t)}
                    inputStyle={styles.dateInput}
                    containerStyle={styles.dateContainer}
                  />
                  <View style={{ height: 8 }} />
                  <Text style={styles.labelBold}>Fecha de caducidad</Text>
                  <DatePicker
                    value={data[idx]?.expDate}
                    onChange={t => updateField(idx, 'expDate', t)}
                    inputStyle={styles.dateInput}
                    containerStyle={styles.dateContainer}
                  />
                </View>

                {/* Nota */}
                <Text style={styles.labelBold}>Nota</Text>
                <TextInput
                  style={styles.noteInput}
                  value={data[idx]?.note}
                  onChangeText={t => updateField(idx, 'note', t)}
                  placeholder="Opcional"
                  placeholderTextColor={palette.textDim}
                />
              </View>
            );
          })}
          </ScrollView>

        </View>
      </View>
    </Modal>
  );
}

const createStyles = (palette, themeName) => StyleSheet.create({
  // sheet modal (igual al AddItemModal)
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '92%',
    backgroundColor: palette.bg,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: 'hidden',
  },

  // header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  iconBtnAccent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: palette.accent,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.frame,
  },
  iconText: { color: palette.text, fontSize: 18 },
  iconTextOnAccent: { color: themeName === 'light' ? '#1b1d22' : palette.bg, fontWeight: '700' },

  // hero
  hero: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: palette.frame,
  },
  foodIconBox: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: palette.surface2,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: palette.frame,
    marginRight: 12,
  },
  heroTitle: { flex: 1, color: palette.accent, fontSize: 18, fontWeight: '400' },

  // scroll
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

  // cards
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
  icon: { width: 30, height: 30, borderRadius: 8, marginRight: 8, resizeMode: 'contain' },
  cardTitle: { color: palette.text, fontWeight: '700' },
  cardMeta: { color: palette.textDim },

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
  ribbonTitle: { color: palette.text, fontWeight: '800', fontSize: 18 },

  // labels / inputs (mismos que AddItemModal)
  labelBold: { color: palette.text, fontWeight: '700', marginBottom: 6, marginTop: 10 },
  noteInput: {
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface2,
    color: palette.text,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface2,
    color: palette.text,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 4,
  },
  dateContainer: {
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface2,
    borderRadius: 10,
  },
  dateInput: {
    backgroundColor: palette.surface2,
    color: palette.text,
  },

  // chips
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

  // qty controls (idéntico al AddItemModal)
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: {
    backgroundColor: palette.surface3,
    borderWidth: 1, borderColor: palette.border,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12, marginHorizontal: 4,
  },
  qtyBtnText: { color: palette.accent, fontSize: 18 },
  qtyInput: {
    width: 80,
    textAlign: 'center',
    backgroundColor: palette.surface2,
    borderWidth: 1, borderColor: palette.border,
    borderRadius: 10,
    paddingVertical: 8, paddingHorizontal: 10,
    color: palette.text,
  },
});