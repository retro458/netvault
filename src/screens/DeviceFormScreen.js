/**
 * DeviceFormScreen (DataEntryScreen) — crear o editar un dispositivo.
 *
 * Parámetros: { id?: number }
 *   - sin id  -> modo crear
 *   - con id  -> modo editar (carga los datos actuales)
 * Header: título dinámico y botón de guardar (check).
 *
 * Los campos van agrupados como se piensa un equipo: quién es, qué corre y en qué estado está.
 * IP y MAC se validan mientras se escribe; el servicio vuelve a validar al guardar.
 */
import { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as deviceService from '../services/deviceService';
import Button from '../components/Button';
import FormField from '../components/FormField';
import { StatusLed } from '../components/StatusBadge';
import { useTheme } from '../context/ThemeContext';
import { DEVICE_ROLES, DEVICE_STATUS } from '../constants/deviceOptions';
import { isValidIPv4, isValidMac } from '../utils/validators';
import { radius, spacing } from '../theme/colors';
import { type } from '../theme/typography';

const EMPTY_FORM = {
  hostname: '',
  ip: '',
  mac: '',
  os: '',
  role: '',
  location: '',
  status: 'unknown',
  notes: '',
};

/** Fila de opciones tipo "chip" (estado y roles sugeridos). La elegida se rellena de amarillo. */
function ChipGroup({ options, selected, onSelect }) {
  const { colors } = useTheme();
  return (
    <View style={styles.chips}>
      {options.map(({ key, label }) => {
        const active = selected === key;
        return (
          <Pressable
            key={key}
            onPress={() => onSelect(key)}
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
            {DEVICE_STATUS.some((s) => s.key === key) ? <StatusLed status={key} size={8} /> : null}
            <Text style={[type.label, { color: active ? colors.primaryText : colors.text }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function DeviceFormScreen({ navigation, route }) {
  const id = route.params?.id;
  const isEditing = id != null;
  const { colors } = useTheme();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  /** Actualiza un campo del formulario. */
  const setField = (name) => (value) => setForm((prev) => ({ ...prev, [name]: value }));

  // En modo editar, carga el dispositivo y llena el formulario.
  useEffect(() => {
    if (!isEditing) return;
    deviceService.getById(id).then((device) => {
      if (!device) {
        Alert.alert('Error', 'El dispositivo no existe.');
        navigation.goBack();
        return;
      }
      // Los null de la BD se convierten en '' para los TextInput.
      const filled = {};
      for (const key of Object.keys(EMPTY_FORM)) filled[key] = device[key] ?? EMPTY_FORM[key];
      setForm(filled);
      setLoading(false);
    });
  }, [id, isEditing, navigation]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (isEditing) {
        await deviceService.update(id, form);
        navigation.goBack();
      } else {
        const created = await deviceService.create(form);
        // replace: al volver desde el detalle no regresa al formulario vacío.
        navigation.replace('DeviceDetail', { id: created.id });
      }
    } catch (e) {
      Alert.alert('No se pudo guardar', e.message);
      setSaving(false);
    }
  };

  // Header personalizado: título según el modo + botón de guardar.
  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Editar dispositivo' : 'Nuevo dispositivo',
      headerRight: () =>
        saving ? (
          <ActivityIndicator color={colors.accent} />
        ) : (
          <Pressable
            onPress={handleSave}
            hitSlop={8}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Guardar"
            style={({ pressed }) => [
              styles.saveButton,
              { backgroundColor: colors.primary, opacity: loading ? 0.4 : pressed ? 0.8 : 1 },
            ]}
          >
            <Ionicons name="checkmark" size={22} color={colors.primaryText} />
          </Pressable>
        ),
    });
  });

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const ipError = form.ip.trim() && !isValidIPv4(form.ip) ? 'IPv4 no válida. Ejemplo: 10.10.10.10' : undefined;
  const macError = form.mac.trim() && !isValidMac(form.mac) ? 'MAC no válida. Ejemplo: AA:BB:CC:DD:EE:FF' : undefined;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={[type.title, { color: colors.text }]}>Identificación</Text>
          <FormField
            label="Hostname *"
            value={form.hostname}
            onChangeText={setField('hostname')}
            placeholder="DC01"
            autoCapitalize="characters"
            autoCorrect={false}
            mono
          />
          <FormField
            label="Dirección IP"
            value={form.ip}
            onChangeText={setField('ip')}
            placeholder="10.10.10.10"
            keyboardType="numbers-and-punctuation"
            autoCapitalize="none"
            autoCorrect={false}
            error={ipError}
            mono
          />
          <FormField
            label="Dirección MAC"
            value={form.mac}
            onChangeText={setField('mac')}
            placeholder="AA:BB:CC:DD:EE:FF"
            autoCapitalize="characters"
            autoCorrect={false}
            error={macError}
            mono
          />
        </View>

        <View style={styles.section}>
          <Text style={[type.title, { color: colors.text }]}>Sistema</Text>
          <FormField label="Sistema operativo" value={form.os} onChangeText={setField('os')} placeholder="Windows Server 2022" />
          <FormField label="Rol" value={form.role} onChangeText={setField('role')} placeholder="Controlador de dominio" />
          <ChipGroup
            options={DEVICE_ROLES.map((r) => ({ key: r, label: r }))}
            selected={form.role}
            onSelect={setField('role')}
          />
          <FormField label="Ubicación" value={form.location} onChangeText={setField('location')} placeholder="VirtualBox · Desktop" />
        </View>

        <View style={styles.section}>
          <Text style={[type.title, { color: colors.text }]}>Estado</Text>
          <ChipGroup
            options={DEVICE_STATUS.map((s) => ({ key: s.key, label: s.label }))}
            selected={form.status}
            onSelect={setField('status')}
          />
        </View>

        <View style={styles.section}>
          <Text style={[type.title, { color: colors.text }]}>Notas</Text>
          <FormField
            label="Servicios, puertos, observaciones"
            value={form.notes}
            onChangeText={setField('notes')}
            placeholder="No guardes contraseñas aquí"
            multiline
            style={{ minHeight: 96, textAlignVertical: 'top' }}
          />
        </View>

        <Button
          title={saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Registrar dispositivo'}
          icon="checkmark"
          onPress={handleSave}
          loading={saving}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.xl, width: '100%', maxWidth: 700, alignSelf: 'center' },
  section: { gap: spacing.md },
  saveButton: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
});
