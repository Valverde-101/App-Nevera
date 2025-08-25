
// UserDataScreen.js – dark–premium v2.2.12
import React, { useState, useLayoutEffect, useMemo, useEffect } from 'react';
import {
  View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback,
  StyleSheet, Platform, ScrollView, Alert, NativeModules
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
import { useLanguage } from '../context/LanguageContext';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { uploadBackupToGoogleDrive, downloadBackupFromGoogleDrive } from '../utils/googleDrive';
import * as Updates from 'expo-updates';

const isWeb = Platform.OS === 'web';
let GoogleSignin;
if (!isWeb && NativeModules?.RNGoogleSignin) {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
} else if (isWeb) {
  WebBrowser.maybeCompleteAuthSession();
}

export default function UserDataScreen() {
  const palette = useTheme();
  const { themeName } = useThemeController();
  const { t, lang } = useLanguage();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions?.({
      title: t('system.navigation.userData'),
      headerStyle: { backgroundColor: palette.surface },
      headerTintColor: palette.text,
      headerTitleStyle: { color: palette.text },
      headerShadowVisible: false,
    });
  }, [navigation, palette, t, lang]);

  const { resetInventory } = useInventory();
  const { resetUnits } = useUnits();
  const { resetLocations } = useLocations();
  const { resetShopping } = useShopping();
  const { resetRecipes } = useRecipes();
  const { resetCustomFoods } = useCustomFoods();

  const [exportConfirm, setExportConfirm] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [uploadConfirm, setUploadConfirm] = useState(false);
  const [downloadConfirm, setDownloadConfirm] = useState(false);
  const [googleToken, setGoogleToken] = useState(null);
  const [googleUser, setGoogleUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      androidClientId: '388689708365-4g4lnv5ilksj12cghfa17flc68c5d5qk.apps.googleusercontent.com',
      webClientId: '388689708365-54q3jlb6efa8dm3fkfcrbsk25pb41s27.apps.googleusercontent.com',
      scopes: ['https://www.googleapis.com/auth/drive.appdata', 'profile', 'email'],
      ...(isWeb && typeof window !== 'undefined'
        ? { redirectUri: window.location.origin }
        : {}),
    },
    { useProxy: !isWeb }
  );

  useEffect(() => {
    if (GoogleSignin?.configure) {
      GoogleSignin.configure({
        scopes: ['https://www.googleapis.com/auth/drive.appdata', 'profile', 'email'],
        webClientId: '388689708365-54q3jlb6efa8dm3fkfcrbsk25pb41s27.apps.googleusercontent.com',
        androidClientId: '388689708365-4g4lnv5ilksj12cghfa17flc68c5d5qk.apps.googleusercontent.com',
      });
    }
  }, []);

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
  const handleAuthResponse = async (token) => {
    setGoogleToken(token);
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
  };

  useEffect(() => {
    if (isWeb && response?.type === 'success') {
      handleAuthResponse(response.authentication.accessToken);
    }
  }, [response, isWeb]);

  const signInNative = async () => {
    if (GoogleSignin?.hasPlayServices) {
      try {
        await GoogleSignin.hasPlayServices();
        await GoogleSignin.signIn();
        const { accessToken } = await GoogleSignin.getTokens();
        if (accessToken) {
          await handleAuthResponse(accessToken);
          return;
        }
      } catch (e) {
        console.error('Google sign-in failed, falling back to web flow', e);
      }
    }
    const res = await promptAsync();
    if (res?.type === 'success') {
      await handleAuthResponse(res.authentication.accessToken);
    } else {
      Alert.alert(t('system.userData.error'), t('system.userData.googleSignInError'));
    }
  };

  const handleDisconnect = async () => {
    setGoogleToken(null);
    setGoogleUser(null);
    await AsyncStorage.removeItem('googleAuth');
    if (GoogleSignin?.signOut) {
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        console.error('Google sign-out failed', e);
      }
    }
  };

  const handleUpload = async () => {
    if (uploading) return;
    setUploading(true);
    try {
      await uploadBackupToGoogleDrive(googleToken);
      if (Platform.OS === 'web') {
        alert(t('system.userData.uploadSuccess'));
      } else {
        Alert.alert(t('system.userData.success'), t('system.userData.uploadSuccess'));
      }
    } catch (e) {
      console.error('Upload to Drive failed', e);
      if (Platform.OS === 'web') {
        alert(t('system.userData.uploadError'));
      } else {
        Alert.alert(t('system.userData.error'), t('system.userData.uploadError'));
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
        alert(t('system.userData.downloadError'));
      } else {
        Alert.alert(t('system.userData.error'), t('system.userData.downloadError'));
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
      Alert.alert(
        t('system.userData.resetTitle'),
        t('system.userData.resetMessage'),
        [{ text: t('system.userData.ok'), onPress: () => Updates.reloadAsync() }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={Platform.OS === 'web'}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('system.userData.syncTitle')}</Text>
          <Text style={styles.subtitle}>{t('system.userData.syncSubtitle')}</Text>
          {googleToken ? (
            <>
              <Text style={styles.connectedText}>
                {t('system.userData.connectedAs', { email: googleUser?.email || t('system.userData.user') })}
              </Text>
              <TouchableOpacity
                style={[styles.primaryBtn, uploading && { opacity: 0.5 }]}
                disabled={uploading}
                onPress={() => setUploadConfirm(true)}
              >
                <Text style={styles.primaryBtnText}>{t('system.userData.uploadBackup')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.btn,
                  { marginTop: 10 },
                  (uploading || downloading) && { opacity: 0.5 },
                ]}
                disabled={uploading || downloading}
                onPress={() => setDownloadConfirm(true)}
              >
                <Text style={styles.btnText}>{t('system.userData.restoreBackup')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { marginTop: 10 }]} onPress={handleDisconnect}>
                <Text style={styles.btnText}>{t('system.userData.disconnect')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.btn}
              disabled={isWeb && !request}
              onPress={isWeb ? () => promptAsync() : signInNative}
            >
              <Text style={styles.btnText}>{t('system.userData.connectGoogle')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{t('system.userData.backupTitle')}</Text>
          <Text style={styles.subtitle}>{t('system.userData.backupSubtitle')}</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setExportConfirm(true)}>
            <Text style={styles.primaryBtnText}>{t('system.userData.exportData')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { marginTop: 10 }]} onPress={importBackup}>
            <Text style={styles.btnText}>{t('system.userData.importData')}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { borderColor: '#4a1e1e' }]}>
          <Text style={styles.title}>{t('system.userData.deleteTitle')}</Text>
          <Text style={styles.subtitle}>{t('system.userData.deleteSubtitle')}</Text>
          <TouchableOpacity style={styles.dangerBtn} onPress={() => setResetConfirm(true)}>
            <Text style={styles.dangerBtnText}>{t('system.userData.deleteData')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={uploadConfirm} transparent animationType="fade" onRequestClose={() => setUploadConfirm(false)}>
        <TouchableWithoutFeedback onPress={() => setUploadConfirm(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>{t('system.userData.uploadConfirmTitle')}</Text>
                <Text style={styles.modalBody}>{t('system.userData.uploadConfirmBody')}</Text>
                <View style={styles.modalRow}>
                  <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={() => setUploadConfirm(false)}>
                    <Text style={styles.btnText}>{t('system.userData.cancel')}</Text>
                  </TouchableOpacity>
                  <View style={{ width: 12 }} />
                  <TouchableOpacity
                    style={[styles.primaryBtn, { flex: 1 }, uploading && { opacity: 0.5 }]}
                    disabled={uploading}
                    onPress={() => { setUploadConfirm(false); handleUpload(); }}
                  >
                    <Text style={styles.primaryBtnText}>{t('system.userData.accept')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal visible={downloadConfirm} transparent animationType="fade" onRequestClose={() => setDownloadConfirm(false)}>
        <TouchableWithoutFeedback onPress={() => setDownloadConfirm(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>{t('system.userData.downloadConfirmTitle')}</Text>
                <Text style={styles.modalBody}>{t('system.userData.downloadConfirmBody')}</Text>
                <View style={styles.modalRow}>
                  <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={() => setDownloadConfirm(false)}>
                    <Text style={styles.btnText}>{t('system.userData.cancel')}</Text>
                  </TouchableOpacity>
                  <View style={{ width: 12 }} />
                  <TouchableOpacity
                    style={[styles.primaryBtn, { flex: 1 }, downloading && { opacity: 0.5 }]}
                    disabled={downloading}
                    onPress={() => { setDownloadConfirm(false); handleDownload(); }}
                  >
                    <Text style={styles.primaryBtnText}>{t('system.userData.accept')}</Text>
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
                <Text style={styles.modalTitle}>{t('system.userData.exportConfirmTitle')}</Text>
                <Text style={styles.modalBody}>{t('system.userData.exportConfirmBody')}</Text>
                <View style={styles.modalRow}>
                  <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={() => setExportConfirm(false)}>
                    <Text style={styles.btnText}>{t('system.userData.cancel')}</Text>
                  </TouchableOpacity>
                  <View style={{ width: 12 }} />
                  <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]}
                    onPress={() => { setExportConfirm(false); exportBackup(); }}>
                    <Text style={styles.primaryBtnText}>{t('system.userData.exportData')}</Text>
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
                <Text style={styles.modalTitle}>{t('system.userData.resetConfirmTitle')}</Text>
                <Text style={styles.modalBody}>{t('system.userData.resetConfirmBody')}</Text>
                <View style={styles.modalRow}>
                  <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={() => setResetConfirm(false)}>
                    <Text style={styles.btnText}>{t('system.userData.cancel')}</Text>
                  </TouchableOpacity>
                  <View style={{ width: 12 }} />
                  <TouchableOpacity style={[styles.dangerBtn, { flex: 1 }]} onPress={resetAll}>
                    <Text style={styles.dangerBtnText}>{t('system.userData.delete')}</Text>
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

