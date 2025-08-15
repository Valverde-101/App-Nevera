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
import { useUnits } from '../context/UnitsContext';

export default function AddShoppingItemModal({
  visible,
  foodName,
  foodIcon,
  onSave,
  onClose,
  initialQuantity,
  initialUnit,
}) {
  const { units } = useUnits();
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState(units[0]?.key || 'units');

  useEffect(() => {
    if (visible) {
      setQuantity(initialQuantity ?? 1);
      setUnit(initialUnit || units[0]?.key || 'units');
    }
  }, [visible, initialQuantity, initialUnit, units]);

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
            onPress={() => setQuantity(q => Math.max(0, q - 1))}
            style={{borderWidth: 1, padding: 5, marginRight: 5}}
          >
            <Text>◀</Text>
          </TouchableOpacity>
          <TextInput
            style={{borderWidth: 1, padding: 5, marginRight: 5, width: 60, textAlign: 'center'}}
            keyboardType="numeric"
            value={quantity.toString()}
            onChangeText={t =>
              setQuantity(parseFloat(t.replace(/[^0-9.]/g, '')) || 0)
            }
          />
          <TouchableOpacity
            onPress={() => setQuantity(q => q + 1)}
            style={{borderWidth: 1, padding: 5}}
          >
            <Text>▶</Text>
          </TouchableOpacity>
        </View>
        <Text>Unidad</Text>
        <View style={{flexDirection:'row', marginBottom:10}}>
          {units.map(opt => (
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
              <Text>{opt.plural}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{flexDirection:'row', justifyContent:'space-between'}}>
          <Button title="Volver" onPress={onClose} />
          <Button
            title="Guardar"
            onPress={() => onSave({quantity: quantity || 0, unit})}
          />
        </View>
      </View>
    </Modal>
  );
}
