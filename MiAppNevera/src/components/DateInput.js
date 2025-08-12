import React, { useState } from 'react';
import { Platform, Text, TextInput, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function DateInput({ date, onChange }) {
  const [show, setShow] = useState(false);
  const displayDate = date || 'YYYY-MM-DD';

  if (Platform.OS === 'web') {
    return (
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
        value={date}
        type="date"
        onChange={e => onChange(e.target.value)}
      />
    );
  }

  return (
    <>
      <TouchableOpacity
        style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
        onPress={() => setShow(true)}
      >
        <Text>{displayDate}</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={date ? new Date(date) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          onChange={(event, selectedDate) => {
            setShow(false);
            if (selectedDate) {
              onChange(selectedDate.toISOString().split('T')[0]);
            }
          }}
        />
      )}
    </>
  );
}
