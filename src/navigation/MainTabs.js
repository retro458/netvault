/**
 * Tabs principales (solo visibles con sesión iniciada).
 * El tab "Dispositivos" contiene su propio Stack -> navegación anidada.
 *
 * Barra inferior estilo Material 3: el tab activo lleva una píldora amarilla detrás del ícono.
 * Inicio dibuja su propio encabezado (marca + saludo), por eso su header nativo va oculto.
 */
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DevicesStack from './DevicesStack';
import { useTheme } from '../context/ThemeContext';
import { fonts } from '../theme/typography';

const Tab = createBottomTabNavigator();

// Ícono de cada tab: [inactivo, activo]
const TAB_ICONS = {
  HomeTab: ['grid-outline', 'grid'],
  DevicesTab: ['server-outline', 'server'],
  ProfileTab: ['person-circle-outline', 'person-circle'],
};

export default function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <View style={[styles.pill, focused && { backgroundColor: colors.primary }]}>
            <Ionicons
              name={TAB_ICONS[route.name][focused ? 1 : 0]}
              size={22}
              color={focused ? colors.primaryText : colors.textMuted}
            />
          </View>
        ),
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11 },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.bold, fontSize: 17, color: colors.text },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Inicio', headerShown: false }} />
      <Tab.Screen
        name="DevicesTab"
        component={DevicesStack}
        // El Stack interno ya tiene header propio; se oculta el del Tab.
        options={{ title: 'Dispositivos', headerShown: false }}
        listeners={({ navigation }) => ({
          // Al tocar el tab estando dentro de un detalle, regresa a la lista.
          tabPress: () => navigation.navigate('DevicesTab', { screen: 'DeviceList' }),
        })}
      />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  pill: { width: 56, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});
