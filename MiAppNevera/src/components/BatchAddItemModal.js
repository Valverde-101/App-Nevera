import React, { useEffect, useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useUnits } from '../context/UnitsContext';
import { useLocations } from '../context/LocationsContext';
import DatePicker from './DatePicker';
import { getFoodInfo } from '../foodIcons';
import { useTheme } from '../context/ThemeContext';

export default function BatchAddItemModal({ visible, items, onSave, onClose }) {
  const palette = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const today = new Date().toISOString().split('T')[0];
  const { units } = useUnits();
  const { locations } = useLocations();
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
            unit: units[0]?.key || 'units',
            regDate: today,
            expDate: exp,
            note: '',
          };
        }),
      );
    }
  }, [visible, items, today, units, locations]);

  const updateField = (index, field, value) => {
    setData(prev => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  };

  return (
    <Modal visible={visible} animationType="slide">
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 20 }}>
        {items.map((item, idx) => (
          <View key={idx} style={styles.card}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.icon && <Image source={item.icon} style={styles.icon} />}

            <Text style={styles.label}>Ubicación</Text>
            <View style={styles.chipRow}>
              {locations.map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.chip,
                    data[idx]?.location === opt.key && styles.chipSelected,
                  ]}
                  onPress={() => updateField(idx, 'location', opt.key)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      data[idx]?.location === opt.key && styles.chipTextSelected,
                    ]}
                  >
                    {opt.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.qtyRow}>
              <Text style={[styles.label, { marginRight: 10 }]}>Cantidad:</Text>
              <TouchableOpacity
                onPress={() =>
                  updateField(
                    idx,
                    'quantity',
                    String(Math.max(0, (parseFloat(data[idx]?.quantity) || 0) - 1)),
                  )
                }
                style={[styles.qtyBtn, { marginRight: 5 }]}
              >
                <Text style={styles.qtyBtnText}>◀</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.qtyInput}
                keyboardType="numeric"
                value={data[idx]?.quantity}
                onChangeText={t =>
                  updateField(idx, 'quantity', t.replace(/[^0-9.]/g, ''))
                }
              />
              <TouchableOpacity
                onPress={() =>
                  updateField(
                    idx,
                    'quantity',
                    String((parseFloat(data[idx]?.quantity) || 0) + 1),
                  )
                }
                style={styles.qtyBtn}
              >
                <Text style={styles.qtyBtnText}>▶</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Unidad</Text>
            <View style={styles.chipRow}>
              {units.map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.chip,
                    data[idx]?.unit === opt.key && styles.chipSelected,
                  ]}
                  onPress={() => updateField(idx, 'unit', opt.key)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      data[idx]?.unit === opt.key && styles.chipTextSelected,
                    ]}
                  >
                    {opt.plural}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <DatePicker
              label="Fecha de registro"
              value={data[idx]?.regDate}
              onChange={t => updateField(idx, 'regDate', t)}
            />
            <DatePicker
              label="Fecha de caducidad"
              value={data[idx]?.expDate}
              onChange={t => updateField(idx, 'expDate', t)}
            />

            <Text style={styles.label}>Nota</Text>
            <TextInput
              style={styles.noteInput}
              value={data[idx]?.note}
              onChangeText={t => updateField(idx, 'note', t)}
            />
          </View>
        ))}

        <View style={styles.footer}>
          <Button title="Volver" onPress={onClose} />
          <Button
            title="Guardar"
            onPress={() =>
              onSave(
                data.map((d, idx) => ({
                  ...d,
                  index: items[idx].index,
                  name: items[idx].name,
                })),
              )
            }
          />
        </View>
      </ScrollView>
    </Modal>
  );
}

const createStyles = palette =>
  StyleSheet.create({
    scroll: { flex: 1, padding: 20, backgroundColor: palette.bg },
    card: {
      marginBottom: 20,
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: 8,
      padding: 10,
      backgroundColor: palette.surface,
    },
    itemName: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: palette.text,
    },
    icon: { width: 60, height: 60, alignSelf: 'center', marginBottom: 10 },
    label: { color: palette.text, marginBottom: 5 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
    chip: {
      padding: 8,
      borderWidth: 1,
      borderColor: palette.border,
      marginRight: 10,
      marginBottom: 8,
      backgroundColor: palette.surface2,
      borderRadius: 8,
    },
    chipSelected: { backgroundColor: palette.surface3, borderColor: palette.accent },
    chipText: { color: palette.text },
    chipTextSelected: { color: palette.accent },
    qtyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    qtyBtn: {
      borderWidth: 1,
      borderColor: palette.border,
      padding: 5,
      backgroundColor: palette.surface2,
    },
    qtyBtnText: { color: palette.text },
    qtyInput: {
      borderWidth: 1,
      borderColor: palette.border,
      padding: 5,
      marginHorizontal: 5,
      width: 60,
      textAlign: 'center',
      backgroundColor: palette.surface2,
      color: palette.text,
    },
    noteInput: {
      borderWidth: 1,
      borderColor: palette.border,
      padding: 5,
      marginBottom: 10,
      backgroundColor: palette.surface2,
      color: palette.text,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
  });

