/**
 * deviceService — ÚNICA puerta de entrada a los datos de dispositivos.
 *
 * Las pantallas solo llaman estas funciones; nunca escriben SQL.
 * Así, cuando lleguen los agentes, se cambia la implementación (SQLite -> API)
 * sin tocar ninguna pantalla.
 *
 * Forma del objeto Device (ver CONTRATO.md):
 * {
 *   id: number,
 *   hostname: string,
 *   ip: string | null,
 *   mac: string | null,
 *   os: string | null,
 *   role: string | null,
 *   location: string | null,
 *   status: 'online' | 'offline' | 'maintenance' | 'unknown',
 *   source: 'manual' | 'agent',
 *   lastSeen: string | null,   // ISO / 'YYYY-MM-DD HH:MM:SS' (UTC)
 *   notes: string | null,
 *   createdAt: string,
 *   updatedAt: string,
 * }
 */
import { getDb } from './db';
import { DEVICE_STATUS } from '../constants/deviceOptions';
import { isValidIPv4, isValidMac, normalizeMac } from '../utils/validators';

const VALID_STATUS = DEVICE_STATUS.map((s) => s.key);

/** Convierte una fila de SQLite (snake_case) al objeto Device (camelCase). */
function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    hostname: row.hostname,
    ip: row.ip,
    mac: row.mac,
    os: row.os,
    role: row.role,
    location: row.location,
    status: row.status,
    source: row.source,
    lastSeen: row.last_seen,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Convierte '' y espacios en null para no guardar textos vacíos. */
function clean(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
}

/**
 * Valida y normaliza los datos que vienen del formulario.
 * Lanza un Error con mensaje en español (listo para mostrar en un Alert).
 */
function validate(input) {
  const data = {
    hostname: clean(input.hostname),
    ip: clean(input.ip),
    mac: clean(input.mac),
    os: clean(input.os),
    role: clean(input.role),
    location: clean(input.location),
    status: clean(input.status) ?? 'unknown',
    notes: clean(input.notes),
  };

  if (!data.hostname) throw new Error('El hostname es obligatorio.');
  if (data.hostname.length > 63) throw new Error('El hostname no puede tener más de 63 caracteres.');
  if (data.ip && !isValidIPv4(data.ip)) throw new Error('La IP no es una dirección IPv4 válida (ej. 192.168.1.10).');
  if (data.mac) {
    if (!isValidMac(data.mac)) throw new Error('La MAC no es válida (ej. AA:BB:CC:DD:EE:FF).');
    data.mac = normalizeMac(data.mac);
  }
  if (!VALID_STATUS.includes(data.status)) throw new Error(`Estado inválido: ${data.status}`);

  return data;
}

/** Traduce errores de SQLite a mensajes entendibles. */
function translateError(error) {
  // hostname es la única columna UNIQUE, así que cualquier choque viene de ahí.
  if (/UNIQUE constraint failed/i.test(String(error?.message))) {
    return new Error('Ya existe un dispositivo con ese hostname.');
  }
  return error;
}

// ─── LEER ────────────────────────────────────────────────────────────────

/**
 * Lista dispositivos ordenados por hostname.
 * @param {{ search?: string, status?: string }} [filters]
 *   search: busca en hostname, IP, rol y sistema operativo.
 *   status: filtra por un estado ('online', 'offline', ...).
 * @returns {Promise<Device[]>}
 */
export async function getAll(filters = {}) {
  const db = await getDb();
  const where = [];
  const params = [];

  const search = clean(filters.search);
  if (search) {
    where.push('(hostname LIKE ? OR ip LIKE ? OR role LIKE ? OR os LIKE ?)');
    const like = `%${search}%`;
    params.push(like, like, like, like);
  }
  if (filters.status) {
    where.push('status = ?');
    params.push(filters.status);
  }

  const sql = `SELECT * FROM devices
               ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
               ORDER BY hostname COLLATE NOCASE`;
  const rows = await db.getAllAsync(sql, params);
  return rows.map(mapRow);
}

/**
 * Obtiene un dispositivo por id.
 * @returns {Promise<Device | null>} null si no existe.
 */
export async function getById(id) {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT * FROM devices WHERE id = ?', [Number(id)]);
  return mapRow(row);
}

/**
 * Conteo por estado para el tablero de HomeScreen.
 * @returns {Promise<{ total: number, online: number, offline: number, maintenance: number, unknown: number }>}
 */
export async function getStats() {
  const db = await getDb();
  const rows = await db.getAllAsync('SELECT status, COUNT(*) AS count FROM devices GROUP BY status');
  const stats = { total: 0, online: 0, offline: 0, maintenance: 0, unknown: 0 };
  for (const { status, count } of rows) {
    stats[status] = count;
    stats.total += count;
  }
  return stats;
}

// ─── CREAR ───────────────────────────────────────────────────────────────

/**
 * Crea un dispositivo. Lanza Error si la validación falla o el hostname se repite.
 * @param {Partial<Device>} input datos del formulario.
 * @returns {Promise<Device>} el dispositivo creado (con id).
 */
export async function create(input) {
  const data = validate(input);
  const db = await getDb();
  try {
    const result = await db.runAsync(
      `INSERT INTO devices (hostname, ip, mac, os, role, location, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.hostname, data.ip, data.mac, data.os, data.role, data.location, data.status, data.notes]
    );
    return getById(result.lastInsertRowId);
  } catch (error) {
    throw translateError(error);
  }
}

// ─── ACTUALIZAR ──────────────────────────────────────────────────────────

/**
 * Actualiza un dispositivo existente (se envían todos los campos del formulario).
 * @returns {Promise<Device>} el dispositivo actualizado.
 */
export async function update(id, input) {
  const data = validate(input);
  const db = await getDb();
  try {
    const result = await db.runAsync(
      `UPDATE devices
          SET hostname = ?, ip = ?, mac = ?, os = ?, role = ?, location = ?,
              status = ?, notes = ?, updated_at = datetime('now')
        WHERE id = ?`,
      [data.hostname, data.ip, data.mac, data.os, data.role, data.location, data.status, data.notes, Number(id)]
    );
    if (result.changes === 0) throw new Error('El dispositivo ya no existe.');
    return getById(id);
  } catch (error) {
    throw translateError(error);
  }
}

/**
 * Cambia solo el estado (acción rápida desde la lista o el detalle).
 * @returns {Promise<Device>}
 */
export async function updateStatus(id, status) {
  if (!VALID_STATUS.includes(status)) throw new Error(`Estado inválido: ${status}`);
  const db = await getDb();
  await db.runAsync(
    `UPDATE devices SET status = ?, updated_at = datetime('now') WHERE id = ?`,
    [status, Number(id)]
  );
  return getById(id);
}

// ─── ELIMINAR ────────────────────────────────────────────────────────────

/**
 * Elimina un dispositivo.
 * @returns {Promise<boolean>} true si se eliminó, false si no existía.
 */
export async function remove(id) {
  const db = await getDb();
  const result = await db.runAsync('DELETE FROM devices WHERE id = ?', [Number(id)]);
  return result.changes > 0;
}
