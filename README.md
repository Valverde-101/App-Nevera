# App Nevera

Migración de la aplicación web de inventario de alimentos a React Native con soporte para web mediante Expo.

## Estructura

- `App.js`: Navegación principal con pestañas para Nevera, Congelador, Despensa y Compras.
- `src/screens/FoodScreen.js`: Pantalla reutilizable para cada categoría de alimentos.
- `src/screens/ShoppingScreen.js`: Gestión de la lista de compras.
- `assets/`: Iconos y recursos de la aplicación.

Los datos se persisten offline usando `AsyncStorage`.

## Scripts

```bash
npm install   # instala dependencias
npm start     # inicia el servidor de desarrollo
npm run web   # ejecuta la versión web
npm run android # compila para Android
npm run ios     # compila para iOS
```

## Notas

- Reemplaza los iconos en `assets/` por los definitivos de tu proyecto.
- Puedes ajustar los estilos y la navegación según tus necesidades.
