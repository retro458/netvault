/**
 * Catálogos usados por el formulario y la lista de dispositivos.
 * Si se agrega un valor nuevo aquí, el servicio lo acepta automáticamente.
 */

// Estados posibles de un dispositivo. `key` es lo que se guarda en SQLite.
export const DEVICE_STATUS = [
  { key: 'online', label: 'En línea', icon: 'checkmark-circle' },
  { key: 'offline', label: 'Caído', icon: 'close-circle' },
  { key: 'maintenance', label: 'Mantenimiento', icon: 'construct' },
  { key: 'unknown', label: 'Desconocido', icon: 'help-circle' },
];

// Roles sugeridos (el campo es texto libre, esto solo alimenta los atajos del formulario).
export const DEVICE_ROLES = [
  'Controlador de dominio',
  'Firewall',
  'Router',
  'Switch',
  'Servidor web',
  'Servidor de archivos',
  'Estación de trabajo',
  'Access Point',
];

// Origen del registro: hoy todo es manual; en la fase 2 lo llenarán los agentes.
export const DEVICE_SOURCE = {
  MANUAL: 'manual',
  AGENT: 'agent',
};

/** Devuelve la etiqueta legible de un estado (o el key si no existe). */
export function getStatusLabel(key) {
  return DEVICE_STATUS.find((s) => s.key === key)?.label ?? key;
}
