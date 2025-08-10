import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {useShopping} from '../context/ShoppingContext';

export default function AddItemModal({ visible, foodName, foodIcon, initialLocation = 'fridge', onSave, onClose }) {
  const [location, setLocation] = useState(initialLocation);
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('units');
  const [regDate, setRegDate] = useState('');
  const [expDate, setExpDate] = useState('');
  const [note, setNote] = useState('');

  const {addItem: addShoppingItem} = useShopping();

  useEffect(() => {
    if (visible) {
      setLocation(initialLocation);
      setQuantity('1');
      setUnit('units');
      setRegDate('');
      setExpDate('');
      setNote('');
    }
  }, [visible, initialLocation]);

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{foodName}</Text>
        {foodIcon && (
          <Image
            source={foodIcon}
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <Button title="Volver" onPress={onClose} />
          <Button
            title="Guardar"
            onPress={() =>
              onSave({
                location,
                quantity: parseInt(quantity, 10) || 0,
                unit,
                registered: regDate,
                expiration: expDate,
                note,
              })
            }
          />
        </View>
        <Button
          title="Añadir a compras"
          onPress={() => {
            addShoppingItem(foodName, parseInt(quantity, 10) || 0, unit);
            Alert.alert('Añadido', `${foodName} añadido a la lista de compras`);
          }}
        />
      </View>
    </Modal>
  );
}
