import React from 'react';
import { View, Button, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as Updates from 'expo-updates';
import JSZip from 'jszip';
import { useInventory } from '../context/InventoryContext';
import { useUnits } from '../context/UnitsContext';
import { useLocations } from '../context/LocationsContext';
import { useShopping } from '../context/ShoppingContext';
import { useRecipes } from '../context/RecipeContext';
import { useCustomFoods } from '../context/CustomFoodsContext';

export default function UserDataScreen() {
  const { resetInventory } = useInventory();
  const { resetUnits } = useUnits();
  const { resetLocations } = useLocations();
  const { resetShopping } = useShopping();
  const { resetRecipes } = useRecipes();
  const { resetCustomFoods } = useCustomFoods();

  const exportData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const entries = await AsyncStorage.multiGet(keys);
      const data = {};
      entries.forEach(([k, v]) => {
        try {
          data[k] = JSON.parse(v);
        } catch {
          data[k] = v;
        }
      });

      const zip = new JSZip();
      const iconFolder = zip.folder('icons');
      const imageFolder = zip.folder('images');
      const exportedIcons = new Set();
      const exportedImages = new Set();

      const readAsBase64 = async uri => {
        if (!uri) return null;
        if (uri.startsWith('data:')) {
          return uri.split(',')[1];
        }
        try {
          if (Platform.OS === 'web') {
            const response = await fetch(uri);
            const blob = await response.blob();
            return await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result.split(',')[1]);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          }
          if (uri.startsWith('http')) {
            const filename = uri.split('/').pop();
            const dest = FileSystem.cacheDirectory + filename;
            await FileSystem.downloadAsync(uri, dest);
            const base64 = await FileSystem.readAsStringAsync(dest, {
              encoding: FileSystem.EncodingType.Base64,
            });
            await FileSystem.deleteAsync(dest).catch(() => {});
            return base64;
          }
          return await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } catch (e) {
          console.warn('readAsBase64 failed', e);
          return null;
        }
      };

      const addIcon = async uri => {
        if (!uri) return null;
        try {
          const filename = uri.split('/').pop();
          if (!exportedIcons.has(filename)) {
            const base64 = await readAsBase64(uri);
            if (base64) iconFolder.file(filename, base64, { base64: true });
            exportedIcons.add(filename);
          }
          return `icons/${filename}`;
        } catch (e) {
          console.warn('Icon export failed', e);
          return null;
        }
      };

      const addImage = async uri => {
        if (!uri) return null;
        try {
          const filename = uri.split('/').pop();
          if (!exportedImages.has(filename)) {
            const base64 = await readAsBase64(uri);
            if (base64) imageFolder.file(filename, base64, { base64: true });
            exportedImages.add(filename);
          }
          return `images/${filename}`;
        } catch (e) {
          console.warn('Image export failed', e);
          return null;
        }
      };

      if (Array.isArray(data.customCategories)) {
        for (const cat of data.customCategories) {
          if (typeof cat.icon === 'string') {
            const path = await addIcon(cat.icon);
            if (path) cat.icon = path;
          } else {
            delete cat.icon;
          }
        }
      }
      if (Array.isArray(data.customFoods)) {
        for (const food of data.customFoods) {
          if (typeof food.icon === 'string') {
            const path = await addIcon(food.icon);
            if (path) food.icon = path;
          } else {
            delete food.icon;
          }
        }
      }

      if (data.inventory && typeof data.inventory === 'object') {
        for (const loc of Object.keys(data.inventory)) {
          data.inventory[loc].forEach(item => {
            delete item.icon;
          });
        }
      }

      if (Array.isArray(data.shopping)) {
        for (const item of data.shopping) {
          delete item.icon;
        }
      }

      if (Array.isArray(data.recipes)) {
        for (const rec of data.recipes) {
          if (typeof rec.image === 'string') {
            const imgPath = await addImage(rec.image);
            if (imgPath) rec.image = imgPath;
          } else {
            delete rec.image;
          }
          if (Array.isArray(rec.ingredients)) {
            for (const ing of rec.ingredients) {
              const iconUri = ing.icon?.uri || ing.icon;
              if (typeof iconUri === 'string') {
                const iconPath = await addIcon(iconUri);
                if (iconPath) {
                  ing.icon = { uri: iconPath };
                } else {
                  delete ing.icon;
                }
              } else {
                delete ing.icon;
              }
            }
          }
        }
      }

      zip.file('data.json', JSON.stringify(data));
      const zipBase64 = await zip.generateAsync({ type: 'base64' });
      const zipName = 'RefriMudanza.zip';

      if (Platform.OS === 'web') {
        const url = `data:application/zip;base64,${zipBase64}`;
        const link = document.createElement('a');
        link.href = url;
        link.download = zipName;
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const fileUri = FileSystem.documentDirectory + zipName;
        await FileSystem.writeAsStringAsync(fileUri, zipBase64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/zip',
            dialogTitle: 'Exportar datos',
            UTI: 'public.zip-archive',
          });
        } else {
          Alert.alert('Error', 'No se puede compartir el archivo en este dispositivo.');
        }
      }

      Alert.alert('Éxito', 'Datos exportados correctamente.');
    } catch (e) {
      console.error('Failed to export data', e);
      Alert.alert('Error', 'No se pudieron exportar los datos.');
    }
  };

  const confirmExport = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Deseas exportar todos los datos de usuario?')) {
        exportData();
      }
    } else {
      Alert.alert(
        'Confirmar',
        '¿Deseas exportar todos los datos de usuario?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Exportar', onPress: exportData },
        ],
      );
    }
  };

  const importData = async () => {
    try {
      let zipBase64;
      if (Platform.OS === 'web') {
        const file = await new Promise(resolve => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.zip';
          input.style.display = 'none';
          input.onchange = () => {
            const selected = input.files?.[0] || null;
            if (selected) {
              alert('Archivo seleccionado. Importando...');
            }
            document.body.removeChild(input);
            resolve(selected);
          };
          document.body.appendChild(input);
          input.click();
        });
        if (!file) return;
        zipBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } else {
        const result = await DocumentPicker.getDocumentAsync({
          type: [
            'application/zip',
            'application/x-zip-compressed',
            'application/octet-stream',
            '*/*',
          ],
        });
        const canceled = result.canceled || result.type === 'cancel';
        if (canceled) return;
        let fileUri = result.assets?.[0]?.uri || result.uri;
        if (!fileUri) return;
        if (fileUri.startsWith('content://')) {
          const dest = FileSystem.cacheDirectory + 'import.zip';
          await FileSystem.copyAsync({ from: fileUri, to: dest });
          fileUri = dest;
        }
        zipBase64 = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }
      const zip = await JSZip.loadAsync(zipBase64, { base64: true });
      const dataStr = await zip.file('data.json').async('string');
      const data = JSON.parse(dataStr);

      const iconMap = {};
      const imageMap = {};

      if (Platform.OS === 'web') {
        const iconFiles = Object.keys(zip.files).filter(name => name.startsWith('icons/'));
        for (const name of iconFiles) {
          const base64 = await zip.file(name).async('base64');
          const ext = name.split('.').pop().toLowerCase();
          const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
          iconMap[name] = `data:${mime};base64,${base64}`;
        }

        const imageFiles = Object.keys(zip.files).filter(name => name.startsWith('images/'));
        for (const name of imageFiles) {
          const base64 = await zip.file(name).async('base64');
          const ext = name.split('.').pop().toLowerCase();
          const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
          imageMap[name] = `data:${mime};base64,${base64}`;
        }
      } else {
        const iconsDir = FileSystem.documentDirectory + 'icons/';
        await FileSystem.makeDirectoryAsync(iconsDir, { intermediates: true }).catch(() => {});
        const iconFiles = Object.keys(zip.files).filter(name => name.startsWith('icons/'));
        for (const name of iconFiles) {
          const base64 = await zip.file(name).async('base64');
          const filename = name.replace('icons/', '');
          const dest = iconsDir + filename;
          await FileSystem.writeAsStringAsync(dest, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
          iconMap[name] = dest;
        }

        const imagesDir = FileSystem.documentDirectory + 'images/';
        await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true }).catch(() => {});
        const imageFiles = Object.keys(zip.files).filter(name => name.startsWith('images/'));
        for (const name of imageFiles) {
          const base64 = await zip.file(name).async('base64');
          const filename = name.replace('images/', '');
          const dest = imagesDir + filename;
          await FileSystem.writeAsStringAsync(dest, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
          imageMap[name] = dest;
        }
      }

      if (Array.isArray(data.customCategories)) {
        for (const cat of data.customCategories) {
          if (cat.icon && iconMap[cat.icon]) cat.icon = iconMap[cat.icon];
        }
      }
      if (Array.isArray(data.customFoods)) {
        for (const food of data.customFoods) {
          if (food.icon && iconMap[food.icon]) food.icon = iconMap[food.icon];
        }
      }

      if (Array.isArray(data.recipes)) {
        for (const rec of data.recipes) {
          if (rec.image && imageMap[rec.image]) {
            rec.image = imageMap[rec.image];
          }
          if (Array.isArray(rec.ingredients)) {
            for (const ing of rec.ingredients) {
              const key = ing.icon?.uri || ing.icon;
              if (key && iconMap[key]) {
                ing.icon = { uri: iconMap[key] };
              }
            }
          }
        }
      }

      await AsyncStorage.clear();
      await AsyncStorage.multiSet(
        Object.entries(data).map(([k, v]) => [k, JSON.stringify(v)]),
      );

      if (Platform.OS === 'web') {
        alert('Datos importados correctamente. La aplicación se recargará.');
        window.location.reload();
      } else {
        Alert.alert('Éxito', 'Datos importados correctamente.', [
          { text: 'OK', onPress: () => Updates.reloadAsync() },
        ]);
      }
    } catch (e) {
      console.error('Failed to import data', e);
      Alert.alert('Error', 'No se pudieron importar los datos.');
    }
  };

  const resetAll = async () => {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error('Failed to clear storage', e);
    }
    resetCustomFoods();
    resetUnits();
    resetLocations();
    resetInventory();
    resetShopping();
    resetRecipes();
  };

  const confirmReset = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Esto eliminará todos los datos de usuario. ¿Deseas continuar?')) {
        resetAll();
      }
    } else {
      Alert.alert(
        'Confirmar',
        'Esto eliminará todos los datos de usuario. ¿Deseas continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: resetAll },
        ],
      );
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Button title="Exportar datos" onPress={confirmExport} />
      <View style={{ height: 10 }} />
      <Button title="Importar datos" onPress={importData} />
      <View style={{ height: 10 }} />
      <Button title="Eliminar todos los datos de usuario" onPress={confirmReset} />
    </View>
  );
}
