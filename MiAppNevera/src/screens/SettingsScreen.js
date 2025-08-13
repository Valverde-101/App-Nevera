import React, { useLayoutEffect, useState } from 'react';
import {
  View,
  Button,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
} from 'react-native';

export default function SettingsScreen({ navigation }) {
  const [menuVisible, setMenuVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Text
            style={{
              fontSize: 24,
              paddingHorizontal: 6,
              backgroundColor: '#eee',
              borderRadius: 4,
            }}
          >
            ⋮
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 10 }}>
      <Button title="Tipos de unidad" onPress={() => navigation.navigate('UnitSettings')} />
      <Button title="Gestión de ubicación" onPress={() => navigation.navigate('LocationSettings')} />

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  position: 'absolute',
                  top: 40,
                  right: 10,
                  backgroundColor: '#fff',
                  padding: 10,
                  borderRadius: 8,
                }}
              >
                <Button
                  title="Datos de usuario"
                  onPress={() => {
                    setMenuVisible(false);
                    navigation.navigate('UserData');
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
