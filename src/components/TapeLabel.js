/**
 * Etiqueta de rotuladora: cinta amarilla con tinta negra en mono.
 * Es como se rotula un equipo en el rack, y es el sello visual de la app.
 * Props: children (texto), size ('sm' | 'md' | 'lg'), style
 */
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { fonts } from '../theme/typography';

const SIZES = {
  sm: { fontSize: 11, paddingH: 8, paddingV: 3, letterSpacing: 0.8 },
  md: { fontSize: 13, paddingH: 10, paddingV: 5, letterSpacing: 0.8 },
  lg: { fontSize: 22, paddingH: 14, paddingV: 8, letterSpacing: 0.4 },
};

export default function TapeLabel({ children, size = 'md', style }) {
  const { colors } = useTheme();
  const s = SIZES[size];

  return (
    <View
      style={[
        styles.tape,
        { backgroundColor: colors.primary, paddingHorizontal: s.paddingH, paddingVertical: s.paddingV },
        style,
      ]}
    >
      <Text
        numberOfLines={1}
        style={{
          fontFamily: fonts.monoBold,
          fontSize: s.fontSize,
          letterSpacing: s.letterSpacing,
          color: colors.primaryText,
        }}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Radio chico: la cinta real se corta recta.
  tape: { alignSelf: 'flex-start', borderRadius: 3 },
});
