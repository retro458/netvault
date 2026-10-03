/**
 * Stack de dispositivos (anidado dentro del Tab "Dispositivos").
 *
 * Rutas y parámetros:
 *   DeviceList                      sin parámetros
 *   DeviceDetail  { id: number }    detalle de un dispositivo
 *   DeviceForm    { id?: number }   sin id = crear, con id = editar
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DeviceListScreen from '../screens/DeviceListScreen';
import DeviceDetailScreen from '../screens/DeviceDetailScreen';
import DeviceFormScreen from '../screens/DeviceFormScreen';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

export default function DevicesStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="DeviceList" component={DeviceListScreen} options={{ title: 'Dispositivos' }} />
      <Stack.Screen name="DeviceDetail" component={DeviceDetailScreen} options={{ title: 'Detalle' }} />
      <Stack.Screen
        name="DeviceForm"
        component={DeviceFormScreen}
        // El título real (Nuevo / Editar) lo pone la pantalla según el parámetro `id`.
        options={{ title: 'Dispositivo', presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
