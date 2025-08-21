import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useUnits } from '../context/UnitsContext';

export default function AddMiscItemModal({ visible, onSave, onClose }) {
  const { units } = useUnits();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState(units[0]?.key || 'units');

  useEffect(() => {
    if (visible) {
      setName('');
      setQuantity(1);
      setUnit(units[0]?.key || 'units');
    }
  }, [visible, units]);

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Añadir personalizado</Text>
        <TextInput
          style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
          placeholder="Nombre"
          value={name}
          onChangeText={setName}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ marginRight: 10 }}>Cantidad:</Text>
          <TouchableOpacity onPress={() => setQuantity(q => Math.max(0, q - 1))} style={{ borderWidth: 1, padding: 5, marginRight: 5 }}>
            <Text>◀</Text>
          </TouchableOpacity>
          <TextInput
            style={{ borderWidth: 1, padding: 5, marginRight: 5, width: 60, textAlign: 'center' }}
            keyboardType="numeric"
            value={quantity.toString()}
            onChangeText={t => setQuantity(parseFloat(t.replace(/[^0-9.]/g, '')) || 0)}
          />
          <TouchableOpacity onPress={() => setQuantity(q => q + 1)} style={{ borderWidth: 1, padding: 5 }}>
            <Text>▶</Text>
          </TouchableOpacity>
        </View>
        <Text>Unidad</Text>
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          {units.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={{ padding: 8, borderWidth: 1, borderColor: '#ccc', marginRight: 10, backgroundColor: unit === opt.key ? '#ddd' : '#fff' }}
              onPress={() => setUnit(opt.key)}
            >
              <Text>{opt.plural}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={onClose} style={{ padding: 10, borderWidth: 1, borderRadius: 8 }}>
            <Text>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onSave({ name, quantity: quantity || 0, unit })} style={{ padding: 10, borderWidth: 1, borderRadius: 8 }}>
            <Text>Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
