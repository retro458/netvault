/**
 * ProfileScreen — datos del usuario, preferencia de tema y cierre de sesión.
 * Protegida: solo existe con sesión iniciada (ver RootNavigator).
 *
 * TODO UI: diseño final a cargo del equipo de UI.
 */
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { resetDatabase } from '../services/db';
import { radius, spacing } from '../theme/colors';

const THEME_OPTIONS = [
  { key: 'light', label: 'Claro', icon: 'sunny-outline' },
  { key: 'dark', label: 'Oscuro', icon: 'moon-outline' },
  { key: 'system', label: 'Sistema', icon: 'phone-portrait-outline' },
];

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

  const Row = ({ icon, label, value }) => (
    <View style={[styles.row, { borderColor: colors.border }]}>
      <Ionicons name={icon} size={20} color={colors.textMuted} />
      <Text style={[styles.rowLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <View style={styles.avatarBox}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.primaryText }]}>
            {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Row icon="person-outline" label="Usuario" value={user?.username} />
        <Row icon="mail-outline" label="Correo" value={user?.email} />
        <Row icon="shield-checkmark-outline" label="Rol" value={user?.role} />
      </View>

      <Text style={[styles.section, { color: colors.text }]}>Tema</Text>
      <View style={styles.themeRow}>
        {THEME_OPTIONS.map((opt) => {
          const active = themePreference === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => setThemePreference(opt.key)}
              style={[
                styles.themeOption,
                {
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Ionicons name={opt.icon} size={20} color={active ? colors.primaryText : colors.text} />
              <Text style={{ color: active ? colors.primaryText : colors.text }}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={[styles.button, { borderColor: colors.border }]} onPress={confirmReset}>
        <Ionicons name="refresh-outline" size={20} color={colors.text} />
        <Text style={{ color: colors.text, fontWeight: '600' }}>Restablecer datos de ejemplo</Text>
      </Pressable>

      <Pressable style={[styles.button, { borderColor: colors.danger }]} onPress={confirmLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={{ color: colors.danger, fontWeight: '600' }}>Cerrar sesión</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.md, width: '100%', maxWidth: 600, alignSelf: 'center' },
  avatarBox: { alignItems: 'center', gap: spacing.sm, marginVertical: spacing.md },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 32, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '700' },
  card: { borderRadius: radius.md, paddingHorizontal: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { width: 70 },
  rowValue: { flex: 1, textAlign: 'right', fontWeight: '600' },
  section: { fontSize: 16, fontWeight: '700' },
  themeRow: { flexDirection: 'row', gap: spacing.sm },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
});
