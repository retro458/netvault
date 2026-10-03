/**
 * Validaciones de formatos de red. Funciones puras: se pueden usar
 * también en la UI para mostrar errores mientras el usuario escribe.
 */

/** true si es una IPv4 válida (cuatro octetos 0-255, sin ceros a la izquierda). */
export function isValidIPv4(value) {
  const parts = String(value).trim().split('.');
  if (parts.length !== 4) return false;
  return parts.every((p) => /^(0|[1-9]\d{0,2})$/.test(p) && Number(p) <= 255);
}

/** true si es una MAC de 6 pares hex separados por ':' o '-' (o sin separador). */
export function isValidMac(value) {
  // \1 obliga a usar el mismo separador en toda la dirección.
  return /^[0-9A-Fa-f]{2}([:-]?)([0-9A-Fa-f]{2}\1){4}[0-9A-Fa-f]{2}$/.test(String(value).trim());
}

/** Normaliza una MAC al formato AA:BB:CC:DD:EE:FF. */
export function normalizeMac(value) {
  const hex = String(value).replace(/[:-]/g, '').toUpperCase();
  return hex.match(/.{2}/g).join(':');
}
