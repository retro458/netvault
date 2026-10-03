/**
 * Mensaje cuando una lista no tiene datos.
 * Props: icon (nombre de Ionicons), title, subtitle
 */
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/colors';
import { type } from '../theme/typography';

export default function EmptyState({ icon = 'file-tray-outline', title, subtitle }) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name={icon} size={30} color={colors.textMuted} />
      </View>
      <Text style={[type.title, styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle ? <Text style={[type.body, styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 56, paddingHorizontal: spacing.lg, gap: spacing.sm },
  iconBox: {
    width: 68,
    height: 68,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center', maxWidth: 280 },
});
