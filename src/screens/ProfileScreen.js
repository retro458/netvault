/**
 * ProfileScreen — datos del usuario, preferencia de tema y cierre de sesión.
 * Protegida: solo existe con sesión iniciada (ver RootNavigator).
 */
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import TapeLabel from '../components/TapeLabel';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { resetDatabase } from '../services/db';
import { radius, spacing } from '../theme/colors';
import { fonts, type } from '../theme/typography';

const THEME_OPTIONS = [
  { key: 'light', label: 'Claro', icon: 'sunny-outline' },
  { key: 'dark', label: 'Oscuro', icon: 'moon-outline' },
  { key: 'system', label: 'Sistema', icon: 'phone-portrait-outline' },
];

/** Fila de la ficha de datos. */
function InfoRow({ icon, label, value, first, colors }) {
  return (
    <View style={[styles.row, !first && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
      <Ionicons name={icon} size={20} color={colors.textMuted} />
      <Text style={[type.body, { color: colors.textMuted }]}>{label}</Text>
      <Text selectable style={[type.data, styles.rowValue, { color: colors.text }]} numberOfLines={1}>
        {value ?? '—'}
      </Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { colors, themePreference, setThemePreference } = useTheme();

  const confirmLogout = () =>
    Alert.alert('Cerrar sesión', '¿Seguro que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: signOut },
    ]);

  const confirmReset = () =>
    Alert.alert('Restablecer datos', 'Se borrará el inventario y se cargarán los datos de ejemplo.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Restablecer',
        style: 'destructive',
        onPress: async () => {
          await resetDatabase();
          Alert.alert('Listo', 'Inventario restablecido.');
        },
      },
    ]);

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <View style={styles.identity}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.primaryText }]}>
            {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <View style={styles.identityText}>
          <Text style={[type.headline, { color: colors.text }]} numberOfLines={1}>
            {user?.name}
          </Text>
          {user?.role ? <TapeLabel size="sm">{String(user.role).toUpperCase()}</TapeLabel> : null}
        </View>
      </View>

      <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <InfoRow first icon="person-outline" label="Usuario" value={user?.username} colors={colors} />
        <InfoRow icon="mail-outline" label="Correo" value={user?.email} colors={colors} />
      </View>

      <View style={styles.block}>
        <Text style={[type.label, { color: colors.textMuted }]}>Tema</Text>
        <View style={[styles.segmented, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {THEME_OPTIONS.map((opt) => {
            const active = themePreference === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setThemePreference(opt.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.segment, active && { backgroundColor: colors.primary }]}
              >
                <Ionicons name={opt.icon} size={18} color={active ? colors.primaryText : colors.textMuted} />
                <Text style={[type.label, { color: active ? colors.primaryText : colors.text }]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.actions}>
        <Button title="Restablecer datos de ejemplo" icon="refresh-outline" variant="secondary" onPress={confirmReset} />
        <Button title="Cerrar sesión" icon="log-out-outline" variant="danger" onPress={confirmLogout} />
      </View>

      <Text style={[type.dataSmall, styles.version, { color: colors.textMuted }]}>NetVault 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.lg, width: '100%', maxWidth: 600, alignSelf: 'center' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  identityText: { flex: 1, gap: 8 },
  avatar: { width: 72, height: 72, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.heavy, fontSize: 34, lineHeight: 40 },
  group: { borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: spacing.md },
  rowValue: { flex: 1, textAlign: 'right' },
  block: { gap: spacing.sm },
  segmented: { flexDirection: 'row', padding: 4, gap: 4, borderRadius: radius.lg, borderWidth: 1 },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44,
    borderRadius: radius.md,
  },
  actions: { gap: spacing.sm },
  version: { textAlign: 'center' },
});
