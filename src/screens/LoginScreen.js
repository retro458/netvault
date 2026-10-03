/**
 * LoginScreen — inicio de sesión simulado.
 * Credenciales demo: admin / admin123 (ver services/authStorage.js).
 */
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import FormField from '../components/FormField';
import Logo from '../components/Logo';
import TapeLabel from '../components/TapeLabel';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, withAlpha } from '../theme/colors';
import { type } from '../theme/typography';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { colors } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signIn(username, password);
      // No hace falta navegar: RootNavigator cambia a las pantallas protegidas solo.
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* maxWidth mantiene el formulario legible en tablets */}
          <View style={styles.container}>
            <View style={styles.header}>
              <Logo size={60} />
              <Text style={[type.display, styles.title, { color: colors.text }]}>NetVault</Text>
              <TapeLabel>INVENTARIO DE RED</TapeLabel>
            </View>

            <View style={styles.form}>
              <FormField
                label="Usuario"
                value={username}
                onChangeText={setUsername}
                placeholder="admin"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                mono
              />
              <FormField
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={handleLogin}
                mono
                right={
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.textMuted} />
                  </Pressable>
                }
              />

              {error ? (
                <View
                  accessibilityLiveRegion="polite"
                  style={[styles.error, { backgroundColor: withAlpha(colors.danger, 0.12), borderColor: withAlpha(colors.danger, 0.5) }]}
                >
                  <Ionicons name="alert-circle" size={18} color={colors.danger} />
                  <Text style={[type.body, { color: colors.text, flex: 1 }]}>{error}</Text>
                </View>
              ) : null}

              <Button title="Entrar" icon="log-in-outline" onPress={handleLogin} loading={loading} style={styles.submit} />
            </View>

            <Text style={[type.dataSmall, styles.hint, { color: colors.textMuted }]}>Demo · admin / admin123</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  container: { width: '100%', maxWidth: 420, alignSelf: 'center', gap: spacing.xl },
  header: { alignItems: 'flex-start', gap: spacing.md },
  title: { marginTop: spacing.xs },
  form: { gap: spacing.md },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  submit: { marginTop: spacing.xs },
  hint: { textAlign: 'center' },
});
