import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUnits } from '../context/UnitsContext';
import { getFoodInfo, getFoodIcon } from '../foodIcons';
import { useDefaultFoods } from '../context/DefaultFoodsContext';

export default function EditDefaultFoodModal({ visible, foodKey, onClose }) {
  const palette = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { units } = useUnits();
  const { updateOverride } = useDefaultFoods();
  const [name, setName] = useState('');
  const [days, setDays] = useState('');
  const [unit, setUnit] = useState(units[0]?.key || 'units');
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (visible && foodKey) {
      const info = getFoodInfo(foodKey);
      setName(info?.name || foodKey);
      setDays(info?.expirationDays != null ? String(info.expirationDays) : '');
      setUnit(info?.defaultUnit || units[0]?.key || 'units');
      setPrice(info?.defaultPrice != null ? String(info.defaultPrice) : '');
    }
  }, [visible, foodKey, units]);

  const handleSave = () => {
    updateOverride(foodKey, {
      name,
      expirationDays: days === '' ? null : Number(days),
      defaultUnit: unit,
      defaultPrice: price === '' ? null : Number(price),
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Editar alimento</Text>
          <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16 }}>
            {foodKey && (
              <Image source={getFoodIcon(foodKey)} style={styles.editIcon} />
            )}
            <Text style={styles.label}>Nombre</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} />
            <Text style={styles.label}>Días de caducidad</Text>
            <TextInput
              value={days}
              onChangeText={t => setDays(t.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              style={styles.input}
            />
            <Text style={styles.label}>Unidad por defecto</Text>
            <View style={styles.chipWrap}>
              {units.map(u => (
                <Pressable
                  key={u.key}
                  onPress={() => setUnit(u.key)}
                  style={[styles.chip, unit === u.key && styles.chipOn]}
                >
                  <Text style={[styles.chipTxt, unit === u.key && styles.chipTxtOn]}>
                    {u.singular}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.label}>Precio unitario</Text>
            <TextInput
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
              style={styles.input}
            />
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.btn}>
              <Text style={styles.btnTxt}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={[styles.btn, styles.btnPrimary]}>
              <Text style={styles.btnPrimaryTxt}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = palette =>
  StyleSheet.create({
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    sheet: {
      backgroundColor: palette.bg,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: palette.border,
      width: '90%',
      maxHeight: '80%',
      minHeight: '50%',
      overflow: 'hidden',
    },
    title: {
      textAlign: 'center',
      color: palette.accent,
      fontWeight: '700',
      fontSize: 16,
      marginTop: 12,
    },
    scroll: { flex: 1 },
    label: { color: palette.text, marginTop: 12, marginBottom: 4 },
    input: {
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface2,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 8,
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
    chipOn: { backgroundColor: palette.surface3, borderColor: palette.accent },
    chipTxt: { color: palette.text },
    chipTxtOn: { color: palette.accent },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: 12,
      borderTopWidth: 1,
      borderColor: palette.border,
    },
    btn: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface2,
      marginLeft: 8,
    },
    btnTxt: { color: palette.text },
    btnPrimary: { backgroundColor: palette.accent, borderColor: '#e2b06c' },
    btnPrimaryTxt: { color: '#1b1d22', fontWeight: '700' },
    editIcon: {
      width: 80,
      height: 80,
      alignSelf: 'center',
      marginBottom: 16,
    },
  });
