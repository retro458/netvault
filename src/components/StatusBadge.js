/**
 * Etiqueta de color con el estado del dispositivo.
 * Props: status ('online' | 'offline' | 'maintenance' | 'unknown')
 */
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { DEVICE_STATUS } from '../constants/deviceOptions';

export default function StatusBadge({ status }) {
  const { colors } = useTheme();
  const info = DEVICE_STATUS.find((s) => s.key === status) ?? DEVICE_STATUS[3];
  const color = colors.status[info.key];

  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Ionicons name={info.icon} size={14} color={color} />
      <Text style={[styles.text, { color }]}>{info.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: { fontSize: 12, fontWeight: '600' },
});
