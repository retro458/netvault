/**
 * DeviceListScreen (ListScreen) — inventario leído desde SQLite con FlatList.
 *
 * Parámetros opcionales: { status?: string } para abrir ya filtrada (desde Home).
 *
 * TODO UI: diseño final a cargo del equipo de UI.
 */
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as deviceService from '../services/deviceService';
import DeviceCard from '../components/DeviceCard';
import EmptyState from '../components/EmptyState';
import { useTheme } from '../context/ThemeContext';
import { DEVICE_STATUS } from '../constants/deviceOptions';
import { radius, spacing } from '../theme/colors';

export default function DeviceListScreen({ navigation, route }) {
  const { colors } = useTheme();
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(route.params?.status ?? null);
  const [refreshing, setRefreshing] = useState(false);

  // Si Home nos manda un filtro nuevo, se aplica.
  useEffect(() => {
    setStatus(route.params?.status ?? null);
  }, [route.params?.status]);

  // Botón "+" en el header para crear un dispositivo.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate('DeviceForm')} hitSlop={10}>
          <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
        </Pressable>
      ),
    });
  }, [navigation, colors]);

  const load = useCallback(async () => {
    const data = await deviceService.getAll({ search, status });
    setDevices(data);
  }, [search, status]);

  // Recarga al ganar foco y cada vez que cambian búsqueda o filtro.
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

  const filters = [{ key: null, label: 'Todos' }, ...DEVICE_STATUS];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por hostname, IP, rol o SO"
          placeholderTextColor={colors.textMuted}
          style={[styles.searchInput, { color: colors.text }]}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <FlatList
        horizontal
        data={filters}
        keyExtractor={(item) => String(item.key)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipsList}
        renderItem={({ item }) => {
          const active = status === item.key;
          return (
            <Pressable
              onPress={() => setStatus(item.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={{ color: active ? colors.primaryText : colors.text, fontWeight: '600' }}>
                {item.label}
              </Text>
            </Pressable>
          );
        }}
      />

      <FlatList
        data={devices}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <DeviceCard device={item} onPress={() => navigation.navigate('DeviceDetail', { id: item.id })} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState
            icon="server-outline"
            title="Sin dispositivos"
            subtitle={search || status ? 'Prueba con otro filtro.' : 'Toca + para registrar el primero.'}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    margin: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 15 },
  chipsList: { flexGrow: 0 },
  chips: { paddingHorizontal: spacing.md, gap: spacing.sm, paddingBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  list: { padding: spacing.md, paddingTop: spacing.sm, flexGrow: 1 },
});
