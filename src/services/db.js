/**
 * Conexión y migraciones de la base de datos SQLite local.
 *
 * - Se abre UNA sola conexión para toda la app (patrón singleton).
 * - Las migraciones usan `PRAGMA user_version`: cada versión se aplica una sola vez.
 * - Las pantallas NO deben importar este archivo; usen `deviceService`.
 */
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'netvault.db';

// Versión actual del esquema. Súbanla en 1 cada vez que agreguen una migración.
const SCHEMA_VERSION = 1;

let dbPromise = null;

/**
 * Devuelve la conexión lista para usar (abre y migra la primera vez).
 * @returns {Promise<SQLite.SQLiteDatabase>}
 */
export function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await migrate(db);
      return db;
    })().catch((error) => {
      // Si falla, permitimos reintentar en la siguiente llamada.
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}

/** Aplica las migraciones pendientes según `user_version`. */
async function migrate(db) {
  await db.execAsync('PRAGMA journal_mode = WAL;');

  const row = await db.getFirstAsync('PRAGMA user_version');
  let currentVersion = row?.user_version ?? 0;

  if (currentVersion >= SCHEMA_VERSION) return;

  if (currentVersion === 0) {
    // v1: tabla principal. Los campos `source` y `last_seen` quedan listos
    // para cuando los agentes de cada servidor reporten su estado.
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS devices (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        hostname    TEXT    NOT NULL UNIQUE COLLATE NOCASE,
        ip          TEXT,
        mac         TEXT,
        os          TEXT,
        role        TEXT,
        location    TEXT,
        status      TEXT    NOT NULL DEFAULT 'unknown',
        source      TEXT    NOT NULL DEFAULT 'manual',
        last_seen   TEXT,
        notes       TEXT,
        created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_devices_status ON devices (status);
    `);
    await seed(db);
    currentVersion = 1;
  }

  // Ejemplo de migración futura:
  // if (currentVersion === 1) {
  //   await db.execAsync('ALTER TABLE devices ADD COLUMN vlan INTEGER;');
  //   currentVersion = 2;
  // }

  await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
}

/** Datos de ejemplo para que la app no arranque vacía (lab en VirtualBox). */
async function seed(db) {
  const devices = [
    ['DC01', '10.10.10.10', 'Windows Server 2022 (Core)', 'Controlador de dominio', 'VirtualBox · Desktop', 'online', 'AD DS + DNS. Administrado con Windows Admin Center.'],
    ['RHEL01', '10.10.10.20', 'Red Hat Enterprise Linux 9', 'Servidor web', 'VirtualBox · Desktop', 'online', 'Unido al dominio del lab.'],
    ['FW01', '10.10.10.1', 'OPNsense', 'Firewall', 'VirtualBox · Desktop', 'maintenance', 'Pendiente: gateway del lab + Tailscale.'],
    ['LAPTOP-EMP01', null, 'Windows 10', 'Estación de trabajo', 'Física · WiFi', 'unknown', 'Equipo para practicar alistamiento y entrega.'],
  ];

  await db.withTransactionAsync(async () => {
    for (const [hostname, ip, os, role, location, status, notes] of devices) {
      await db.runAsync(
        `INSERT INTO devices (hostname, ip, os, role, location, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [hostname, ip, os, role, location, status, notes]
      );
    }
  });
}

/**
 * Borra todos los datos y vuelve a crear el esquema con los datos de ejemplo.
 * Útil para pruebas o para un botón "Restablecer datos".
 */
export async function resetDatabase() {
  const db = await getDb();
  await db.execAsync('DROP TABLE IF EXISTS devices; PRAGMA user_version = 0;');
  await migrate(db);
}
