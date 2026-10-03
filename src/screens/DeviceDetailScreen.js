/**
 * DeviceDetailScreen — detalle de un dispositivo.
 *
 * Parámetros: { id: number }  (llega desde la lista o por deep link netvault://devices/:id)
 * Header: botón de editar (lápiz) que abre DeviceForm con el mismo id.
 *
 * TODO UI: diseño final a cargo del equipo de UI.
 */
import { useCallback, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as deviceService from '../services/deviceService';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { useTheme } from '../context/ThemeContext';
import { DEVICE_STATUS } from '../constants/deviceOptions';
import { radius, spacing } from '../theme/colors';

export default function DeviceDetailScreen({ navigation, route }) {
  const { id } = route.params;
  const { colors } = useTheme();
  const [device, setDevice] = useState(undefined); // undefined = cargando, null = no existe

  const load = useCallback(async () => {
    setDevice(await deviceService.getById(id));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Header personalizado: título = hostname y botón de editar.
  useLayoutEffect(() => {
    navigation.setOptions({
      title: device?.hostname ?? 'Detalle',
      headerRight: device
        ? () => (
            <Pressable onPress={() => navigation.navigate('DeviceForm', { id })} hitSlop={10}>
              <Ionicons name="create-outline" size={24} color={colors.primary} />
            </Pressable>
          )
        : undefined,
    });
  }, [navigation, device, id, colors]);

  const changeStatus = async (status) => {
    setDevice(await deviceService.updateStatus(id, status));
  };

  const confirmDelete = () =>
    Alert.alert('Eliminar dispositivo', `¿Eliminar ${device.hostname}? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deviceService.remove(id);
          navigation.goBack();
        },
      },
    ]);

  if (device === undefined) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (device === null) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <EmptyState icon="alert-circle-outline" title="Dispositivo no encontrado" subtitle={`No existe el id ${id}.`} />
      </View>
    );
  }

  const fields = [
    ['IP', device.ip],
    ['MAC', device.mac],
    ['Sistema operativo', device.os],
    ['Rol', device.role],
    ['Ubicación', device.location],
    ['Origen', device.source === 'agent' ? 'Agente' : 'Manual'],
    ['Último reporte', device.lastSeen],
    ['Actualizado', device.updatedAt],
  ];

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.hostname, { color: colors.text }]}>{device.hostname}</Text>
        <StatusBadge status={device.status} />
        {fields.map(([label, value]) => (
          <View key={label} style={[styles.row, { borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
            <Text style={[styles.value, { color: colors.text }]}>{value ?? '—'}</Text>
          </View>
        ))}
        {device.notes ? (
          <Text style={[styles.notes, { color: colors.text }]}>{device.notes}</Text>
        ) : null}
      </View>

      <Text style={[styles.section, { color: colors.text }]}>Cambiar estado</Text>
      <View style={styles.statusRow}>
        {DEVICE_STATUS.map((s) => (
          <Pressable
            key={s.key}
            onPress={() => changeStatus(s.key)}
            style={[
              styles.statusBtn,
              {
                borderColor: colors.status[s.key],
                backgroundColor: device.status === s.key ? colors.status[s.key] : 'transparent',
              },
            ]}
          >
            <Ionicons name={s.icon} size={18} color={device.status === s.key ? '#fff' : colors.status[s.key]} />
            <Text style={{ color: device.status === s.key ? '#fff' : colors.status[s.key], fontSize: 12 }}>
              {s.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={[styles.delete, { borderColor: colors.danger }]} onPress={confirmDelete}>
        <Ionicons name="trash-outline" size={20} color={colors.danger} />
        <Text style={{ color: colors.danger, fontWeight: '600' }}>Eliminar dispositivo</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: spacing.md, gap: spacing.md, width: '100%', maxWidth: 700, alignSelf: 'center' },
  card: { padding: spacing.md, borderRadius: radius.md, gap: spacing.sm },
  hostname: { fontSize: 22, fontWeight: '800' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: { fontSize: 14 },
  value: { fontSize: 14, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  notes: { fontSize: 14, marginTop: spacing.sm, lineHeight: 20 },
  section: { fontSize: 16, fontWeight: '700' },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statusBtn: {
    flexGrow: 1,
    flexBasis: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  delete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
});
