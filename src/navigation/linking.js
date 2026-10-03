/**
 * Deep linking básico.
 *
 * Ejemplos (con la app instalada / Expo Go):
 *   netvault://devices          -> lista de dispositivos
 *   netvault://devices/3        -> detalle del dispositivo con id 3
 *   netvault://devices/new      -> formulario de nuevo dispositivo
 *   netvault://profile          -> perfil
 *
 * Probar en Expo Go (Android):
 *   npx uri-scheme open "exp://<IP>:8081/--/devices/1" --android
 * o en desarrollo:  adb shell am start -W -a android.intent.action.VIEW -d "netvault://devices/1"
 *
 * Si no hay sesión, el enlace termina en el Login (la guarda de rutas manda).
 */
import * as Linking from 'expo-linking';

export const linking = {
  prefixes: [Linking.createURL('/'), 'netvault://'],
  config: {
    screens: {
      Login: 'login',
      Main: {
        screens: {
          HomeTab: 'home',
          DevicesTab: {
            // Al abrir un detalle por enlace, la lista queda debajo para poder regresar.
            initialRouteName: 'DeviceList',
            screens: {
              DeviceList: 'devices',
              DeviceForm: 'devices/new',
              DeviceDetail: {
                path: 'devices/:id',
                parse: { id: Number },
              },
            },
          },
          ProfileTab: 'profile',
        },
      },
    },
  },
};
