/**
 * prefsStorage — preferencias del usuario en AsyncStorage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storageKeys';

const THEMES = ['light', 'dark', 'system'];

/** @returns {Promise<'light' | 'dark' | 'system'>} 'system' si nunca se eligió. */
export async function getTheme() {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
  return THEMES.includes(value) ? value : 'system';
}

/** @param {'light' | 'dark' | 'system'} theme */
export async function setTheme(theme) {
  if (!THEMES.includes(theme)) throw new Error(`Tema inválido: ${theme}`);
  await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
}
