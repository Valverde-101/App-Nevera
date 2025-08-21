# App-Nevera

Aplicación de inventario de alimentos escrita en React Native con soporte para web.

## Funcionalidades
- Gestión de inventario por ubicaciones (nevera, congelador, despensa).
- Lista de compras integrada.
- Recetario con ingredientes del inventario.
- Categorías, ubicaciones y unidades personalizadas.
- Creación de alimentos personalizados con iconos propios o predeterminados y días de caducidad por defecto.
- Persistencia local mediante `AsyncStorage` para uso sin conexión.
- Sincronización opcional con Google Drive para respaldar y restaurar datos.
- Inicio de sesión con Google nativo en Android con fallback al flujo web.

## Estructura
- `MiAppNevera/App.js`: punto de entrada que configura la navegación entre las pantallas.
- `MiAppNevera/src/screens`: implementa las pantallas de inicio, categorías (nevera, congelador, despensa) y lista de compras.
- `MiAppNevera/src/context`: hooks de estado con persistencia en `AsyncStorage`.
- `MiAppNevera/assets/foods.json`: estructura de inventario inicial (vacía por defecto).

## Respaldo en Google Drive
1. Conecta tu cuenta desde **Datos de usuario** para obtener acceso a `Google Drive`.
2. Al subir un respaldo se conserva un máximo de 10 revisiones en `appDataFolder`.
3. Al restaurar un respaldo se sobrescribirán los datos locales.
4. IDs de OAuth utilizados (guárdalos para futuras configuraciones):
   - Android: `388689708365-4g4lnv5ilksj12cghfa17flc68c5d5qk.apps.googleusercontent.com`
   - Web: `388689708365-54q3jlb6efa8dm3fkfcrbsk25pb41s27.apps.googleusercontent.com`

## Desarrollo
1. Instalar dependencias
   ```bash
   cd MiAppNevera
   npm install
   ```
2. Ejecutar en web
   ```bash
   npm run web
   ```
3. Ejecutar en Android
   ```bash
   npm run android
   ```
4. Ejecutar en iOS
   ```bash
   npm run ios
   ```
5. Iniciar el bundler de Expo (elige plataforma desde el menú)
   ```bash
   npm start
   ```

## Build con EAS
1. Instala la CLI si es necesario:
   ```bash
   npm install -g eas-cli
   ```
2. Generar un APK de prueba:
   ```bash
   eas build -p android --profile preview
   ```
3. Generar un AAB para Play Store:
   ```bash
   eas build -p android --profile production
   ```

## Compilar versión de producción en Windows

1. Preparar proyecto nativo si usas Expo:
   ```bash
   npx expo prebuild
   ```
2. Asigna una letra de unidad a la carpeta del proyecto para acortar la ruta:
   ```powershell
   subst N: "C:\Users\leoni\OneDrive\Documentos\GitHub\App-Nevera\MiAppNevera"
   ```
3. Ve al directorio `android` usando la nueva ruta:
   ```powershell
   cd N:\android
   ```
4. Limpia y genera el APK de release:
   ```powershell
   .\gradlew clean
   $env:NODE_ENV = "production"
   .\gradlew assembleRelease
   ```

El estado de inventario y lista de compras se guarda localmente usando `AsyncStorage`,
permitiendo uso sin conexión. La misma base de código funciona en Android, iOS y web
mediante `react-native-web` y Expo.
