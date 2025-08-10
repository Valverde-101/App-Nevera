import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Button,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import {useShopping} from '../context/ShoppingContext';
import {useInventory} from '../context/InventoryContext';
import FoodPickerModal from '../components/FoodPickerModal';
import AddShoppingItemModal from '../components/AddShoppingItemModal';
import {getFoodIcon} from '../foodIcons';

export default function ShoppingListScreen() {
  const {list, addItem, togglePurchased, removeItem} = useShopping();
  const {inventory} = useInventory();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [autoVisible, setAutoVisible] = useState(false);

  const onSelectFood = name => {
    setSelectedFood({name, icon: getFoodIcon(name)});
    setPickerVisible(false);
    setAddVisible(true);
  };

  const onSave = ({quantity, unit}) => {
    if (selectedFood) {
      addItem(selectedFood.name, quantity, unit);
      setSelectedFood(null);
      setAddVisible(false);
    }
  };

  const handleAutoAdd = () => {
    const zeroItems = ['fridge', 'freezer', 'pantry'].flatMap(loc =>
      inventory[loc].filter(item => item.quantity === 0),
    );
    zeroItems.forEach(it => {
      if (!list.some(l => l.name === it.name)) {
        addItem(it.name, 1, it.unit);
      }
    });
    setAutoVisible(false);
  };

  const grouped = {};
  list.forEach((item, index) => {
    const cat = item.foodCategory || 'otros';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({item, index});
  });

  return (
    <View style={{flex:1, padding:20}}>
      <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:10}}>
        <Button title="Añadir" onPress={() => setPickerVisible(true)} />
        <TouchableOpacity onPress={() => setAutoVisible(true)}>
          <Text style={{fontSize:24}}>⚡</Text>
        </TouchableOpacity>
      </View>
      <ScrollView>
        {Object.entries(grouped).map(([cat, items]) => (
          <View key={cat} style={{marginBottom:10}}>
            <Text style={{fontSize:18, fontWeight:'bold', marginBottom:5}}>{cat}</Text>
            {items.map(({item, index}) => (
              <TouchableOpacity
                key={index}
                onPress={() => togglePurchased(index)}
                onLongPress={() => removeItem(index)}
              >
                <View
                  style={{
                    flexDirection:'row',
                    alignItems:'center',
                    padding:5,
                    backgroundColor: item.purchased ? '#ddd' : 'transparent',
                  }}
                >
                  {item.icon && (
                    <Image
                      source={item.icon}
                      style={{width:30, height:30, marginRight:10}}
                    />
                  )}
                  <Text
                    style={{
                      textDecorationLine: item.purchased ? 'line-through' : 'none',
                      color: item.purchased ? 'gray' : 'black',
                    }}
                  >
                    {item.name} - {item.quantity} {item.unit}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      <FoodPickerModal
        visible={pickerVisible}
        onSelect={onSelectFood}
        onClose={() => setPickerVisible(false)}
      />
      <AddShoppingItemModal
        visible={addVisible}
        foodName={selectedFood?.name}
        foodIcon={selectedFood?.icon}
        onSave={onSave}
        onClose={() => setAddVisible(false)}
      />

      <Modal
        visible={autoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAutoVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setAutoVisible(false)}>
          <View
            style={{
              flex:1,
              justifyContent:'center',
              alignItems:'center',
              backgroundColor:'rgba(0,0,0,0.3)',
            }}
          >
            <TouchableWithoutFeedback>
              <View style={{backgroundColor:'#fff', padding:20, borderRadius:8}}>
                <Text style={{marginBottom:10}}>
                  ¿Desea añadir todos los elementos que presenten una cantidad de 0 a la lista de compras? Todos los alimentos que ya se encuentren en la lista no se agregarán.
                </Text>
                <View style={{flexDirection:'row', justifyContent:'space-around'}}>
                  <Button title="Cancelar" onPress={() => setAutoVisible(false)} />
                  <Button title="Aceptar" onPress={handleAutoAdd} />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
