/**
 * authStorage — sesión simulada persistida en AsyncStorage.
 *
 * No hay servidor: el "login" compara contra un usuario de demostración
 * y genera un token aleatorio. En la fase con API, solo cambia `login()`.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, SESSION_KEYS } from './storageKeys';

// Usuario de demostración (credenciales para la presentación).
const DEMO_USER = {
  username: 'admin',
  password: 'admin123',
  profile: {
    username: 'admin',
    name: 'Administrador de red',
    email: 'admin@netvault.lab',
    role: 'Administrador',
  },
};

/** Genera un token falso con apariencia realista. */
function generateToken() {
  const random = Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `nv_${random}`;
}

/**
 * Inicia sesión. Lanza Error con mensaje en español si las credenciales fallan.
 * @returns {Promise<{ token: string, user: User }>}
 */
export async function login(username, password) {
  // Simula la latencia de red para que la UI pueda mostrar un loader.
  await new Promise((resolve) => setTimeout(resolve, 600));

  const u = String(username ?? '').trim().toLowerCase();
  if (!u || !password) throw new Error('Ingresa usuario y contraseña.');
  if (u !== DEMO_USER.username || password !== DEMO_USER.password) {
    throw new Error('Usuario o contraseña incorrectos.');
  }

  const session = { token: generateToken(), user: DEMO_USER.profile };
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.TOKEN, session.token],
    [STORAGE_KEYS.USER, JSON.stringify(session.user)],
  ]);
  return session;
}

/**
 * Lee la sesión guardada (se usa al abrir la app).
 * @returns {Promise<{ token: string, user: User } | null>} null si no hay sesión.
 */
export async function getSession() {
  const [[, token], [, userJson]] = await AsyncStorage.multiGet(SESSION_KEYS);
  if (!token || !userJson) return null;
  try {
    return { token, user: JSON.parse(userJson) };
  } catch {
    // Datos corruptos: se limpian para no quedar en un estado inválido.
    await logout();
    return null;
  }
}

/**
 * Cierra sesión: elimina token y usuario de AsyncStorage.
 * Las preferencias (tema) se conservan a propósito.
 */
export async function logout() {
  await AsyncStorage.multiRemove(SESSION_KEYS);
}

/**
 * Borra TODO lo que la app guardó en AsyncStorage (sesión + preferencias).
 * Para un botón "Restablecer app".
 */
export async function clearAllStorage() {
  const keys = await AsyncStorage.getAllKeys();
  const ours = keys.filter((k) => k.startsWith('@netvault/'));
  await AsyncStorage.multiRemove(ours);
}
