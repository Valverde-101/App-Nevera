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

export default function BatchAddItemModal({ visible, items, onSave, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const [data, setData] = useState([]);

  useEffect(() => {
    if (visible) {
      setData(
        items.map(() => ({
          location: 'fridge',
          quantity: '1',
          unit: 'units',
          regDate: today,
          expDate: '',
          note: '',
        })),
      );
    }
  }, [visible, items, today]);

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
              {[
                { key: 'fridge', label: 'Nevera' },
                { key: 'freezer', label: 'Congelador' },
                { key: 'pantry', label: 'Despensa' },
              ].map(opt => (
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
                  <Text>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text>Cantidad</Text>
            <TextInput
              style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
              value={data[idx]?.quantity}
              onChangeText={t => updateField(idx, 'quantity', t)}
              keyboardType="numeric"
            />
            <Text>Unidad</Text>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              {[
                { key: 'units', label: 'Unidades' },
                { key: 'kg', label: 'Kg' },
                { key: 'l', label: 'L' },
              ].map(opt => (
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
                  <Text>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text>Fecha de registro</Text>
            <TextInput
              style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
              placeholder="YYYY-MM-DD"
              value={data[idx]?.regDate}
              onChangeText={t => updateField(idx, 'regDate', t)}
            />
            <Text>Fecha de caducidad</Text>
            <TextInput
              style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
              placeholder="YYYY-MM-DD"
              value={data[idx]?.expDate}
              onChangeText={t => updateField(idx, 'expDate', t)}
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

