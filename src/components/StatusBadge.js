/**
 * Estado del dispositivo como el LED de un puerto de switch.
 *
 * StatusLed:   solo el punto (en línea / caído / mantenimiento = relleno, desconocido = anillo).
 * StatusBadge: LED + etiqueta de texto, para que el estado nunca dependa solo del color.
 */
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { DEVICE_STATUS } from '../constants/deviceOptions';
import { withAlpha } from '../theme/colors';
import { type } from '../theme/typography';

function statusInfo(status) {
  return DEVICE_STATUS.find((s) => s.key === status) ?? DEVICE_STATUS[3];
}

export function StatusLed({ status, size = 10 }) {
  const { colors } = useTheme();
  const color = colors.status[statusInfo(status).key];
  const hollow = statusInfo(status).key === 'unknown';

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: hollow ? 'transparent' : color,
        borderWidth: hollow ? 2 : 0,
        borderColor: color,
      }}
    />
  );
}

export default function StatusBadge({ status }) {
  const { colors } = useTheme();
  const info = statusInfo(status);
  const color = colors.status[info.key];

  return (
    <View
      accessible
      accessibilityLabel={`Estado: ${info.label}`}
      style={[styles.badge, { backgroundColor: withAlpha(color, 0.14), borderColor: withAlpha(color, 0.45) }]}
    >
      <StatusLed status={info.key} size={9} />
      <Text style={[type.caption, { color: colors.text }]}>{info.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 7,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
