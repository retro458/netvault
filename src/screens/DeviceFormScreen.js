/**
 * DeviceFormScreen (DataEntryScreen) — crear o editar un dispositivo.
 *
 * Parámetros: { id?: number }
 *   - sin id  -> modo crear
 *   - con id  -> modo editar (carga los datos actuales)
 * Header: título dinámico y botón de guardar (check).
 *
 * TODO UI: diseño final a cargo del equipo de UI.
 */
import { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
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
import FormField from '../components/FormField';
import { useTheme } from '../context/ThemeContext';
import { DEVICE_ROLES, DEVICE_STATUS } from '../constants/deviceOptions';
import { radius, spacing } from '../theme/colors';

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
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Pressable onPress={handleSave} hitSlop={10} disabled={loading}>
            <Ionicons name="checkmark" size={26} color={colors.primary} />
          </Pressable>
        ),
    });
  });

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  /** Fila de opciones tipo "chip" (estado y roles sugeridos). */
  const Chips = ({ options, selected, onSelect }) => (
    <View style={styles.chips}>
      {options.map(({ key, label }) => {
        const active = selected === key;
        return (
          <Pressable
            key={key}
            onPress={() => onSelect(key)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? colors.primary : colors.surface,
                borderColor: active ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={{ color: active ? colors.primaryText : colors.text, fontSize: 13 }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <FormField label="Hostname *" value={form.hostname} onChangeText={setField('hostname')} placeholder="DC01" autoCapitalize="characters" />
        <FormField label="Dirección IP" value={form.ip} onChangeText={setField('ip')} placeholder="10.10.10.10" keyboardType="numbers-and-punctuation" autoCapitalize="none" />
        <FormField label="Dirección MAC" value={form.mac} onChangeText={setField('mac')} placeholder="AA:BB:CC:DD:EE:FF" autoCapitalize="characters" />
        <FormField label="Sistema operativo" value={form.os} onChangeText={setField('os')} placeholder="Windows Server 2022" />

        <FormField label="Rol" value={form.role} onChangeText={setField('role')} placeholder="Controlador de dominio" />
        <Chips
          options={DEVICE_ROLES.map((r) => ({ key: r, label: r }))}
          selected={form.role}
          onSelect={setField('role')}
        />

        <FormField label="Ubicación" value={form.location} onChangeText={setField('location')} placeholder="VirtualBox · Desktop" />

        <Text style={[styles.label, { color: colors.textMuted }]}>Estado</Text>
        <Chips
          options={DEVICE_STATUS.map((s) => ({ key: s.key, label: s.label }))}
          selected={form.status}
          onSelect={setField('status')}
        />

        <FormField
          label="Notas"
          value={form.notes}
          onChangeText={setField('notes')}
          placeholder="Servicios, puertos, observaciones (no guardes contraseñas)"
          multiline
          style={{ minHeight: 90, textAlignVertical: 'top' }}
        />

        <Button
          title={saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Registrar dispositivo'}
          color={colors.primary}
          onPress={handleSave}
          disabled={saving}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: spacing.md, gap: spacing.md, width: '100%', maxWidth: 700, alignSelf: 'center' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: -spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.lg, borderWidth: 1 },
});
