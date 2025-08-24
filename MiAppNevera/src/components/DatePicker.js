import React, { useEffect, useState } from 'react';
import {
  Platform,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLanguage } from '../context/LanguageContext';

export default function DatePicker({ label, value, onChange }) {
  const [show, setShow] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const { t } = useLanguage();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleChange = (event, selectedDate) => {
    if (Platform.OS !== 'web') setShow(false);
    if (selectedDate) {
      const iso = selectedDate.toISOString().split('T')[0];
      onChange(iso);
    }
  };

  const displayValue = value || '';

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {label && <Text style={styles.label}>{label}</Text>}
      {Platform.OS === 'web' ? (
        // Use a native HTML input for web to get the browser date picker UI
        <input
          type="date"
          value={displayValue}
          onChange={e => onChange(e.target.value)}
          style={webInputStyle}
        />
      ) : (
        <>
          <TouchableOpacity onPress={() => setShow(true)}>
            <View pointerEvents="none">
              <TextInput
                style={styles.input}
                value={displayValue}
                placeholder={t('system.datePicker.placeholder')}
                editable={false}
              />
            </View>
          </TouchableOpacity>
          {show && (
            <DateTimePicker
              value={displayValue ? new Date(displayValue) : new Date()}
              mode="date"
              display="default"
              onChange={handleChange}
            />
          )}
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
});

// Plain object styles for the web <input/> element
const webInputStyle = {
  borderWidth: 1,
  borderColor: '#ccc',
  padding: 8,
  borderRadius: 4,
  backgroundColor: '#fff',
  width: '100%',
  boxSizing: 'border-box',
};
