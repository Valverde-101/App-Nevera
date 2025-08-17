// AddCategoryModal.js – dark–premium v2.2.13
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Platform, TouchableWithoutFeedback } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { palette } from '../theme';

export default function AddCategoryModal({ visible, onClose, onSave }) {
  const [name, setName] = useState('');
  const [iconUri, setIconUri] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setIconUri(result.assets[0].uri);
    }
  };

  const save = () => {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    onSave({ name: trimmed, icon: iconUri });
    setName('');
    setIconUri(null);
    onClose && onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <Text style={styles.title}>Nueva categoría</Text>
              <Text style={styles.help}>Opcionalmente, agrega un icono personalizado.</Text>

              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Frutas"
                placeholderTextColor={palette.textDim}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Icono</Text>
              {iconUri ? (
                <Image source={{ uri: iconUri }} style={styles.preview} />
              ) : (
                <View style={[styles.preview, { alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={{ color: palette.textDim, fontSize: 12 }}>Sin icono</Text>
                </View>
              )}

              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <TouchableOpacity onPress={pickImage} style={[styles.btn, styles.btnNeutral, { flex: 1 }]}>
                  <Text style={styles.btnNeutralText}>Cargar imagen</Text>
                </TouchableOpacity>
                {iconUri && (
                  <TouchableOpacity onPress={() => setIconUri(null)} style={[styles.btn, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.btnText}>Quitar</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={{ height: 12 }} />

              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={onClose} style={[styles.btn, { flex: 1 }]}>
                  <Text style={styles.btnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={save} style={[styles.btn, styles.btnPrimary, { flex: 1, marginLeft: 10 }]}>
                  <Text style={styles.btnPrimaryText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    width: '100%',
    maxWidth: 420,
  },
  title: { color: palette.text, fontWeight: '700', fontSize: 16 },
  help: { color: palette.textDim, marginTop: 4, marginBottom: 12 },
  label: { color: palette.text, marginBottom: 6, marginTop: 10, fontWeight: '700' },
  input: {
    backgroundColor: palette.surface2,
    color: palette.text,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'web' ? 10 : 8,
  },
  preview: {
    width: 72, height: 72, borderRadius: 12,
    borderWidth: 1, borderColor: palette.border,
    backgroundColor: palette.surface2,
  },
  btn: {
    backgroundColor: palette.surface3,
    borderWidth: 1, borderColor: palette.border,
    paddingVertical: 10, borderRadius: 10, alignItems: 'center',
  },
  btnText: { color: palette.text },
  btnNeutral: { backgroundColor: palette.surface3 },
  btnNeutralText: { color: palette.text },
  btnPrimary: { backgroundColor: palette.accent, borderColor: '#e2b06c' },
  btnPrimaryText: { color: '#1b1d22', fontWeight: '700' },
});