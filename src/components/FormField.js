/**
 * Campo de formulario: etiqueta + TextInput + mensaje de error opcional.
 * Props: label, error, mono (usa tipografía de datos para IP/MAC/hostname),
 *        right (elemento al final del campo, p. ej. ojo de contraseña),
 *        style (se aplica al TextInput) y cualquier prop de TextInput.
 */
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, withAlpha } from '../theme/colors';
import { fonts, type } from '../theme/typography';

export default function FormField({ label, error, mono = false, right, style, onFocus, onBlur, ...inputProps }) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error ? colors.danger : focused ? colors.accent : colors.border;

  return (
    <View style={styles.container}>
      <Text style={[type.label, { color: colors.textMuted }]}>{label}</Text>
      <View style={[styles.field, { backgroundColor: colors.surface, borderColor }]}>
        <TextInput
          placeholderTextColor={withAlpha(colors.textMuted, 0.75)}
          selectionColor={withAlpha(colors.primary, 0.45)}
          cursorColor={colors.accent}
          accessibilityLabel={label}
          style={[
            styles.input,
            { color: colors.text, fontFamily: mono ? fonts.monoMedium : fonts.regular, fontSize: mono ? 14 : 15 },
            style,
          ]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...inputProps}
        />
        {right}
      </View>
      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={colors.danger} />
          <Text style={[type.caption, { color: colors.danger, flex: 1 }]}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  // Borde de 1.5 siempre (solo cambia el color) para que enfocar no mueva el layout.
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  input: { flex: 1, minHeight: 50, paddingVertical: 12 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
