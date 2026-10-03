/**
 * LoginScreen — inicio de sesión simulado.
 * Credenciales demo: admin / admin123 (ver services/authStorage.js).
 *
 * TODO UI: diseño final a cargo del equipo de UI.
 */
import { useState } from 'react';
import {
  ActivityIndicator,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/colors';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { colors } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
              <Ionicons name="git-network-outline" size={64} color={colors.primary} />
              <Text style={[styles.title, { color: colors.text }]}>NetVault</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>Inventario de red</Text>
            </View>

            <FormField
              label="Usuario"
              value={username}
              onChangeText={setUsername}
              placeholder="admin"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <FormField
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••"
              secureTextEntry
              onSubmitEditing={handleLogin}
            />

            {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Button title="Iniciar sesión" color={colors.primary} onPress={handleLogin} />
            )}

            <Text style={[styles.hint, { color: colors.textMuted }]}>Demo: admin / admin123</Text>
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
  container: { width: '100%', maxWidth: 420, alignSelf: 'center', gap: spacing.md },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  title: { fontSize: 32, fontWeight: '800', marginTop: spacing.sm },
  subtitle: { fontSize: 15 },
  error: { textAlign: 'center' },
  hint: { textAlign: 'center', fontSize: 12, marginTop: spacing.sm },
});
