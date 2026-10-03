/**
 * HomeScreen — tablero principal con el resumen de la red.
 *
 * TODO UI: diseño final a cargo del equipo de UI.
 */
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as deviceService from '../services/deviceService';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { DEVICE_STATUS } from '../constants/deviceOptions';
import { radius, spacing } from '../theme/colors';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // 2 columnas en teléfono, 4 en tablet / horizontal.
  const columns = width >= 700 ? 4 : 2;

  const loadStats = useCallback(async () => {
    setStats(await deviceService.getStats());
  }, []);

  // Se recarga cada vez que la pantalla gana foco (al volver de agregar/editar).
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  // Navegación a una pantalla del Stack anidado dentro del Tab "Dispositivos".
  const goToList = (status) =>
    navigation.navigate('DevicesTab', { screen: 'DeviceList', params: { status } });

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={[styles.greeting, { color: colors.text }]}>Hola, {user?.name ?? 'usuario'}</Text>
      <Text style={[styles.sub, { color: colors.textMuted }]}>
        {stats ? `${stats.total} dispositivos registrados` : 'Cargando…'}
      </Text>

      <View style={styles.grid}>
        {DEVICE_STATUS.map((s) => (
          <Pressable
            key={s.key}
            onPress={() => goToList(s.key)}
            style={[
              styles.statCard,
              { width: `${100 / columns - 3}%`, backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name={s.icon} size={24} color={colors.status[s.key]} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{stats?.[s.key] ?? '–'}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{s.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.section, { color: colors.text }]}>Acciones rápidas</Text>
      <Pressable
        style={[styles.action, { backgroundColor: colors.primary }]}
        // initial: false -> la lista queda debajo, así "atrás" desde el formulario regresa a ella.
        onPress={() => navigation.navigate('DevicesTab', { screen: 'DeviceForm', initial: false })}
      >
        <Ionicons name="add-circle-outline" size={22} color={colors.primaryText} />
        <Text style={[styles.actionText, { color: colors.primaryText }]}>Registrar dispositivo</Text>
      </Pressable>
      <Pressable
        style={[styles.action, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
        onPress={() => goToList(undefined)}
      >
        <Ionicons name="list-outline" size={22} color={colors.text} />
        <Text style={[styles.actionText, { color: colors.text }]}>Ver inventario completo</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.md },
  greeting: { fontSize: 24, fontWeight: '800' },
  sub: { fontSize: 14, marginTop: -spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md },
  statCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
  },
  statNumber: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 13 },
  section: { fontSize: 18, fontWeight: '700', marginTop: spacing.sm },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  actionText: { fontSize: 15, fontWeight: '600' },
});
