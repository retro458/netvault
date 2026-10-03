/**
 * ThemeContext — tema claro/oscuro persistido en AsyncStorage.
 *
 * Uso en cualquier pantalla/componente:
 *   const { colors, isDark, themePreference, setThemePreference } = useTheme();
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import * as prefsStorage from '../services/prefsStorage';
import { darkColors, lightColors } from '../theme/colors';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [themePreference, setPreference] = useState('system');
  const [loaded, setLoaded] = useState(false);

  // Carga la preferencia guardada al iniciar.
  useEffect(() => {
    prefsStorage
      .getTheme()
      .then(setPreference)
      .finally(() => setLoaded(true));
  }, []);

  /** Cambia el tema y lo guarda. @param {'light'|'dark'|'system'} value */
  const setThemePreference = async (value) => {
    setPreference(value);
    await prefsStorage.setTheme(value);
  };

  const isDark = themePreference === 'system' ? systemScheme === 'dark' : themePreference === 'dark';

  const value = useMemo(
    () => ({
      colors: isDark ? darkColors : lightColors,
      isDark,
      themePreference,
      setThemePreference,
      loaded,
    }),
    [isDark, themePreference, loaded]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return ctx;
}
