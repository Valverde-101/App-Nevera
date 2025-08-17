// AddItemModal.js – dark–premium v2.2.6 (consistente con InventoryScreen) 
import React, { useEffect, useState, useRef } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useShopping } from '../context/ShoppingContext';
import { useUnits } from '../context/UnitsContext';
import { useLocations } from '../context/LocationsContext';
import DatePicker from './DatePicker';
import { getFoodInfo } from '../foodIcons';

// ===== Theme (igual que InventoryScreen v2.2.6) =====
const palette = {
  bg: '#121316',
  surface: '#191b20',
  surface2: '#20242c',
  surface3: '#262b35',
  text: '#ECEEF3',
  textDim: '#A8B1C0',
  frame: '#3a3429',
  border: '#2c3038',
  accent: '#F2B56B',
  accent2: '#4caf50',
  danger: '#ff5252',
  warn: '#ff9f43',
};

// ===== Gradients por ítem (determinísticos por nombre) =====
const gradientOptions = [
  { colors: ['#2a231a', '#1c1a17', '#121316'], locations: [0, 0.55, 1], start: {x: 0.1, y: 0.1}, end: {x: 0.9, y: 0.9} },   // amber
  { colors: ['#1a212a', '#191d24', '#121316'], locations: [0, 0.6, 1], start: {x: 0.9, y: 0.1}, end: {x: 0.1, y: 0.9} },     // steel
  { colors: ['#261c2a', '#1e1a24', '#121316'], locations: [0, 0.6, 1], start: {x: 0.2, y: 0.0}, end: {x: 1.0, y: 0.8} },     // violet
  { colors: ['#1c2422', '#18201e', '#121316'], locations: [0, 0.55, 1], start: {x: 0.0, y: 0.8}, end: {x: 1.0, y: 0.2} },     // teal
  { colors: ['#241f1a', '#1c1a19', '#121316'], locations: [0, 0.55, 1], start: {x: 0.7, y: 0.0}, end: {x: 0.0, y: 0.9} },     // copper
  { colors: ['#281a1d', '#1f191b', '#121316'], locations: [0, 0.6, 1], start: {x: 0.0, y: 0.0}, end: {x: 1.0, y: 1.0} },     // wine
];
const hashString = (s) => {
  if (!s) return 0;
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
  return Math.abs(h);
};
const gradientForKey = (key) => gradientOptions[hashString(key) % gradientOptions.length];

export default function AddItemModal({ visible, foodName, foodIcon, initialLocation = 'fridge', onSave, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const { units } = useUnits();
  const { locations } = useLocations();
  const [location, setLocation] = useState(initialLocation);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState(units[0]?.key || 'units');
  const [regDate, setRegDate] = useState(today);
  const [expDate, setExpDate] = useState('');
  const [note, setNote] = useState('');
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
      setUnit(units[0]?.key || 'units');
      setRegDate(today);
      const info = getFoodInfo(foodName);
      if (info?.expirationDays != null) {
        const d = new Date();
        d.setDate(d.getDate() + info.expirationDays);
        setExpDate(d.toISOString().split('T')[0]);
      } else {
        setExpDate('');
      }
      setNote('');
    }
  }, [visible, initialLocation, today, units, locations, foodName]);

  const g = gradientForKey(foodName || 'item');

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
                addShoppingItem(foodName, quantity || 0, unit);
                Alert.alert('Añadido', `${foodName} añadido a la lista de compras`);
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
            <Text style={styles.foodName} numberOfLines={2}>{foodName}</Text>
          </LinearGradient>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            {/* Ubicación */}
            <Text style={styles.labelBold}>Ubicación</Text>
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
            <Text style={styles.labelBold}>Cantidad</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                onPress={() => { setQuantity(q => Math.max(0, (q || 0) - 1)); bumpQty(); }}
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
                onPress={() => { setQuantity(q => (q || 0) + 1); bumpQty(); }}
                style={styles.qtyBtn}
              >
                <Text style={styles.qtyBtnText}>＋</Text>
              </TouchableOpacity>
            </View>

            {/* Unidad */}
            <Text style={styles.labelBold}>Unidad</Text>
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

            {/* Fechas */}
            <View style={{ marginTop: 6 }}>
              <Text style={styles.labelBold}>Fecha de registro</Text>
              <DatePicker value={regDate} onChange={setRegDate} />
              <View style={{ height: 8 }} />
              <Text style={styles.labelBold}>Fecha de caducidad</Text>
              <DatePicker value={expDate} onChange={setExpDate} />
            </View>

            {/* Nota */}
            <Text style={styles.labelBold}>Nota</Text>
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
              })
            }
            style={styles.saveFab}
          >
            <Text style={styles.saveFabText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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

  noteInput: {
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface2,
    color: palette.text,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
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
