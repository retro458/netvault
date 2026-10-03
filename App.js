/**
 * NetVault — Inventario de red.
 *
 * Orden de providers:
 *   SafeAreaProvider  -> márgenes seguros (notch, barra de estado)
 *   ThemeProvider     -> tema claro/oscuro (AsyncStorage)
 *   AuthProvider      -> sesión simulada (AsyncStorage)
 *   RootNavigator     -> navegación + guarda de rutas + deep linking
 */
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

/** Barra de estado que cambia de color según el tema. */
function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <ThemedStatusBar />
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
