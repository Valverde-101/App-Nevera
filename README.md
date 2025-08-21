# App-Nevera

Aplicación de inventario de alimentos escrita en React Native con soporte para web.

## Funcionalidades
- Gestión de inventario por ubicaciones (nevera, congelador, despensa).
- Lista de compras integrada.
- Recetario con imágenes, dificultad, número de personas y pasos, usando ingredientes del inventario.
- Categorías, ubicaciones y unidades personalizadas.
- Creación de alimentos personalizados con iconos propios o predeterminados y días de caducidad por defecto.
- Añadir varios alimentos al inventario de una sola vez.
- Tema claro/oscuro con persistencia.
- Respaldo e importación de datos (ZIP) y sincronización con Google Drive mediante inicio de sesión con Google.
- Persistencia local mediante `AsyncStorage` para uso sin conexión.

## Estructura
- `MiAppNevera/App.js`: punto de entrada que configura la navegación entre las pantallas.
- `MiAppNevera/src/screens`: implementa las pantallas de inicio, categorías (nevera, congelador, despensa) y lista de compras.
- `MiAppNevera/src/context`: hooks de estado con persistencia en `AsyncStorage`.
- `MiAppNevera/assets/foods.json`: estructura de inventario inicial (vacía por defecto).

## Datos importantes
- Los ID de cliente de Google para la sincronización en Drive están definidos en `MiAppNevera/src/screens/UserDataScreen.js`.
- El `projectId` de EAS se encuentra en `MiAppNevera/app.json` (`29bdbb1e-a7ff-4f47-a1c8-178ab45939ff`).
- Los respaldos se almacenan en Google Drive como `RefriMudanza_<fecha>.zip` y se conservan las 10 últimas revisiones.

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

## Builds con EAS

Requiere `eas-cli` y una cuenta de Expo.

### APK (distribución interna)
```bash
eas build -p android --profile preview
```

### AAB (Play Store)
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
