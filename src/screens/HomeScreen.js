/**
 * HomeScreen — tablero principal con el resumen de la red.
 *
 * De arriba abajo: marca + saludo, el estado de la red dicho en una frase,
 * el mapa de puertos (un puerto por equipo), el desglose por estado (cada fila
 * abre la lista ya filtrada) y las acciones rápidas.
 */
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as deviceService from '../services/deviceService';
import Button from '../components/Button';
import Logo from '../components/Logo';
import PortMap from '../components/PortMap';
import { StatusLed } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { DEVICE_STATUS } from '../constants/deviceOptions';
import { radius, spacing, withAlpha } from '../theme/colors';
import { type } from '../theme/typography';

/** Resume el estado general de la red en una frase y el estado dominante (para el LED). */
function summarize(stats, devices) {
  if (!stats) return { headline: 'Leyendo la red…', detail: '', led: 'unknown' };
  if (stats.total === 0) {
    return { headline: 'Aún no hay equipos', detail: 'Registra el primero para empezar el inventario.', led: 'unknown' };
  }
  if (stats.offline > 0) {
    const names = devices.filter((d) => d.status === 'offline').map((d) => d.hostname);
    return {
      headline: stats.offline === 1 ? '1 equipo caído' : `${stats.offline} equipos caídos`,
      detail: names.slice(0, 3).join(' · ') + (names.length > 3 ? ` y ${names.length - 3} más` : ''),
      led: 'offline',
    };
  }
  if (stats.online === stats.total) {
    return { headline: 'Toda la red en línea', detail: `${stats.total} equipos respondiendo`, led: 'online' };
  }
  return {
    headline: `${stats.online} de ${stats.total} en línea`,
    detail: stats.maintenance > 0 ? `${stats.maintenance} en mantenimiento` : `${stats.unknown} sin estado conocido`,
    led: stats.maintenance > 0 ? 'maintenance' : 'unknown',
  };
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState(null);
  const [devices, setDevices] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [nextStats, nextDevices] = await Promise.all([deviceService.getStats(), deviceService.getAll()]);
    setStats(nextStats);
    setDevices(nextDevices);
  }, []);

  // Se recarga cada vez que la pantalla gana foco (al volver de agregar/editar).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  // Navegación a una pantalla del Stack anidado dentro del Tab "Dispositivos".
  const goToList = (status) =>
    navigation.navigate('DevicesTab', { screen: 'DeviceList', params: { status } });

  const { headline, detail, led } = summarize(stats, devices);
  const firstName = user?.name?.split(' ')[0] ?? 'usuario';

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.md }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
          progressBackgroundColor={colors.surface}
        />
      }
    >
      <View style={styles.topBar}>
        <Logo size={32} />
        <Text style={[type.title, { color: colors.text }]}>NetVault</Text>
        <Text style={[type.label, styles.greeting, { color: colors.textMuted }]} numberOfLines={1}>
          Hola, {firstName}
        </Text>
      </View>

      <View style={styles.status} accessible accessibilityRole="header">
        <View style={styles.headlineRow}>
          <StatusLed status={led} size={14} />
          <Text style={[type.headline, { color: colors.text, flex: 1 }]}>{headline}</Text>
        </View>
        {detail ? <Text style={[type.body, { color: colors.textMuted }]}>{detail}</Text> : null}
      </View>

      {devices.length > 0 ? (
        <View style={styles.block}>
          <Text style={[type.label, { color: colors.textMuted }]}>Mapa de puertos</Text>
          <PortMap
            devices={devices}
            onPressDevice={(d) =>
              navigation.navigate('DevicesTab', { screen: 'DeviceDetail', params: { id: d.id }, initial: false })
            }
          />
        </View>
      ) : null}

      <View style={styles.block}>
        <Text style={[type.label, { color: colors.textMuted }]}>Por estado</Text>
        <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {DEVICE_STATUS.map((s, i) => (
            <Pressable
              key={s.key}
              onPress={() => goToList(s.key)}
              accessibilityRole="button"
              accessibilityLabel={`${s.label}: ${stats?.[s.key] ?? 0} equipos. Ver lista`}
              android_ripple={{ color: withAlpha(colors.text, 0.08) }}
              style={({ pressed }) => [
                styles.row,
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
                pressed && { backgroundColor: colors.surfaceRaised },
              ]}
            >
              <StatusLed status={s.key} size={12} />
              <Text style={[type.bodyStrong, { color: colors.text, flex: 1 }]}>{s.label}</Text>
              <Text style={[type.counter, { color: colors.text }]}>{stats?.[s.key] ?? '–'}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Registrar dispositivo"
          icon="add"
          // initial: false -> la lista queda debajo, así "atrás" desde el formulario regresa a ella.
          onPress={() => navigation.navigate('DevicesTab', { screen: 'DeviceForm', initial: false })}
        />
        <Button title="Ver inventario completo" icon="list-outline" variant="secondary" onPress={() => goToList(undefined)} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.lg, width: '100%', maxWidth: 760, alignSelf: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  greeting: { flex: 1, textAlign: 'right' },
  status: { gap: 6 },
  headlineRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  block: { gap: spacing.sm },
  group: { borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: spacing.md },
  actions: { gap: spacing.sm },
});
