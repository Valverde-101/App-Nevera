
// UserDataScreen.js – dark–premium v2.2.12
import React, { useState, useLayoutEffect, useMemo, useEffect } from 'react';
import {
  View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback,
  StyleSheet, Platform, ScrollView, Alert
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
import { useTheme, useThemeController } from '../context/ThemeContext';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { uploadBackupToGoogleDrive, downloadBackupFromGoogleDrive } from '../utils/googleDrive';
import * as Updates from 'expo-updates';

WebBrowser.maybeCompleteAuthSession();

export default function UserDataScreen() {
  const palette = useTheme();
  const { themeName } = useThemeController();
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

  const [exportConfirm, setExportConfirm] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [uploadConfirm, setUploadConfirm] = useState(false);
  const [googleToken, setGoogleToken] = useState(null);
  const [googleUser, setGoogleUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '388689708365-54q3jlb6efa8dm3fkfcrbsk25pb41s27.apps.googleusercontent.com',
    scopes: ['https://www.googleapis.com/auth/drive.appdata', 'profile', 'email'],
    redirectUri: Platform.select({ web: window.location.origin, default: undefined }),
  });

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('googleAuth');
        if (stored) {
          const { token, user } = JSON.parse(stored);
          setGoogleToken(token);
          setGoogleUser(user);
        }
      } catch (e) {
        console.error('Failed to load google auth', e);
      }
    })();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const token = response.authentication.accessToken;
      setGoogleToken(token);
      (async () => {
        try {
          const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const user = await userRes.json();
          setGoogleUser(user);
          await AsyncStorage.setItem('googleAuth', JSON.stringify({ token, user }));
        } catch (e) {
          console.error('Failed to fetch user info', e);
        }
      })();
    }
  }, [response]);

  const handleDisconnect = async () => {
    setGoogleToken(null);
    setGoogleUser(null);
    await AsyncStorage.removeItem('googleAuth');
  };

  const handleUpload = async () => {
    if (uploading) return;
    setUploading(true);
    try {
      await uploadBackupToGoogleDrive(googleToken);
      if (Platform.OS === 'web') {
        alert('Respaldo subido a Google Drive.');
      } else {
        Alert.alert('Éxito', 'Respaldo subido a Google Drive.');
      }
    } catch (e) {
      console.error('Upload to Drive failed', e);
      if (Platform.OS === 'web') {
        alert('No se pudo subir el respaldo.');
      } else {
        Alert.alert('Error', 'No se pudo subir el respaldo.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await downloadBackupFromGoogleDrive(googleToken);
    } catch (e) {
      console.error('Download from Drive failed', e);
      if (Platform.OS === 'web') {
        alert('No se pudo restaurar el respaldo.');
      } else {
        Alert.alert('Error', 'No se pudo restaurar el respaldo.');
      }
    } finally {
      setDownloading(false);
    }
  };

  const resetAll = async () => {
    try {
      const currentTheme = themeName;
      await AsyncStorage.clear();
      await AsyncStorage.setItem('themeName', currentTheme);
    } catch (e) {
      console.error('Failed to clear storage', e);
    }
    resetCustomFoods(); resetUnits(); resetLocations(); resetInventory(); resetShopping(); resetRecipes();
    setResetConfirm(false);
    if (Platform.OS === 'web') {
      sessionStorage.setItem('reset_notice', '1');
      window.location.reload();
    } else {
      Alert.alert('Reinicio', 'La aplicación se reiniciará', [
        { text: 'OK', onPress: () => Updates.reloadAsync() },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={Platform.OS === 'web'}>
        <View style={styles.card}>
          <Text style={styles.title}>Sincronización</Text>
          <Text style={styles.subtitle}>Conecta tu cuenta de Google para guardar un respaldo en la nube.</Text>
          {googleToken ? (
            <>
              <Text style={styles.connectedText}>
                Conectado como {googleUser?.email || 'usuario'}
              </Text>
              <TouchableOpacity
                style={[styles.primaryBtn, uploading && { opacity: 0.5 }]}
                disabled={uploading}
                onPress={() => setUploadConfirm(true)}
              >
                <Text style={styles.primaryBtnText}>Subir respaldo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.btn,
                  { marginTop: 10 },
                  (uploading || downloading) && { opacity: 0.5 },
                ]}
                disabled={uploading || downloading}
                onPress={handleDownload}
              >
                <Text style={styles.btnText}>Restaurar respaldo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { marginTop: 10 }]} onPress={handleDisconnect}>
                <Text style={styles.btnText}>Desconectar cuenta</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.btn} disabled={!request} onPress={() => promptAsync()}>
              <Text style={styles.btnText}>Conectar con Google</Text>
            </TouchableOpacity>
          )}
        </View>

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

        <View style={[styles.card, { borderColor: '#4a1e1e' }]}>
          <Text style={styles.title}>Eliminar todo</Text>
          <Text style={styles.subtitle}>Esto borrará permanentemente todos los datos de usuario.</Text>
          <TouchableOpacity style={styles.dangerBtn} onPress={() => setResetConfirm(true)}>
            <Text style={styles.dangerBtnText}>Eliminar todos los datos</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={uploadConfirm} transparent animationType="fade" onRequestClose={() => setUploadConfirm(false)}>
        <TouchableWithoutFeedback onPress={() => setUploadConfirm(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Subir respaldo</Text>
                <Text style={styles.modalBody}>
                  Se subirá un respaldo con todos sus datos y configuraciones actuales,
                  sobrescribiendo anteriores respaldos. ¿Deseas continuar?
                </Text>
                <View style={styles.modalRow}>
                  <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={() => setUploadConfirm(false)}>
                    <Text style={styles.btnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <View style={{ width: 12 }} />
                  <TouchableOpacity
                    style={[styles.primaryBtn, { flex: 1 }, uploading && { opacity: 0.5 }]}
                    disabled={uploading}
                    onPress={() => { setUploadConfirm(false); handleUpload(); }}
                  >
                    <Text style={styles.primaryBtnText}>Aceptar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

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
  connectedText: { color: palette.textDim, marginBottom: 10 },
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

