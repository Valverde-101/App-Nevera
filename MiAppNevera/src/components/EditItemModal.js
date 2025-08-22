// EditItemModal.js – dark–premium v2.2.10 (consistente con AddItemModal/FoodPickerModal)
// - Hero con gradiente por ítem
// - Chips para ubicación/unidad
// - Inputs de fecha gris (combina con el tema)
// - Barra de desplazamiento sutil color dorado en web con gutter estable
// - Modal de confirmación estilizado
import React, { useEffect, useRef, useState, useMemo } from 'react';
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
import AddShoppingItemModal from './AddShoppingItemModal';
import DatePicker from './DatePicker';
import { useUnits } from '../context/UnitsContext';
import { useLocations } from '../context/LocationsContext';
import { useTheme, useThemeController } from '../context/ThemeContext';
import { gradientForKey } from '../theme/gradients';

export default function EditItemModal({ visible, item, onSave, onDelete, onClose }) {
  const palette = useTheme();
  const { themeName } = useThemeController();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { addItem: addShoppingItem } = useShopping();
  const { units } = useUnits();
  const { locations } = useLocations();

  const [location, setLocation] = useState(locations[0]?.key || 'fridge');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState(units[0]?.key || 'units');
  const [regDate, setRegDate] = useState('');
  const [expDate, setExpDate] = useState('');
  const [note, setNote] = useState('');
  const [price, setPrice] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [shoppingVisible, setShoppingVisible] = useState(false);

  // Animación suave al cambiar cantidad
  const qtyScale = useRef(new Animated.Value(1)).current;
  const bumpQty = () => {
    Animated.sequence([
      Animated.timing(qtyScale, { toValue: 1.1, duration: 120, useNativeDriver: true }),
      Animated.spring(qtyScale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    if (visible && item) {
      setLocation(item.location || locations[0]?.key || 'fridge');
      setQuantity(item.quantity ?? 0);
      setUnit(item.unit || units[0]?.key || 'units');
      setRegDate(item.registered || '');
      setExpDate(item.expiration || '');
      setNote(item.note || '');
      setPrice(item.price != null ? String(item.price) : '');
    }
  }, [visible, item, units, locations]);

  const g = gradientForKey(themeName, item?.name || 'item');

  const handleSave = () => {
    onSave({
      location,
      quantity: quantity || 0,
      unit,
      registered: regDate,
      expiration: expDate,
      note,
      price: parseFloat(price) || 0,
    });
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
                <Text style={styles.iconText}>←</Text>
              </TouchableOpacity>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  onPress={() => setShoppingVisible(true)}
                  style={[styles.iconBtn, { marginRight: 8 }]}
                >
                  <Text style={styles.iconText}>🧺</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setConfirmVisible(true)} style={styles.iconBtn}>
                  <Text style={styles.iconText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Hero */}
            <LinearGradient colors={g.colors} locations={g.locations} start={g.start} end={g.end} style={styles.hero}>
              <View style={styles.foodIconBox}>
                {item?.icon && <Image source={item.icon} style={{ width: 64, height: 64 }} resizeMode="contain" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.foodName} numberOfLines={2}>{item?.name || 'Alimento'}</Text>
                {!!item?.foodCategory && (
                  <Text style={{ color: palette.textDim, fontSize: 12 }} numberOfLines={1}>{item.foodCategory}</Text>
                )}
              </View>
            </LinearGradient>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={Platform.OS === 'web' ? true : false}
            >
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

            {/* Precio */}
            <Text style={styles.labelBold}>Precio unitario</Text>
            <TextInput
              style={styles.priceInput}
              value={price}
              onChangeText={t => {
                let sanitized = t.replace(/[^0-9.]/g, '');
                const parts = sanitized.split('.');
                if (parts.length > 2) {
                  sanitized = parts[0] + '.' + parts.slice(1).join('');
                }
                setPrice(sanitized);
              }}
              keyboardType="decimal-pad"
              inputMode="decimal"
              placeholder="Opcional"
              placeholderTextColor={palette.textDim}
            />

            {/* Fechas (inputs gris) */}
            <View style={{ marginTop: 6 }}>
                <Text style={styles.labelBold}>Fecha de registro</Text>
                <DatePicker
                  value={regDate}
                  onChange={setRegDate}
                  inputStyle={styles.dateInput}
                  containerStyle={styles.dateContainer}
                />
                <View style={{ height: 8 }} />
                <Text style={styles.labelBold}>Fecha de caducidad</Text>
                <DatePicker
                  value={expDate}
                  onChange={setExpDate}
                  inputStyle={styles.dateInput}
                  containerStyle={styles.dateContainer}
                />
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
            <TouchableOpacity onPress={handleSave} style={styles.saveFab}>
              <Text style={styles.saveFabText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Añadir a compras */}
      <AddShoppingItemModal
        visible={shoppingVisible}
        foodName={item?.name}
        foodIcon={item?.icon}
        initialUnit={item?.unit}
        initialUnitPrice={item?.price}
        onSave={({ quantity: q, unit: u, unitPrice, totalPrice }) => {
          addShoppingItem(item?.name, q || 0, u, unitPrice, totalPrice);
          Alert.alert('Añadido', `${item?.name} añadido a la lista de compras`);
          setShoppingVisible(false);
        }}
        onClose={() => setShoppingVisible(false)}
      />

      {/* Confirmar eliminación */}
      <Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={() => setConfirmVisible(false)}>
        <Pressable onPress={() => setConfirmVisible(false)} style={styles.confirmBackdrop}>
          <Pressable style={styles.confirmCard}>
            <View style={{ alignItems: 'center', marginBottom: 10 }}>
              {item?.icon && <Image source={item.icon} style={{ width: 64, height: 64, marginBottom: 10 }} />}
              <Text style={{ color: palette.text, textAlign: 'center' }}>
                ¿Seguro que deseas eliminar <Text style={{ color: palette.accent }}>{item?.name}</Text>?
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={() => setConfirmVisible(false)} style={[styles.bottomBtn, { backgroundColor: palette.surface3, flex: 1, marginRight: 8 }]}>
                <Text style={{ color: palette.text }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setConfirmVisible(false); onDelete && onDelete(); }}
                style={[styles.bottomBtn, { backgroundColor: '#e53935', flex: 1, marginLeft: 8 }]}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
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
  foodName: { color: palette.accent, fontSize: 18, fontWeight: '400', marginBottom: 2 },

  // ScrollView (Web): barra sutil DORADA + gutter estable
  scroll: {
    ...(Platform.OS === 'web'
      ? {
          scrollbarWidth: 'thin',                          // Firefox
          scrollbarColor: `${palette.accent} ${palette.surface2}`,
          scrollbarGutter: 'stable both-edges',            // evita "bailes" al aparecer la barra
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

  // Estilos para DatePicker (gris, consistente)
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

  // Confirmación
  confirmBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  confirmCard: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    width: '100%',
    maxWidth: 360,
  },
  bottomBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
  },
});


