/**
 * Marca de NetVault: la boca de un puerto RJ45 (cavidad, pestaña y 8 contactos),
 * dibujada con Views para que escale y respete el tema sin depender de imágenes.
 * Props: size (px del lado)
 */
import { View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const PINS = 8;

export default function Logo({ size = 48 }) {
  const { colors } = useTheme();

  const cavityW = size * 0.64;
  const cavityH = size * 0.5;
  const cavityLeft = (size - cavityW) / 2;
  const cavityTop = size * 0.22;

  const pinW = size * 0.045;
  const pinH = size * 0.15;
  const pinsSpan = cavityW * 0.8;
  const pinGap = (pinsSpan - PINS * pinW) / (PINS - 1);
  const pinsLeft = cavityLeft + (cavityW - pinsSpan) / 2;
  const pinsTop = cavityTop + cavityH - pinH - size * 0.04;

  const notchW = size * 0.22;
  const notchH = size * 0.14;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="NetVault"
      style={{ width: size, height: size, borderRadius: size * 0.24, backgroundColor: colors.primary }}
    >
      {/* Cavidad del puerto */}
      <View
        style={{
          position: 'absolute',
          left: cavityLeft,
          top: cavityTop,
          width: cavityW,
          height: cavityH,
          borderRadius: size * 0.05,
          backgroundColor: colors.primaryText,
        }}
      />
      {/* Pestaña de retención */}
      <View
        style={{
          position: 'absolute',
          left: (size - notchW) / 2,
          top: cavityTop - notchH * 0.45,
          width: notchW,
          height: notchH,
          borderTopLeftRadius: size * 0.04,
          borderTopRightRadius: size * 0.04,
          backgroundColor: colors.primaryText,
        }}
      />
      {/* Contactos */}
      {Array.from({ length: PINS }, (_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: pinsLeft + i * (pinW + pinGap),
            top: pinsTop,
            width: pinW,
            height: pinH,
            borderRadius: pinW / 2,
            backgroundColor: colors.primary,
          }}
        />
      ))}
    </View>
  );
}
