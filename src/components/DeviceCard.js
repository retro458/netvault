/**
 * Fila de un dispositivo para la FlatList.
 * Primera línea: LED + hostname (mono) y la IP al extremo, que es lo que se busca primero.
 * Segunda línea: rol · sistema operativo y el estado escrito.
 * Props: device (Device), onPress () => void
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusLed } from './StatusBadge';
import { useTheme } from '../context/ThemeContext';
import { DEVICE_STATUS } from '../constants/deviceOptions';
import { radius, spacing, withAlpha } from '../theme/colors';
import { fonts, type } from '../theme/typography';

export default function DeviceCard({ device, onPress }) {
  const { colors } = useTheme();
  const statusLabel = DEVICE_STATUS.find((s) => s.key === device.status)?.label ?? device.status;
  const subtitle = [device.role, device.os].filter(Boolean).join(' · ') || 'Sin rol ni sistema';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${device.hostname}, ${statusLabel}, ${device.ip ?? 'sin IP'}`}
      android_ripple={{ color: withAlpha(colors.text, 0.08) }}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed ? colors.surfaceRaised : colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.line}>
        <StatusLed status={device.status} />
        <Text style={[styles.hostname, { color: colors.text }]} numberOfLines={1}>
          {device.hostname}
        </Text>
        <Text style={[type.data, { color: device.ip ? colors.text : colors.textMuted }]} numberOfLines={1}>
          {device.ip ?? 'sin IP'}
        </Text>
      </View>
      <View style={styles.line}>
        <Text style={[type.body, styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
          {subtitle}
        </Text>
        <Text style={[type.caption, { color: colors.textMuted }]}>{statusLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hostname: { flex: 1, fontFamily: fonts.monoBold, fontSize: 15, lineHeight: 20 },
  subtitle: { flex: 1, fontSize: 13, lineHeight: 18 },
});
