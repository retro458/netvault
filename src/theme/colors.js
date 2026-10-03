/**
 * Paletas de color clara y oscura. Usen SIEMPRE estos tokens en los estilos
 * (const { colors } = useTheme()) en lugar de escribir colores a mano,
 * así el modo oscuro funciona en toda la app.
 */
export const lightColors = {
  background: '#F4F6F8',
  surface: '#FFFFFF',
  text: '#14202B',
  textMuted: '#5B6B7A',
  border: '#DCE2E8',
  primary: '#0B6E99',
  primaryText: '#FFFFFF',
  danger: '#C62828',
  // Colores por estado del dispositivo
  status: {
    online: '#2E7D32',
    offline: '#C62828',
    maintenance: '#B26A00',
    unknown: '#607080',
  },
};

export const darkColors = {
  background: '#0E151C',
  surface: '#17212B',
  text: '#E6EDF3',
  textMuted: '#93A3B3',
  border: '#2A3846',
  primary: '#4FB3E0',
  primaryText: '#0E151C',
  danger: '#EF5350',
  status: {
    online: '#66BB6A',
    offline: '#EF5350',
    maintenance: '#FFB74D',
    unknown: '#90A4AE',
  },
};

// Espaciados y radios compartidos para mantener consistencia.
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 6, md: 10, lg: 16 };
