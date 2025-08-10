import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useShopping } from '../context/ShoppingContext';

export default function EditItemModal({ visible, item, onSave, onDelete, onClose }) {
  const { addItem: addShoppingItem } = useShopping();
  const [location, setLocation] = useState('fridge');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('units');
  const [regDate, setRegDate] = useState('');
  const [expDate, setExpDate] = useState('');
  const [note, setNote] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    if (visible && item) {
      setLocation(item.location || 'fridge');
      setQuantity(String(item.quantity));
      setUnit(item.unit);
      setRegDate(item.registered || '');
      setExpDate(item.expiration || '');
      setNote(item.note || '');
    }
  }, [visible, item]);

  const handleSave = () => {
    onSave({
      location,
      quantity: parseInt(quantity, 10) || 0,
      unit,
      registered: regDate,
      expiration: expDate,
      note,
    });
  };

  return (
    <>
      <Modal visible={visible} animationType="slide">
        <View style={{ flex: 1, padding: 20 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 24 }}>←</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() =>
                  addShoppingItem(item.name, 1, item.unit)
                }
                style={{ marginRight: 15 }}
              >
                <Text style={{ fontSize: 24 }}>🧺</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setConfirmVisible(true)}>
                <Text style={{ fontSize: 24 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
          {item?.icon && (
            <Image
              source={item.icon}
              style={{ width: 60, height: 60, alignSelf: 'center', marginBottom: 10 }}
            />
          )}
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{item?.name}</Text>
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
                  backgroundColor: location === opt.key ? '#ddd' : '#fff',
                }}
                onPress={() => setLocation(opt.key)}
              >
                <Text>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text>Cantidad</Text>
          <TextInput
            style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
            value={quantity}
            onChangeText={setQuantity}
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
                  backgroundColor: unit === opt.key ? '#ddd' : '#fff',
                }}
                onPress={() => setUnit(opt.key)}
              >
                <Text>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text>Fecha de registro</Text>
          <TextInput
            style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
            placeholder="YYYY-MM-DD"
            value={regDate}
            onChangeText={setRegDate}
          />
          <Text>Fecha de caducidad</Text>
          <TextInput
            style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
            placeholder="YYYY-MM-DD"
            value={expDate}
            onChangeText={setExpDate}
          />
          <Text>Nota</Text>
          <TextInput
            style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
            value={note}
            onChangeText={setNote}
          />
          <TouchableOpacity
            onPress={handleSave}
            style={{
              position: 'absolute',
              bottom: 20,
              alignSelf: 'center',
              backgroundColor: '#2196f3',
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Modal visible={confirmVisible} transparent animationType="fade">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: '#fff', padding: 20, alignItems: 'center', width: '80%' }}>
            {item?.icon && (
              <Image source={item.icon} style={{ width: 60, height: 60, marginBottom: 10 }} />
            )}
            <Text style={{ marginBottom: 20 }}>¿Seguro que deseas eliminar {item?.name}?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <Button title="Cancelar" onPress={() => setConfirmVisible(false)} />
              <Button
                title="Eliminar"
                color="red"
                onPress={() => {
                  setConfirmVisible(false);
                  onDelete();
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
