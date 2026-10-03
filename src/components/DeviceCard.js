/**
 * Tarjeta de un dispositivo para la FlatList.
 * Props: device (Device), onPress () => void
 *
 * TODO UI: diseño final a cargo del equipo de UI.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from './StatusBadge';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/colors';

export default function DeviceCard({ device, onPress }) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: colors.background }]}>
        <Ionicons name="server-outline" size={22} color={colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.hostname, { color: colors.text }]} numberOfLines={1}>
          {device.hostname}
        </Text>
        <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>
          {device.ip ?? 'Sin IP'} · {device.role ?? 'Sin rol'}
        </Text>
        <StatusBadge status={device.status} />
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 4 },
  hostname: { fontSize: 16, fontWeight: '700' },
  meta: { fontSize: 13 },
});
