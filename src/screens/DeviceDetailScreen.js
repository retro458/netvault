/**
 * DeviceDetailScreen — detalle de un dispositivo.
 *
 * Parámetros: { id: number }  (llega desde la lista o por deep link netvault://devices/:id)
 * Header: botón de editar (lápiz) que abre DeviceForm con el mismo id.
 *
 * Arriba va la "etiqueta" del equipo (su IP en cinta amarilla), luego la ficha técnica
 * agrupada en Red / Sistema / Registro, el cambio rápido de estado y el borrado.
 */
import { useCallback, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as deviceService from '../services/deviceService';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import StatusBadge, { StatusLed } from '../components/StatusBadge';
import TapeLabel from '../components/TapeLabel';
import { useTheme } from '../context/ThemeContext';
import { DEVICE_STATUS } from '../constants/deviceOptions';
import { radius, spacing, withAlpha } from '../theme/colors';
import { fonts, type } from '../theme/typography';

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
      headerTitleStyle: { fontFamily: device ? fonts.monoBold : fonts.bold, fontSize: device ? 16 : 17, color: colors.text },
      headerRight: device
        ? () => (
            <Pressable
              onPress={() => navigation.navigate('DeviceForm', { id })}
              accessibilityRole="button"
              accessibilityLabel="Editar dispositivo"
              hitSlop={10}
              style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Ionicons name="create-outline" size={24} color={colors.text} />
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
        <ActivityIndicator color={colors.accent} />
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

  // [etiqueta, valor, ¿es dato de red? (se muestra en mono)]
  const sections = [
    {
      title: 'Red',
      rows: [
        ['IP', device.ip, true],
        ['MAC', device.mac, true],
      ],
    },
    {
      title: 'Sistema',
      rows: [
        ['Sistema operativo', device.os, false],
        ['Rol', device.role, false],
        ['Ubicación', device.location, false],
      ],
    },
    {
      title: 'Registro',
      rows: [
        ['Origen', device.source === 'agent' ? 'Agente' : 'Manual', false],
        ['Último reporte', device.lastSeen, true],
        ['Actualizado', device.updatedAt ? `${device.updatedAt} UTC` : null, true],
      ],
    },
  ];

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <TapeLabel size="lg">{device.ip ?? 'SIN IP'}</TapeLabel>
        <View style={styles.heroMeta}>
          <StatusBadge status={device.status} />
          {device.role ? (
            <Text style={[type.body, { color: colors.textMuted, flexShrink: 1 }]} numberOfLines={1}>
              {device.role}
            </Text>
          ) : null}
        </View>
      </View>

      {sections.map((section) => (
        <View key={section.title} style={styles.block}>
          <Text style={[type.label, { color: colors.textMuted }]}>{section.title}</Text>
          <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {section.rows.map(([label, value, mono], i) => (
              <View
                key={label}
                style={[
                  styles.row,
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
                ]}
              >
                <Text style={[type.body, { color: colors.textMuted }]}>{label}</Text>
                <Text
                  selectable
                  style={[
                    mono ? type.data : type.bodyStrong,
                    styles.value,
                    { color: value ? colors.text : colors.textMuted },
                  ]}
                >
                  {value ?? '—'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      {device.notes ? (
        <View style={styles.block}>
          <Text style={[type.label, { color: colors.textMuted }]}>Notas</Text>
          <View style={[styles.group, styles.notes, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text selectable style={[type.body, { color: colors.text }]}>
              {device.notes}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.block}>
        <Text style={[type.label, { color: colors.textMuted }]}>Cambiar estado</Text>
        <View style={styles.statusGrid}>
          {DEVICE_STATUS.map((s) => {
            const active = device.status === s.key;
            const color = colors.status[s.key];
            return (
              <Pressable
                key={s.key}
                onPress={() => changeStatus(s.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Marcar como ${s.label}`}
                android_ripple={{ color: withAlpha(colors.text, 0.08) }}
                style={[
                  styles.statusBtn,
                  {
                    borderColor: active ? color : colors.border,
                    backgroundColor: active ? withAlpha(color, 0.16) : colors.surface,
                  },
                ]}
              >
                <StatusLed status={s.key} size={10} />
                <Text style={[type.label, { color: colors.text }]}>{s.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Button title="Eliminar dispositivo" icon="trash-outline" variant="danger" onPress={confirmDelete} style={styles.delete} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.lg, width: '100%', maxWidth: 700, alignSelf: 'center' },
  headerButton: { padding: 4 },
  hero: { gap: spacing.md },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  block: { gap: spacing.sm },
  group: { borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  value: { flexShrink: 1, textAlign: 'right' },
  notes: { padding: spacing.md },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statusBtn: {
    flexGrow: 1,
    flexBasis: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  delete: { marginTop: spacing.sm },
});
