/**
 * Mensaje cuando una lista no tiene datos.
 * Props: icon (nombre de Ionicons), title, subtitle
 */
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function EmptyState({ icon = 'file-tray-outline', title, subtitle }) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={colors.textMuted} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  title: { fontSize: 16, fontWeight: '700' },
  subtitle: { fontSize: 14, textAlign: 'center' },
});
