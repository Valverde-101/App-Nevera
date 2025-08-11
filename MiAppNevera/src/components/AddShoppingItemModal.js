import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  Text,
  Button,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';

export default function AddShoppingItemModal({
  visible,
  foodName,
  foodIcon,
  onSave,
  onClose,
  initialQuantity,
  initialUnit,
}) {
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('units');

  useEffect(() => {
    if (visible) {
      setQuantity(String(initialQuantity ?? 1));
      setUnit(initialUnit || 'units');
    }
  }, [visible, initialQuantity, initialUnit]);

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{flex:1, padding:20}}>
        {foodIcon && (
          <Image source={foodIcon} style={{width:60, height:60, alignSelf:'center', marginBottom:10}} />
        )}
        <Text style={{fontSize:18, fontWeight:'bold', marginBottom:10}}>
          ¿Añadir {foodName} a la lista de compras?
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <Text style={{marginRight: 10}}>Cantidad:</Text>
          <TouchableOpacity
            onPress={() =>
              setQuantity(q => {
                const num = Math.max(0, (parseFloat(q) || 0) - 1);
                return String(num);
              })
            }
            style={{borderWidth: 1, padding: 5, marginRight: 5}}
          >
            <Text>◀</Text>
          </TouchableOpacity>
          <TextInput
            style={{borderWidth: 1, padding: 5, marginRight: 5, width: 60, textAlign: 'center'}}
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
            style={{borderWidth: 1, padding: 5}}
          >
            <Text>▶</Text>
          </TouchableOpacity>
        </View>
        <Text>Unidad</Text>
        <View style={{flexDirection:'row', marginBottom:10}}>
          {[
            {key:'units', label:'Unidades'},
            {key:'kg', label:'Kilos'},
            {key:'l', label:'Litros'},
          ].map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={{
                padding:8,
                borderWidth:1,
                borderColor:'#ccc',
                marginRight:10,
                backgroundColor: unit === opt.key ? '#ddd' : '#fff',
              }}
              onPress={() => setUnit(opt.key)}
            >
              <Text>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{flexDirection:'row', justifyContent:'space-between'}}>
          <Button title="Volver" onPress={onClose} />
          <Button
            title="Guardar"
            onPress={() => onSave({quantity: parseFloat(quantity) || 0, unit})}
          />
        </View>
      </View>
    </Modal>
  );
}
