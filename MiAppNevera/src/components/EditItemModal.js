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
import DateTimePicker from '@react-native-community/datetimepicker';
import { useShopping } from '../context/ShoppingContext';
import AddShoppingItemModal from './AddShoppingItemModal';
import { useUnits } from '../context/UnitsContext';
import { useLocations } from '../context/LocationsContext';

export default function EditItemModal({ visible, item, onSave, onDelete, onClose }) {
  const { addItem: addShoppingItem } = useShopping();
  const { units } = useUnits();
  const { locations } = useLocations();
  const [location, setLocation] = useState(locations[0]?.key || 'fridge');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState(units[0]?.key || 'units');
  const [regDate, setRegDate] = useState('');
  const [expDate, setExpDate] = useState('');
  const [note, setNote] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [shoppingVisible, setShoppingVisible] = useState(false);
  const [showRegPicker, setShowRegPicker] = useState(false);
  const [showExpPicker, setShowExpPicker] = useState(false);

  useEffect(() => {
    if (visible && item) {
      setLocation(item.location || locations[0]?.key || 'fridge');
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
      quantity: parseFloat(quantity) || 0,
      unit,
      registered: regDate,
      expiration: expDate,
      note,
    });
  };

  const handleRegChange = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setShowRegPicker(false);
      return;
    }
    if (event.type === 'set' && selectedDate) {
      setRegDate(selectedDate.toISOString().split('T')[0]);
    }
    setShowRegPicker(false);
  };

  const handleExpChange = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setShowExpPicker(false);
      return;
    }
    if (event.type === 'set' && selectedDate) {
      setExpDate(selectedDate.toISOString().split('T')[0]);
    }
    setShowExpPicker(false);
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
              onPress={() => setShoppingVisible(true)}
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
            {locations.map(opt => (
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
                setQuantity(q => {
                  const num = Math.max(0, (parseFloat(q) || 0) - 1);
                  return String(num);
                })
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
              value={quantity}
              onChangeText={t => setQuantity(t.replace(/[^0-9.]/g, ''))}
            />
            <TouchableOpacity
              onPress={() =>
                setQuantity(q => {
                  const num = (parseFloat(q) || 0) + 1;
                  return String(num);
                })
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
                  backgroundColor: unit === opt.key ? '#ddd' : '#fff',
                }}
                onPress={() => setUnit(opt.key)}
              >
                <Text>{opt.plural}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text>Fecha de registro</Text>
          <TouchableOpacity
            style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
            onPress={() => setShowRegPicker(true)}
          >
            <Text>{regDate || 'YYYY-MM-DD'}</Text>
          </TouchableOpacity>
          <Text>Fecha de caducidad</Text>
          <TouchableOpacity
            style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
            onPress={() => setShowExpPicker(true)}
          >
            <Text>{expDate || 'YYYY-MM-DD'}</Text>
          </TouchableOpacity>
          <Text>Nota</Text>
          <TextInput
            style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
            value={note}
            onChangeText={setNote}
          />
          {showRegPicker && (
            <DateTimePicker
              value={regDate ? new Date(regDate) : new Date()}
              mode="date"
              display="calendar"
              onChange={handleRegChange}
            />
          )}
          {showExpPicker && (
            <DateTimePicker
              value={expDate ? new Date(expDate) : new Date()}
              mode="date"
              display="calendar"
              onChange={handleExpChange}
            />
          )}
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
      <AddShoppingItemModal
        visible={shoppingVisible}
        foodName={item?.name}
        foodIcon={item?.icon}
        initialUnit={item?.unit}
        onSave={({ quantity, unit }) => {
          addShoppingItem(item.name, parseFloat(quantity) || 0, unit);
          setShoppingVisible(false);
        }}
        onClose={() => setShoppingVisible(false)}
      />
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
