/**
 * Botón de la app (reemplaza al <Button> nativo, que no admite tipografía ni forma).
 * Props: title, onPress, variant ('primary' | 'secondary' | 'danger'), icon (Ionicons),
 *        loading, disabled, style
 */
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, withAlpha } from '../theme/colors';
import { fonts } from '../theme/typography';

export default function Button({ title, onPress, variant = 'primary', icon, loading = false, disabled = false, style }) {
  const { colors } = useTheme();
  const inactive = disabled || loading;

  const palette = {
    primary: { bg: colors.primary, fg: colors.primaryText, border: colors.primary },
    secondary: { bg: colors.surface, fg: colors.text, border: colors.border },
    danger: { bg: 'transparent', fg: colors.danger, border: withAlpha(colors.danger, 0.6) },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      android_ripple={{ color: withAlpha(palette.fg, 0.15) }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: disabled ? 0.45 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={20} color={palette.fg} /> : null}
          <Text style={[styles.text, { color: palette.fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  text: { fontFamily: fonts.bold, fontSize: 15, letterSpacing: 0.1 },
});
