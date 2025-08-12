import React, { useState } from 'react';
import { Platform, TouchableOpacity, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function DatePicker({ date, onChange }) {
  const [show, setShow] = useState(false);

  const handleChange = (event, selectedDate) => {
    setShow(false);
    if (selectedDate) {
      const iso = selectedDate.toISOString().split('T')[0];
      onChange(iso);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <input
        type="date"
        value={date}
        onChange={e => onChange(e.target.value)}
        style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
      />
    );
  }

  return (
    <View>
      <TouchableOpacity
        onPress={() => setShow(true)}
        style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
      >
        <Text>{date || 'YYYY-MM-DD'}</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={date ? new Date(date) : new Date()}
          mode="date"
          display="calendar"
          onChange={handleChange}
        />
      )}
    </View>
  );
}
