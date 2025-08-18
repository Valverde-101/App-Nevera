# App-Nevera

Aplicación de inventario de alimentos escrita en React Native con soporte para web.

## Funcionalidades
- Gestión de inventario por ubicaciones (nevera, congelador, despensa).
- Lista de compras integrada.
- Recetario con ingredientes del inventario.
- Categorías, ubicaciones y unidades personalizadas.
- Creación de alimentos personalizados con iconos propios o predeterminados y días de caducidad por defecto.
- Persistencia local mediante `AsyncStorage` para uso sin conexión.

## Estructura
- `MiAppNevera/App.js`: punto de entrada que configura la navegación entre las pantallas.
- `MiAppNevera/src/screens`: implementa las pantallas de inicio, categorías (nevera, congelador, despensa) y lista de compras.
- `MiAppNevera/src/context`: hooks de estado con persistencia en `AsyncStorage`.
- `MiAppNevera/assets/foods.json`: estructura de inventario inicial (vacía por defecto).

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

El estado de inventario y lista de compras se guarda localmente usando `AsyncStorage`,
permitiendo uso sin conexión. La misma base de código funciona en Android, iOS y web
mediante `react-native-web` y Expo.

### Sincronización con Google Drive

Para habilitar la subida automática de respaldos a Google Drive, define una variable de
entorno con tu ID de cliente OAuth de Google antes de ejecutar la app:

```bash
export EXPO_PUBLIC_GOOGLE_CLIENT_ID=tu_client_id
npm start
```

Cada usuario iniciará sesión con su propia cuenta de Google; el ID de cliente solo
identifica a la aplicación frente a Google.
