/**
 * NetVault — Inventario de red.
 *
 * Orden de providers:
 *   SafeAreaProvider  -> márgenes seguros (notch, barra de estado)
 *   ThemeProvider     -> tema claro/oscuro (AsyncStorage)
 *   AuthProvider      -> sesión simulada (AsyncStorage)
 *   FontGate          -> espera a las tipografías (Archivo + Martian Mono)
 *   RootNavigator     -> navegación + guarda de rutas + deep linking
 */
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { fontAssets } from './src/theme/typography';

/** Barra de estado que cambia de color según el tema. */
function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

/**
 * No muestra la app hasta que las fuentes estén listas, para que ningún texto
 * parpadee con la fuente del sistema. Si la carga falla, sigue con la del sistema.
 */
function FontGate({ children }) {
  const { colors } = useTheme();
  const [loaded, error] = useFonts(fontAssets);

  if (!loaded && !error) return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  return children;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <ThemedStatusBar />
          <FontGate>
            <RootNavigator />
          </FontGate>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
