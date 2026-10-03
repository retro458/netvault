/**
 * Paletas de color clara y oscura. Usen SIEMPRE estos tokens en los estilos
 * (const { colors } = useTheme()) en lugar de escribir colores a mano,
 * así el modo oscuro funciona en toda la app.
 *
 * Mundo visual: el cuarto de comunicaciones. Chasis negro mate, serigrafía
 * blanca, LEDs de puerto y la cinta amarilla de las rotuladoras con la que se
 * etiqueta cada equipo. El amarillo es el único color de marca; el verde, rojo
 * y naranja son estados (LEDs) y nunca decoración.
 */
export const lightColors = {
  background: '#E4E8E9', // concreto del cuarto de racks
  surface: '#FAFBFA', // cinta blanca / ficha
  surfaceRaised: '#EEF1F1', // campos y celdas sobre la ficha
  text: '#10181C',
  textMuted: '#52606A',
  border: '#CBD2D5',
  primary: '#FFD21F', // cinta amarilla (relleno de acciones)
  primaryText: '#14110A', // tinta sobre la cinta
  accent: '#10181C', // acento legible como texto/ícono sobre superficies claras
  danger: '#C8372D',
  // Colores por estado del dispositivo (LED del puerto)
  status: {
    online: '#0F8A4B',
    offline: '#C8372D',
    maintenance: '#B85C00',
    unknown: '#5E6E78',
  },
};

export const darkColors = {
  background: '#0C1013', // chasis negro con un punto frío
  surface: '#151B20',
  surfaceRaised: '#1D252B',
  text: '#EEF2F0',
  textMuted: '#8F9DA3',
  border: '#2A343B',
  primary: '#FFD21F',
  primaryText: '#14110A',
  accent: '#FFD21F',
  danger: '#FF6B5E',
  status: {
    online: '#35D07F',
    offline: '#FF5D52',
    maintenance: '#FF9F3D',
    unknown: '#7F93A0',
  },
};

// Espaciados y radios compartidos para mantener consistencia.
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 6, md: 10, lg: 14 };

/** Agrega transparencia a un color #RRGGBB. alpha en 0..1. */
export function withAlpha(hex, alpha) {
  const a = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}
