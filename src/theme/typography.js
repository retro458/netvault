/**
 * Tipografía de NetVault.
 *   Archivo       -> interfaz y títulos (rótulo industrial, pesos firmes).
 *   Martian Mono  -> solo datos: hostnames, IPs, MACs, contadores.
 *
 * En React Native cada peso es una familia distinta, por eso se exponen por nombre.
 * Las familias se cargan en App.js con useFonts.
 */
import {
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_800ExtraBold,
} from '@expo-google-fonts/archivo';
import { MartianMono_400Regular, MartianMono_500Medium, MartianMono_700Bold } from '@expo-google-fonts/martian-mono';

export const fontAssets = {
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_800ExtraBold,
  MartianMono_400Regular,
  MartianMono_500Medium,
  MartianMono_700Bold,
};

export const fonts = {
  regular: 'Archivo_400Regular',
  medium: 'Archivo_500Medium',
  semibold: 'Archivo_600SemiBold',
  bold: 'Archivo_700Bold',
  heavy: 'Archivo_800ExtraBold',
  mono: 'MartianMono_400Regular',
  monoMedium: 'MartianMono_500Medium',
  monoBold: 'MartianMono_700Bold',
};

/**
 * Escala tipográfica. Cada rol trae familia, tamaño e interlineado; los
 * componentes lo esparcen en el estilo (`...type.title`) y solo agregan color.
 */
export const type = {
  display: { fontFamily: fonts.heavy, fontSize: 34, lineHeight: 38, letterSpacing: -0.6 },
  headline: { fontFamily: fonts.heavy, fontSize: 24, lineHeight: 29, letterSpacing: -0.3 },
  title: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 22, letterSpacing: -0.1 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 21 },
  label: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 17 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  // Datos de red
  data: { fontFamily: fonts.monoMedium, fontSize: 13, lineHeight: 18 },
  dataStrong: { fontFamily: fonts.monoBold, fontSize: 15, lineHeight: 20 },
  dataSmall: { fontFamily: fonts.mono, fontSize: 11, lineHeight: 14 },
  counter: { fontFamily: fonts.monoBold, fontSize: 22, lineHeight: 26, fontVariant: ['tabular-nums'] },
};
