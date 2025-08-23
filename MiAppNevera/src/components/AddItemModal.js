// AddItemModal.js – dark–premium v2.2.6 (consistente con InventoryScreen)
import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useShopping } from '../context/ShoppingContext';
import { useUnits } from '../context/UnitsContext';
import { useLocations } from '../context/LocationsContext';
import DatePicker from './DatePicker';
import { getFoodInfo } from '../foodIcons';
import { useDefaultFoods } from '../context/DefaultFoodsContext';
import { useTheme, useThemeController } from '../context/ThemeContext';
import { gradientForKey } from '../theme/gradients';
import { useTranslation } from '../context/LangContext';

export default function AddItemModal({ visible, foodName, foodIcon, initialLocation = 'fridge', onSave, onClose }) {
  const palette = useTheme();
  const { themeName } = useThemeController();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { t } = useTranslation();
  const today = new Date().toISOString().split('T')[0];
  const { units } = useUnits();
  const { locations } = useLocations();
  // subscribe to default food overrides so edits persist after refresh
  const { overrides } = useDefaultFoods();
  const [location, setLocation] = useState(initialLocation);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState(units[0]?.key || 'units');
  const [regDate, setRegDate] = useState(today);
  const [expDate, setExpDate] = useState('');
  const [note, setNote] = useState('');
  const [unitPrice, setUnitPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [unitPriceText, setUnitPriceText] = useState('');
  const [totalPriceText, setTotalPriceText] = useState('');
  const [label, setLabel] = useState(foodName);
  const { addItem: addShoppingItem } = useShopping();

  // Animación suave al cambiar cantidad
  const qtyScale = useRef(new Animated.Value(1)).current;
  const bumpQty = () => {
    Animated.sequence([
      Animated.timing(qtyScale, { toValue: 1.1, duration: 120, useNativeDriver: true }),
      Animated.spring(qtyScale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    if (visible) {
      setLocation(initialLocation);
      setQuantity(1);
      const info = getFoodInfo(foodName);
      setUnit(info?.defaultUnit || units[0]?.key || 'units');
      setRegDate(today);
      if (info?.expirationDays != null) {
        const d = new Date();
        d.setDate(d.getDate() + info.expirationDays);
        setExpDate(d.toISOString().split('T')[0]);
      } else {
        setExpDate('');
      }
      setNote('');
      setLabel(info?.name || foodName);
      const defaultPrice = info?.defaultPrice || 0;
      setUnitPrice(defaultPrice);
      setUnitPriceText(defaultPrice ? String(defaultPrice) : '');
      const tot = defaultPrice * 1;
      setTotalPrice(tot);
      setTotalPriceText(tot ? tot.toFixed(2) : '');
    }
  }, [visible, initialLocation, today, units, locations, foodName, overrides]);

  const g = gradientForKey(themeName, foodName || 'item');

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
              <Text style={styles.iconText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                addShoppingItem(
                  foodName,
                  quantity || 0,
                  unit,
                  unitPrice || 0,
                  totalPrice || 0,
                );
                Alert.alert(t('msg.added'), t('msg.added_to_shopping', { name: foodName }));
              }}
              style={styles.iconBtn}
            >
              <Text style={styles.iconText}>🧺</Text>
            </TouchableOpacity>
          </View>

          {/* Hero con gradiente */}
          <LinearGradient colors={g.colors} locations={g.locations} start={g.start} end={g.end} style={styles.hero}>
            <View style={styles.foodIconBox}>
              {foodIcon && <Image source={foodIcon} style={{ width: 64, height: 64 }} resizeMode="contain" />}
            </View>
              <Text style={styles.foodName} numberOfLines={2}>{label}</Text>
          </LinearGradient>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ padding: 16 }}
          >
            {/* Ubicación */}
            <Text style={styles.labelBold}>{t('label.location')}</Text>
            <View style={styles.chipWrap}>
              {locations.map((opt, idx) => (
                <Pressable
                  key={opt.key}
                  onPress={() => setLocation(opt.key)}
                  style={[
                    styles.chip,
                    location === opt.key ? styles.chipSelected : null,
                    (idx % 3 === 0) && { marginLeft: 0 },
                  ]}
                >
                  <Text style={[styles.chipText, location === opt.key && styles.chipTextSelected]} numberOfLines={1}>
                    {opt.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Cantidad */}
            <Text style={styles.labelBold}>{t('label.quantity')}</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                onPress={() => {
                  setQuantity(q => {
                    const next = Math.max(0, (q || 0) - 1);
                    if (unitPrice) {
                      const tot = unitPrice * next;
                      setTotalPrice(tot);
                      setTotalPriceText(tot ? tot.toFixed(2) : '');
                    } else if (totalPrice) {
                      const u = next ? totalPrice / next : 0;
                      setUnitPrice(u);
                      setUnitPriceText(u ? u.toFixed(2) : '');
                    }
                    return next;
                  });
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
                    const q = Number.isFinite(v) ? v : 0;
                    setQuantity(q);
                    if (unitPrice) {
                      const tot = unitPrice * q;
                      setTotalPrice(tot);
                      setTotalPriceText(tot ? tot.toFixed(2) : '');
                    } else if (totalPrice) {
                      const u = q ? totalPrice / q : 0;
                      setUnitPrice(u);
                      setUnitPriceText(u ? u.toFixed(2) : '');
                    }
                  }}
                />
              </Animated.View>

              <TouchableOpacity
                onPress={() => {
                  setQuantity(q => {
                    const next = (q || 0) + 1;
                    if (unitPrice) {
                      const tot = unitPrice * next;
                      setTotalPrice(tot);
                      setTotalPriceText(tot ? tot.toFixed(2) : '');
                    } else if (totalPrice) {
                      const u = totalPrice / next;
                      setUnitPrice(u);
                      setUnitPriceText(u ? u.toFixed(2) : '');
                    }
                    return next;
                  });
                  bumpQty();
                }}
                style={styles.qtyBtn}
              >
                <Text style={styles.qtyBtnText}>＋</Text>
              </TouchableOpacity>
            </View>

            {/* Unidad */}
            <Text style={styles.labelBold}>{t('label.unit')}</Text>
            <View style={styles.chipWrap}>
              {units.map((opt, idx) => (
                <Pressable
                  key={opt.key}
                  onPress={() => setUnit(opt.key)}
                  style={[
                    styles.chip,
                    unit === opt.key ? styles.chipSelected : null,
                    (idx % 3 === 0) && { marginLeft: 0 },
                  ]}
                >
                  <Text style={[styles.chipText, unit === opt.key && styles.chipTextSelected]} numberOfLines={1}>
                    {opt.plural}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Precio */}
            <Text style={styles.labelBold}>{t('label.price')}</Text>
            <View style={styles.priceRow}>
              <TextInput
                style={[styles.priceInput, { marginRight: 4 }]}
                keyboardType="decimal-pad"
                inputMode="decimal"
                placeholder="Costo unitario"
                placeholderTextColor={palette.textDim}
                value={unitPriceText}
                onChangeText={(t) => {
                  const sanitized = t.replace(/[^0-9.]/g, '');
                  setUnitPriceText(sanitized);
                  const u = parseFloat(sanitized);
                  if (!isNaN(u)) {
                    setUnitPrice(u);
                    const tot = u * (quantity || 0);
                    setTotalPrice(tot);
                    setTotalPriceText(tot ? tot.toFixed(2) : '');
                  } else {
                    setUnitPrice(0);
                    setTotalPrice(0);
                    setTotalPriceText('');
                  }
                }}
              />
              <Text style={styles.priceDivider}>/</Text>
              <TextInput
                style={[styles.priceInput, { marginLeft: 4 }]}
                keyboardType="decimal-pad"
                inputMode="decimal"
                placeholder="Costo total"
                placeholderTextColor={palette.textDim}
                value={totalPriceText}
                onChangeText={(t) => {
                  const sanitized = t.replace(/[^0-9.]/g, '');
                  setTotalPriceText(sanitized);
                  const tot = parseFloat(sanitized);
                  if (!isNaN(tot)) {
                    setTotalPrice(tot);
                    const u = (quantity || 0) ? tot / (quantity || 0) : 0;
                    setUnitPrice(u);
                    setUnitPriceText(u ? u.toFixed(2) : '');
                  } else {
                    setTotalPrice(0);
                    setUnitPrice(0);
                    setUnitPriceText('');
                  }
                }}
              />
            </View>

            {/* Fechas (con inputs gris) */}
            <View style={{ marginTop: 6 }}>
              <Text style={styles.labelBold}>{t('label.register_date')}</Text>
              <DatePicker
                value={regDate}
                onChange={setRegDate}
                inputStyle={styles.dateInput}      // si DatePicker lo soporta
                containerStyle={styles.dateContainer}
              />
              <View style={{ height: 8 }} />
              <Text style={styles.labelBold}>{t('label.expire_date')}</Text>
              <DatePicker
                value={expDate}
                onChange={setExpDate}
                inputStyle={styles.dateInput}
                containerStyle={styles.dateContainer}
              />
            </View>

            {/* Nota */}
            <Text style={styles.labelBold}>{t('label.note')}</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="Opcional"
              placeholderTextColor={palette.textDim}
            />

            <View style={{ height: 70 }} />
          </ScrollView>

          {/* Guardar */}
          <TouchableOpacity
            onPress={() =>
              onSave({
                location,
                quantity: quantity || 0,
                unit,
                registered: regDate,
                expiration: expDate,
                note,
                price: unitPrice || 0,
              })
            }
            style={styles.saveFab}
          >
            <Text style={styles.saveFabText}>{t('btn.save')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (palette) => StyleSheet.create({
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
  iconText: { color: palette.text, fontSize: 18 },
  hero: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: palette.frame,
  },
  foodIconBox: {
    width: 72, height: 72, borderRadius: 16,
    backgroundColor: palette.surface2,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: palette.frame,
    marginRight: 12,
  },
  foodName: { flex: 1, color: palette.accent, fontSize: 18, fontWeight: '400' },

  // ScrollView (Web): barra sutil + gutter estable para evitar "bailes"
  scroll: {
    ...(Platform.OS === 'web'
      ? {
          scrollbarWidth: 'thin',               // Firefox
          scrollbarColor: `${palette.border} transparent`,
          // Evita que el layout se mueva cuando aparece/desaparece la barra
          scrollbarGutter: 'stable both-edges',
          // Suaviza el comportamiento al borde
          overscrollBehavior: 'contain',
        }
      : {}),
  },

  labelBold: { color: palette.text, fontWeight: '700', marginBottom: 6, marginTop: 10 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  chip: {
    paddingVertical: 8, paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: palette.surface2,
    borderWidth: 1, borderColor: palette.border,
    marginRight: 8, marginBottom: 8,
  },
  chipSelected: { backgroundColor: palette.surface3, borderColor: palette.accent },
  chipText: { color: palette.text },
  chipTextSelected: { color: palette.accent },

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

  // Entrada de Nota
  noteInput: {
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface2,
    color: palette.text,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  priceInput: {
    flex: 1,
    textAlign: 'center',
    backgroundColor: palette.surface2,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    color: palette.text,
  },
  priceDivider: { color: palette.text, paddingHorizontal: 4 },

  // Estilos sugeridos para DatePicker (si el componente los acepta)
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

  saveFab: {
    position: 'absolute',
    bottom: 14, alignSelf: 'center',
    backgroundColor: palette.accent,
    paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1, borderColor: '#e2b06c',
  },
  saveFabText: { color: '#1b1d22', fontSize: 16, fontWeight: '600' },
});

