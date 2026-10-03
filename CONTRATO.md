# Contrato backend ↔ UI

Este documento es lo único que necesitan para trabajar en las pantallas sin tocar la capa de datos.

**Regla de oro:** las pantallas y componentes **nunca** importan `expo-sqlite` ni `AsyncStorage`. Todo pasa por `src/services/` o por los hooks `useAuth()` y `useTheme()`.

Las pantallas que ya están en `src/screens/` funcionan de punta a punta. Son la base: cámbienles el diseño todo lo que quieran, pero mantengan las llamadas a servicios, los nombres de rutas y los parámetros.

---

## 1. El objeto `Device`

```js
{
  id: 3,                         // number, lo asigna SQLite
  hostname: 'DC01',              // string, obligatorio, único (sin importar mayúsculas)
  ip: '10.10.10.10',             // string | null, IPv4
  mac: 'AA:BB:CC:DD:EE:FF',      // string | null, se normaliza a este formato
  os: 'Windows Server 2022',     // string | null
  role: 'Controlador de dominio',// string | null, texto libre
  location: 'VirtualBox',        // string | null
  status: 'online',              // 'online' | 'offline' | 'maintenance' | 'unknown'
  source: 'manual',              // 'manual' | 'agent' (solo lectura)
  lastSeen: null,                // string | null (solo lectura, lo llenarán los agentes)
  notes: 'AD DS + DNS',          // string | null
  createdAt: '2026-10-03 19:00:00', // UTC, solo lectura
  updatedAt: '2026-10-03 19:00:00', // UTC, solo lectura
}
```

Los catálogos para formularios y etiquetas están en `src/constants/deviceOptions.js`: `DEVICE_STATUS` (key, label, icon), `DEVICE_ROLES` y `getStatusLabel(key)`.

---

## 2. `deviceService` (SQLite)

```js
import * as deviceService from '../services/deviceService';
```

| Función | Devuelve | Notas |
|---|---|---|
| `getAll({ search?, status? })` | `Promise<Device[]>` | Ordenado por hostname. `search` busca en hostname, IP, rol y SO. |
| `getById(id)` | `Promise<Device \| null>` | `null` si no existe. |
| `getStats()` | `Promise<{ total, online, offline, maintenance, unknown }>` | Para el tablero de Home. |
| `create(data)` | `Promise<Device>` | Devuelve el dispositivo con su `id`. |
| `update(id, data)` | `Promise<Device>` | Mandar **todos** los campos del formulario. |
| `updateStatus(id, status)` | `Promise<Device>` | Cambio rápido de estado. |
| `remove(id)` | `Promise<boolean>` | `false` si ya no existía. |

**Errores:** `create`, `update` y `updateStatus` lanzan `Error` con un mensaje en español listo para mostrar:

```js
try {
  await deviceService.create(form);
} catch (e) {
  Alert.alert('No se pudo guardar', e.message); // "Ya existe un dispositivo con ese hostname."
}
```

Validaciones que ya hace el servicio: hostname obligatorio (máx. 63 caracteres), IPv4 válida, MAC válida y estado válido. Los textos vacíos se guardan como `null`. Si quieren mostrar errores **mientras** el usuario escribe, usen `isValidIPv4` e `isValidMac` de `src/utils/validators.js`.

**Recargar datos:** usen `useFocusEffect` para volver a leer cuando la pantalla gana foco (por ejemplo, al regresar del formulario). Ver `DeviceListScreen.js`.

---

## 3. Sesión: `useAuth()`

```js
const { user, isLoggedIn, isLoading, signIn, signOut } = useAuth();
```

| Valor | Tipo | Notas |
|---|---|---|
| `user` | `{ username, name, email, role } \| null` | |
| `isLoggedIn` | `boolean` | |
| `signIn(username, password)` | `Promise<void>` | Lanza `Error` con el mensaje si falla. Demo: **admin / admin123** |
| `signOut()` | `Promise<void>` | Limpia la sesión de AsyncStorage. |

**No naveguen después de `signIn` o `signOut`.** El navegador raíz cambia solo entre el Login y la app (esa es la guarda de rutas).

---

## 4. Tema: `useTheme()`

```js
const { colors, isDark, themePreference, setThemePreference } = useTheme();
```

- `colors`: tokens de `src/theme/colors.js` (`background`, `surface`, `text`, `textMuted`, `border`, `primary`, `primaryText`, `danger` y `status.online|offline|maintenance|unknown`).
- `setThemePreference('light' | 'dark' | 'system')`: se guarda en AsyncStorage.

**Usen siempre `colors.*` en vez de colores escritos a mano**, o el modo oscuro se rompe. También hay `spacing` y `radius` en el mismo archivo.

---

## 5. Rutas y parámetros

```
Login                              (solo sin sesión)
Main (Tabs)                        (solo con sesión)
├── HomeTab        HomeScreen
├── DevicesTab     (Stack anidado)
│   ├── DeviceList     { status?: string }
│   ├── DeviceDetail   { id: number }
│   └── DeviceForm     { id?: number }    sin id = crear, con id = editar
└── ProfileTab     ProfileScreen
```

Navegar a una pantalla del Stack desde otro Tab:

```js
navigation.navigate('DevicesTab', { screen: 'DeviceDetail', params: { id: 3 } });
```

**Deep links:** `netvault://devices`, `netvault://devices/3`, `netvault://devices/new`, `netvault://profile`.

---

## 6. Dónde va cada cosa

| Carpeta | Quién | Contenido |
|---|---|---|
| `src/screens/` | UI | Pantallas |
| `src/components/` | UI | Componentes reutilizables |
| `src/theme/` | UI | Colores, espaciados |
| `assets/` | UI | Íconos, imágenes |
| `src/services/` | Backend | SQLite, AsyncStorage |
| `src/context/` | Backend | AuthContext, ThemeContext |
| `src/navigation/` | Backend | Navegadores, guarda, deep linking |
| `src/utils/`, `src/constants/` | Compartido | Validaciones, catálogos |

Si necesitan un dato o una función que no existe (por ejemplo, ordenar por fecha), pídanla y la agregamos al servicio. No escriban SQL en las pantallas.
