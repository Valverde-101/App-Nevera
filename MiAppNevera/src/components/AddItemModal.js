import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useShopping} from '../context/ShoppingContext';
import { useUnits } from '../context/UnitsContext';
import { useLocations } from '../context/LocationsContext';

export default function AddItemModal({ visible, foodName, foodIcon, initialLocation = 'fridge', onSave, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const { units } = useUnits();
  const { locations } = useLocations();
  const [location, setLocation] = useState(initialLocation);
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState(units[0]?.key || 'units');
  const [regDate, setRegDate] = useState(today);
  const [expDate, setExpDate] = useState('');
  const [note, setNote] = useState('');
  const [showRegPicker, setShowRegPicker] = useState(false);
  const [showExpPicker, setShowExpPicker] = useState(false);

  const {addItem: addShoppingItem} = useShopping();

  useEffect(() => {
    if (visible) {
      setLocation(initialLocation);
      setQuantity(1);
      setUnit(units[0]?.key || 'units');
      setRegDate(today);
      setExpDate('');
      setNote('');
    }
  }, [visible, initialLocation, today, units, locations]);

  const handleRegChange = (event, selectedDate) => {
    setShowRegPicker(false);
    if (selectedDate) {
      setRegDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleExpChange = (event, selectedDate) => {
    setShowExpPicker(false);
    if (selectedDate) {
      setExpDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  return (
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
          <TouchableOpacity
            onPress={() => {
              addShoppingItem(foodName, parseFloat(quantity) || 0, unit);
              Alert.alert('Añadido', `${foodName} añadido a la lista de compras`);
            }}
          >
            <Text style={{ fontSize: 24 }}>🧺</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{foodName}</Text>
        {foodIcon && (
          <Image
            source={foodIcon}
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
          onPress={() =>
            onSave({
              location,
              quantity: parseFloat(quantity) || 0,
              unit,
              registered: regDate,
              expiration: expDate,
              note,
            })
          }
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
  );
}
