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
import BatchAddItemModal from '../components/BatchAddItemModal';
import {getFoodIcon} from '../foodIcons';

export default function ShoppingListScreen() {
  const {
    list,
    addItem,
    addItems,
    togglePurchased,
    removeItem,
    removeItems,
    markPurchased,
  } = useShopping();
  const {inventory, addItem: addInventoryItem} = useInventory();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [autoVisible, setAutoVisible] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [batchVisible, setBatchVisible] = useState(false);

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
    const newItems = zeroItems
      .filter(it => !list.some(l => l.name === it.name))
      .map(it => ({name: it.name, quantity: 1, unit: it.unit}));
    if (newItems.length) {
      addItems(newItems);
    }
    setAutoVisible(false);
  };

  const toggleSelect = index => {
    setSelected(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index],
    );
  };

  const selectAll = () => {
    if (selected.length === list.length) {
      setSelected([]);
    } else {
      setSelected(list.map((_, idx) => idx));
    }
  };

  const deleteSelected = () => {
    removeItems(selected);
    setSelected([]);
    setSelectMode(false);
  };

  const handleBatchSave = entries => {
    entries.forEach((entry, idx) => {
      const {location, quantity, unit, regDate, expDate, note} = entry;
      const item = list[selected[idx]];
      addInventoryItem(
        location,
        item.name,
        parseInt(quantity, 10) || 0,
        unit,
        regDate,
        expDate,
        note,
      );
    });
    markPurchased(selected);
    setBatchVisible(false);
    setSelected([]);
    setSelectMode(false);
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
        {!selectMode ? (
          <>
            <Button title="Añadir" onPress={() => setPickerVisible(true)} />
            <TouchableOpacity onPress={() => setAutoVisible(true)}>
              <Text style={{fontSize:24}}>⚡</Text>
            </TouchableOpacity>
            <Button title="Seleccionar" onPress={() => setSelectMode(true)} />
          </>
        ) : (
          <>
            <Button title="Seleccionar todo" onPress={selectAll} />
            <Button title="Eliminar" onPress={deleteSelected} />
            <Button title="Guardar" onPress={() => setBatchVisible(true)} />
          </>
        )}
      </View>
      <ScrollView>
        {Object.entries(grouped).map(([cat, items]) => (
          <View key={cat} style={{marginBottom:10}}>
            <Text style={{fontSize:18, fontWeight:'bold', marginBottom:5}}>{cat}</Text>
            {items.map(({item, index}) => (
              <TouchableOpacity
                key={index}
                onPress={() =>
                  selectMode ? toggleSelect(index) : togglePurchased(index)
                }
                onLongPress={() => !selectMode && removeItem(index)}
              >
                <View
                  style={{
                    flexDirection:'row',
                    alignItems:'center',
                    padding:5,
                    backgroundColor: selectMode && selected.includes(index)
                      ? '#e0f7fa'
                      : item.purchased
                      ? '#ddd'
                      : 'transparent',
                  }}
                >
                  {selectMode && (
                    <Text style={{marginRight:10}}>
                      {selected.includes(index) ? '☑️' : '⬜'}
                    </Text>
                  )}
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

      <BatchAddItemModal
        visible={batchVisible}
        items={selected.map(idx => list[idx])}
        onSave={handleBatchSave}
        onClose={() => setBatchVisible(false)}
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
