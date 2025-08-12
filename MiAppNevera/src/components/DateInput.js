import React, { useState } from 'react';
import { TouchableOpacity, Text, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function DateInput({ value, onChange, placeholder = 'YYYY-MM-DD', style }) {
  const [show, setShow] = useState(false);

  const dateValue = value ? new Date(value) : new Date();

  const handleChange = (event, selectedDate) => {
    setShow(false);
    if (event.type === 'set' && selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0];
      onChange(formatted);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={() => setShow(true)} style={[{ borderWidth: 1, padding: 5, marginBottom: 10 }, style]}>
        <Text style={{ color: value ? '#000' : '#888' }}>{value || placeholder}</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display={Platform.OS === 'android' ? 'calendar' : Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleChange}
        />
      )}
    </>
  );
}

