/**
 * Tabs principales (solo visibles con sesión iniciada).
 * El tab "Dispositivos" contiene su propio Stack -> navegación anidada.
 */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DevicesStack from './DevicesStack';
import { useTheme } from '../context/ThemeContext';

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
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={TAB_ICONS[route.name][focused ? 1 : 0]} size={size} color={color} />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Inicio' }} />
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
