import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useUnits } from '../context/UnitsContext';
import { useLocations } from '../context/LocationsContext';
import DatePicker from './DatePicker';
import { getFoodInfo } from '../foodIcons';

export default function BatchAddItemModal({ visible, items, onSave, onClose }) {
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
      <ScrollView style={{ flex: 1, padding: 20 }}>
        {items.map((item, idx) => (
          <View
            key={idx}
            style={{
              marginBottom: 20,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              padding: 10,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              {item.name}
            </Text>
            {item.icon && (
              <Image
                source={item.icon}
                style={{ width: 60, height: 60, alignSelf: 'center', marginBottom: 10 }}
              />
            )}
            <Text style={{ marginBottom: 5 }}>Ubicación</Text>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              {locations.map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={{
                    padding: 8,
                    borderWidth: 1,
                    borderColor: '#ccc',
                    marginRight: 10,
                    backgroundColor: data[idx]?.location === opt.key ? '#ddd' : '#fff',
                  }}
                  onPress={() => updateField(idx, 'location', opt.key)}
                >
                  <Text>{opt.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <Text style={{ marginRight: 10 }}>Cantidad:</Text>
              <TouchableOpacity
                onPress={() =>
                  updateField(
                    idx,
                    'quantity',
                    String(
                      Math.max(0, (parseFloat(data[idx]?.quantity) || 0) - 1),
                    ),
                  )
                }
                style={{ borderWidth: 1, padding: 5, marginRight: 5 }}
              >
                <Text>◀</Text>
              </TouchableOpacity>
              <TextInput
                style={{
                  borderWidth: 1,
                  padding: 5,
                  marginRight: 5,
                  width: 60,
                  textAlign: 'center',
                }}
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
                style={{ borderWidth: 1, padding: 5 }}
              >
                <Text>▶</Text>
              </TouchableOpacity>
            </View>
            <Text>Unidad</Text>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              {units.map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={{
                    padding: 8,
                    borderWidth: 1,
                    borderColor: '#ccc',
                    marginRight: 10,
                    backgroundColor: data[idx]?.unit === opt.key ? '#ddd' : '#fff',
                  }}
                  onPress={() => updateField(idx, 'unit', opt.key)}
                >
                  <Text>{opt.plural}</Text>
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
            <Text>Nota</Text>
            <TextInput
              style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
              value={data[idx]?.note}
              onChangeText={t => updateField(idx, 'note', t)}
            />
          </View>
        ))}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <Button title="Volver" onPress={onClose} />
          <Button title="Guardar" onPress={() => onSave(data)} />
        </View>
      </ScrollView>
    </Modal>
  );
}

