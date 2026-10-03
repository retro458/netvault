/**
 * Navegador raíz + GUARDA DE RUTAS.
 *
 * Patrón oficial de React Navigation para autenticación: las pantallas protegidas
 * solo EXISTEN cuando hay sesión. Sin sesión es imposible llegar a Home, Perfil
 * o Dispositivos (ni con navigate() ni con un deep link): se redirige al Login.
 * Al cerrar sesión, las pantallas protegidas se desmontan y vuelve el Login solo.
 */
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LoginScreen from '../screens/LoginScreen';
import MainTabs from './MainTabs';
import { linking } from './linking';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isLoggedIn, isLoading } = useAuth();
  const { colors, isDark, loaded } = useTheme();

  // Mientras se lee AsyncStorage no sabemos si hay sesión: mostramos un loader
  // para evitar que el Login "parpadee" antes de entrar al Home.
  if (isLoading || !loaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // Tema de React Navigation alineado con nuestros colores.
  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <NavigationContainer theme={navTheme} linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ animationTypeForReplace: 'pop' }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
