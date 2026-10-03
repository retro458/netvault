# NetVault — Inventario de red

App móvil en React Native (Expo SDK 57) para registrar los equipos de una red: servidores, firewalls, switches y estaciones de trabajo, con su IP, MAC, sistema operativo, rol y estado.

## Cómo correrla

Requisitos: Node 20 o superior y la app **Expo Go** (versión para SDK 57) en el teléfono, o un emulador Android.

```bash
npm install
npx expo start
```

Escanear el QR con Expo Go. Credenciales de prueba: **admin / admin123**.

> La web no está soportada: `expo-sqlite` en web es experimental. Usen teléfono o emulador.

Para instalar una librería nueva usen siempre `npx expo install <paquete>` (no `npm install`), así se elige la versión compatible con el SDK 57.

## Estructura

```
App.js                  Providers + navegador raíz
src/
  screens/              Pantallas (Login, Home, Profile, DeviceList, DeviceDetail, DeviceForm)
  components/           DeviceCard, StatusBadge, FormField, EmptyState
  navigation/           RootNavigator (guarda), MainTabs, DevicesStack, linking
  context/              AuthContext, ThemeContext
  services/             db (SQLite), deviceService (CRUD), authStorage, prefsStorage
  theme/                Colores claro/oscuro, espaciados
  constants/            Catálogos de estado y roles
  utils/                Validación de IP y MAC
assets/                 Íconos de la app
```

El acuerdo entre backend y UI está en **[CONTRATO.md](./CONTRATO.md)**.

## Cumplimiento de requisitos

| Requisito | Dónde |
|---|---|
| LoginScreen | `screens/LoginScreen.js` |
| HomeScreen (tablero) | `screens/HomeScreen.js` |
| ProfileScreen | `screens/ProfileScreen.js` |
| DataEntryScreen | `screens/DeviceFormScreen.js` (crear y editar) |
| ListScreen con FlatList | `screens/DeviceListScreen.js` |
| `@react-navigation/native` + `native-stack` | `navigation/` |
| `useState` + `useContext` (extra) | `context/AuthContext.js`, `context/ThemeContext.js` |
| StyleSheet + Flexbox responsivo | `useWindowDimensions` en Home, `maxWidth` en formularios |
| `@expo/vector-icons` | Ionicons en tabs, headers, tarjetas |

**Navegación avanzada (se piden 2, hay 5):**
1. **Anidada:** Stack de dispositivos dentro del Tab "Dispositivos" (`MainTabs.js`, `DevicesStack.js`).
2. **Parámetros:** `DeviceDetail { id }`, `DeviceForm { id? }`, `DeviceList { status? }`.
3. **Headers personalizados:** botón "+" en la lista, editar en el detalle y guardar en el formulario, con título dinámico.
4. **Guarda de ruta:** sin sesión las pantallas protegidas no existen y se redirige al Login (`RootNavigator.js`).
5. **Deep linking:** `netvault://devices/3` (`linking.js`).

**AsyncStorage (se piden 2, hay 3):** token de sesión persistido, preferencia de tema y logout que limpia la sesión (`services/authStorage.js`, `services/prefsStorage.js`).

**SQLite:** `expo-sqlite` con la tabla `devices`, migraciones por `PRAGMA user_version`, CRUD completo en `services/deviceService.js` y la lista leída desde la base local.

## Probar deep links

Con la app abierta en Expo Go (Android):

```bash
adb shell am start -W -a android.intent.action.VIEW -d "exp://<IP-de-tu-PC>:8081/--/devices/1"
```

En una build de desarrollo: `netvault://devices/1`.
