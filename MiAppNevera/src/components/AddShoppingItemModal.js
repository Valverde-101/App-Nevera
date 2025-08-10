import React, {useEffect, useState} from 'react';
import {Modal, View, Text, TextInput, Button, TouchableOpacity, Image} from 'react-native';

export default function AddShoppingItemModal({visible, foodName, foodIcon, onSave, onClose}) {
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('units');

  useEffect(() => {
    if (visible) {
      setQuantity('1');
      setUnit('units');
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{flex:1, padding:20}}>
        <Text style={{fontSize:18, fontWeight:'bold', marginBottom:10}}>{foodName}</Text>
        {foodIcon && (
          <Image source={foodIcon} style={{width:60, height:60, alignSelf:'center', marginBottom:10}} />
        )}
        <Text>Cantidad</Text>
        <TextInput
          style={{borderWidth:1, marginBottom:10, padding:5}}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />
        <Text>Unidad</Text>
        <View style={{flexDirection:'row', marginBottom:10}}>
          {[
            {key:'units', label:'Unidades'},
            {key:'kg', label:'Kg'},
            {key:'l', label:'L'},
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
            onPress={() => onSave({quantity: parseInt(quantity,10) || 0, unit})}
          />
        </View>
      </View>
    </Modal>
  );
}
