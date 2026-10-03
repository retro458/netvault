/**
 * DeviceListScreen (ListScreen) — inventario leído desde SQLite con FlatList.
 *
 * Parámetros opcionales: { status?: string } para abrir ya filtrada (desde Home).
 */
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as deviceService from '../services/deviceService';
import DeviceCard from '../components/DeviceCard';
import EmptyState from '../components/EmptyState';
import { StatusLed } from '../components/StatusBadge';
import { useTheme } from '../context/ThemeContext';
import { DEVICE_STATUS } from '../constants/deviceOptions';
import { radius, spacing, withAlpha } from '../theme/colors';
import { fonts, type } from '../theme/typography';

export default function DeviceListScreen({ navigation, route }) {
  const { colors } = useTheme();
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
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
        <Pressable
          onPress={() => navigation.navigate('DeviceForm')}
          accessibilityRole="button"
          accessibilityLabel="Registrar dispositivo"
          hitSlop={8}
          style={({ pressed }) => [styles.addButton, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}
        >
          <Ionicons name="add" size={24} color={colors.primaryText} />
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
  const activeLabel = status ? DEVICE_STATUS.find((s) => s.key === status)?.label : null;
  const count = `${devices.length} ${devices.length === 1 ? 'equipo' : 'equipos'}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.searchBox,
          { backgroundColor: colors.surface, borderColor: searchFocused ? colors.accent : colors.border },
        ]}
      >
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Hostname, IP, rol o sistema"
          placeholderTextColor={withAlpha(colors.textMuted, 0.75)}
          selectionColor={withAlpha(colors.primary, 0.45)}
          cursorColor={colors.accent}
          accessibilityLabel="Buscar dispositivos"
          style={[styles.searchInput, { color: colors.text }]}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {search ? (
          <Pressable onPress={() => setSearch('')} hitSlop={12} accessibilityRole="button" accessibilityLabel="Borrar búsqueda">
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
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
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              {item.key ? <StatusLed status={item.key} size={8} /> : null}
              <Text style={[type.label, { color: active ? colors.primaryText : colors.text }]}>{item.label}</Text>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
            progressBackgroundColor={colors.surface}
          />
        }
        ListHeaderComponent={
          devices.length > 0 ? (
            <Text style={[type.caption, styles.count, { color: colors.textMuted }]}>
              {activeLabel ? `${count} · ${activeLabel}` : count}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon="server-outline"
            title="Sin dispositivos"
            subtitle={
              search || status
                ? 'Ningún equipo coincide con la búsqueda o el filtro.'
                : 'Toca + para registrar el primero.'
            }
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  addButton: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    margin: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  searchInput: { flex: 1, minHeight: 48, fontFamily: fonts.regular, fontSize: 15 },
  chipsList: { flexGrow: 0 },
  chips: { paddingHorizontal: spacing.md, gap: spacing.sm, paddingBottom: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  list: { padding: spacing.md, paddingTop: spacing.xs, flexGrow: 1, width: '100%', maxWidth: 760, alignSelf: 'center' },
  count: { marginBottom: spacing.sm },
});
