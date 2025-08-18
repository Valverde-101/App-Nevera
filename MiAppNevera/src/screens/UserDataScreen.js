
// UserDataScreen.js – dark–premium v2.2.12
import React, { useState, useLayoutEffect, useMemo } from 'react';
import {
  View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback,
  StyleSheet, Platform, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useInventory } from '../context/InventoryContext';
import { useUnits } from '../context/UnitsContext';
import { useLocations } from '../context/LocationsContext';
import { useShopping } from '../context/ShoppingContext';
import { useRecipes } from '../context/RecipeContext';
import { useCustomFoods } from '../context/CustomFoodsContext';
import { exportBackup, importBackup } from '../utils/backup';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function UserDataScreen() {
  const palette = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions?.({
      headerStyle: { backgroundColor: palette.surface },
      headerTintColor: palette.text,
      headerTitleStyle: { color: palette.text },
      headerShadowVisible: false,
    });
  }, [navigation, palette]);

  const { resetInventory } = useInventory();
  const { resetUnits } = useUnits();
  const { resetLocations } = useLocations();
  const { resetShopping } = useShopping();
  const { resetRecipes } = useRecipes();
  const { resetCustomFoods } = useCustomFoods();
  const { user, signInWithGoogle, signOut } = useAuth();

  const [exportConfirm, setExportConfirm] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const resetAll = async () => {
    try { await AsyncStorage.clear(); } catch (e) { console.error('Failed to clear storage', e); }
    resetCustomFoods(); resetUnits(); resetLocations(); resetInventory(); resetShopping(); resetRecipes();
    setResetConfirm(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={Platform.OS === 'web'}>
        <View style={styles.card}>
          <Text style={styles.title}>Respaldo y datos</Text>
          <Text style={styles.subtitle}>Exporta o importa todos tus datos.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setExportConfirm(true)}>
            <Text style={styles.primaryBtnText}>Exportar datos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { marginTop: 10 }]} onPress={importBackup}>
            <Text style={styles.btnText}>Importar datos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Sincronización con Google</Text>
          {user ? (
            <>
              <Text style={styles.subtitle}>Conectado como {user.email}</Text>
              <TouchableOpacity style={styles.btn} onPress={signOut}>
                <Text style={styles.btnText}>Desconectar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.subtitle}>Conecta tu cuenta de Google para guardar tus datos en la nube.</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={signInWithGoogle}>
                <Text style={styles.primaryBtnText}>Conectar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={[styles.card, { borderColor: '#4a1e1e' }]}>
          <Text style={styles.title}>Eliminar todo</Text>
          <Text style={styles.subtitle}>Esto borrará permanentemente todos los datos de usuario.</Text>
          <TouchableOpacity style={styles.dangerBtn} onPress={() => setResetConfirm(true)}>
            <Text style={styles.dangerBtnText}>Eliminar todos los datos</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={exportConfirm} transparent animationType="fade" onRequestClose={() => setExportConfirm(false)}>
        <TouchableWithoutFeedback onPress={() => setExportConfirm(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Exportar datos</Text>
                <Text style={styles.modalBody}>¿Deseas exportar todos los datos de usuario?</Text>
                <View style={styles.modalRow}>
                  <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={() => setExportConfirm(false)}>
                    <Text style={styles.btnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <View style={{ width: 12 }} />
                  <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]}
                    onPress={() => { setExportConfirm(false); exportBackup(); }}>
                    <Text style={styles.primaryBtnText}>Exportar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal visible={resetConfirm} transparent animationType="fade" onRequestClose={() => setResetConfirm(false)}>
        <TouchableWithoutFeedback onPress={() => setResetConfirm(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Eliminar todos los datos</Text>
                <Text style={styles.modalBody}>Esta acción es permanente. ¿Deseas continuar?</Text>
                <View style={styles.modalRow}>
                  <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={() => setResetConfirm(false)}>
                    <Text style={styles.btnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <View style={{ width: 12 }} />
                  <TouchableOpacity style={[styles.dangerBtn, { flex: 1 }]} onPress={resetAll}>
                    <Text style={styles.dangerBtnText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const createStyles = (palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  scroll: {
    ...(Platform.OS === 'web' ? {
      scrollbarWidth: 'thin',
      scrollbarColor: `${palette.accent} ${palette.surface2}`,
      scrollbarGutter: 'stable both-edges',
      overscrollBehavior: 'contain',
    } : {}),
  },
  card: { backgroundColor: palette.surface2, borderRadius: 12, borderWidth: 1, borderColor: palette.border, padding: 14, marginBottom: 14 },
  title: { color: palette.text, fontWeight: '700', fontSize: 16, marginBottom: 6 },
  subtitle: { color: palette.textDim, marginBottom: 12 },
  btn: { backgroundColor: palette.surface3, borderColor: palette.border, borderWidth: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  btnText: { color: palette.text },
  primaryBtn: { backgroundColor: palette.accent, borderColor: '#e2b06c', borderWidth: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  primaryBtnText: { color: '#1b1d22', fontWeight: '700' },
  dangerBtn: { backgroundColor: palette.danger, borderColor: '#ad2c2c', borderWidth: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  dangerBtnText: { color: '#fff', fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  modalCard: { backgroundColor: palette.surface, borderRadius: 12, borderWidth: 1, borderColor: palette.border, padding: 16, width: '100%', maxWidth: 420 },
  modalTitle: { color: palette.text, fontWeight: '700', fontSize: 16, marginBottom: 8 },
  modalBody: { color: palette.textDim, marginBottom: 12 },
  modalRow: { flexDirection: 'row' },
});

