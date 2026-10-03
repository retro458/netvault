/**
 * Claves usadas en AsyncStorage, centralizadas para no escribirlas a mano.
 * El prefijo evita choques con otras librerías que también usen AsyncStorage.
 */
export const STORAGE_KEYS = {
  // Sesión (se borran al cerrar sesión)
  TOKEN: '@netvault/session_token',
  USER: '@netvault/session_user',
  // Preferencias (sobreviven al logout)
  THEME: '@netvault/pref_theme',
};

export const SESSION_KEYS = [STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER];
