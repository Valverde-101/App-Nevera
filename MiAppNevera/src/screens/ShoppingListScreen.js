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
import { Ionicons } from '@expo/vector-icons';
import {useShopping} from '../context/ShoppingContext';
import {useInventory} from '../context/InventoryContext';
import FoodPickerModal from '../components/FoodPickerModal';
import AddShoppingItemModal from '../components/AddShoppingItemModal';
import BatchAddItemModal from '../components/BatchAddItemModal';
import {getFoodIcon} from '../foodIcons';
import { useUnits } from '../context/UnitsContext';
import { useLocations } from '../context/LocationsContext';

export default function ShoppingListScreen() {
  const {
    list,
    addItem,
    addItems,
    togglePurchased,
    removeItems,
    markPurchased,
  } = useShopping();
  const {inventory, addItem: addInventoryItem, removeItem: removeInventoryItem} = useInventory();
  const { getLabel } = useUnits();
  const { locations } = useLocations();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [autoVisible, setAutoVisible] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [batchVisible, setBatchVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const onSelectFood = (name, icon) => {
    setSelectedFood({name, icon});
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
    const zeroItems = locations.flatMap(loc =>
      inventory[loc.key].filter(item => item.quantity === 0),
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
    setSelected(prev => {
      const updated = prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index];
      if (updated.length === 0) setSelectMode(false);
      return updated;
    });
  };

  const selectAll = () => {
    if (selected.length === list.length) {
      setSelected([]);
      setSelectMode(false);
    } else {
      setSelected(list.map((_, idx) => idx));
    }
  };

  const deleteSelected = () => {
    removeItems(selected);
    setSelected([]);
    setSelectMode(false);
    setConfirmVisible(false);
  };

  const handleBatchSave = entries => {
    const names = new Set(entries.map(e => e.name));
    locations.forEach(loc => {
      for (let i = inventory[loc.key].length - 1; i >= 0; i--) {
        const invItem = inventory[loc.key][i];
        if (
          names.has(invItem.name) &&
          invItem.quantity === 0 &&
          (!invItem.note || invItem.note.trim() === '')
        ) {
          removeInventoryItem(loc.key, i);
        }
      }
    });

    for (const entry of entries) {
      const {name, location, quantity, unit, regDate, expDate, note} = entry;
      const qty = parseFloat(quantity) || 0;
      const hasNote = note && note.trim() !== '';
      if (qty !== 0 || hasNote) {
        addInventoryItem(location, name, qty, unit, regDate, expDate, note);
      }
    }

    const zeroUnselected = list
      .map((it, idx) => ({it, idx}))
      .filter(({it, idx}) => it.quantity === 0 && !entries.some(e => e.index === idx))
      .map(({idx}) => idx);
    const toMark = [...new Set([...zeroUnselected, ...entries.map(e => e.index)])];
    if (toMark.length) {
      markPurchased(toMark);
    }
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
    <View style={{flex:1, padding:20, backgroundColor:'#121212'}}>
      <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:10}}>
        {!selectMode ? (
          <>
            <Button title="Añadir" onPress={() => setPickerVisible(true)} />
            <TouchableOpacity onPress={() => setAutoVisible(true)}>
              <Ionicons name="flash-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Button title="Seleccionar todo" onPress={selectAll} />
            <Button title="Eliminar" onPress={() => setConfirmVisible(true)} />
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
                onLongPress={() => {
                  if (!selectMode) {
                    setSelectMode(true);
                    setSelected([index]);
                  } else {
                    toggleSelect(index);
                  }
                }}
              >
                <View
                  style={{
                    flexDirection:'row',
                    alignItems:'center',
                    padding:5,
                    backgroundColor: selectMode && selected.includes(index)
                      ? '#33395d'
                      : item.purchased
                      ? '#444'
                      : 'transparent',
                  }}
                >
                  {selectMode && (
                    <Ionicons
                      style={{marginRight:10}}
                      name={selected.includes(index) ? 'checkbox' : 'square-outline'}
                      size={24}
                      color="#fff"
                    />
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
                      color: item.purchased ? '#777' : '#fff',
                    }}
                  >
                    {item.name} - {item.quantity} {getLabel(item.quantity, item.unit)}
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
        items={selected.map(idx => ({...list[idx], index: idx}))}
        onSave={handleBatchSave}
        onClose={() => setBatchVisible(false)}
      />

      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setConfirmVisible(false)}>
          <View
            style={{
              flex:1,
              justifyContent:'center',
              alignItems:'center',
              backgroundColor:'rgba(0,0,0,0.3)',
            }}
          >
            <TouchableWithoutFeedback>
              <View style={{backgroundColor:'#1f1f1f', padding:20, borderRadius:8}}>
                <Text style={{marginBottom:10}}>
                  ¿Está seguro de eliminar {selected.length} alimentos de la lista de compras?
                </Text>
                <View style={{flexDirection:'row', justifyContent:'space-around'}}>
                  <Button title="Cancelar" onPress={() => setConfirmVisible(false)} />
                  <Button title="Eliminar" onPress={deleteSelected} />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

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
              <View style={{backgroundColor:'#1f1f1f', padding:20, borderRadius:8}}>
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
