/**
 * Mapa de puertos: un puerto por equipo, como el frente de un patch panel.
 * Cada celda muestra el LED de estado, el hostname y el último octeto de la IP;
 * los caídos se enmarcan en rojo para que salten a la vista.
 *
 * Al abrir la pantalla los LEDs se encienden en secuencia (una sola vez),
 * salvo que el sistema tenga activado "reducir movimiento".
 *
 * Props: devices (Device[]), onPressDevice (device) => void
 */
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusLed } from './StatusBadge';
import { useTheme } from '../context/ThemeContext';
import { DEVICE_STATUS } from '../constants/deviceOptions';
import { radius, withAlpha } from '../theme/colors';
import { fonts } from '../theme/typography';

const GAP = 8;

/** ".10" para 10.10.10.10; "—" si el equipo no tiene IP. */
function ipTail(ip) {
  return ip ? `.${ip.split('.').pop()}` : '—';
}

export default function PortMap({ devices, onPressDevice }) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const values = useRef(new Map()); // id -> Animated.Value (0 apagado, 1 encendido)
  const played = useRef(false);

  // 3 columnas en teléfono (los hostnames largos aún caben), más en pantallas anchas.
  const columns = width >= 560 ? 6 : width >= 420 ? 4 : 3;
  const cellWidth = width > 0 ? Math.floor((width - GAP * (columns - 1)) / columns) : 0;

  const valueFor = (id) => {
    if (!values.current.has(id)) values.current.set(id, new Animated.Value(played.current ? 1 : 0));
    return values.current.get(id);
  };
  const cellValues = devices.map((d) => valueFor(d.id));

  // Secuencia de encendido, una sola vez cuando ya hay datos y medida.
  useEffect(() => {
    if (played.current || devices.length === 0 || width === 0) return;
    played.current = true;
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) {
        cellValues.forEach((v) => v.setValue(1));
        return;
      }
      Animated.stagger(
        45,
        cellValues.map((v) =>
          Animated.timing(v, { toValue: 1, duration: 280, easing: Easing.out(Easing.exp), useNativeDriver: true })
        )
      ).start();
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devices.length, width]);

  return (
    <View style={styles.grid} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {cellWidth > 0 &&
        devices.map((device, i) => {
          const offline = device.status === 'offline';
          const statusLabel = DEVICE_STATUS.find((s) => s.key === device.status)?.label ?? device.status;
          const v = cellValues[i];

          return (
            <Animated.View
              key={device.id}
              style={{
                width: cellWidth,
                opacity: v,
                transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
              }}
            >
              <Pressable
                onPress={() => onPressDevice(device)}
                accessibilityRole="button"
                accessibilityLabel={`${device.hostname}, ${statusLabel}`}
                style={({ pressed }) => [
                  styles.cell,
                  {
                    backgroundColor: offline
                      ? withAlpha(colors.status.offline, 0.12)
                      : pressed
                        ? colors.surfaceRaised
                        : colors.surface,
                    borderColor: offline ? withAlpha(colors.status.offline, 0.75) : colors.border,
                  },
                ]}
              >
                <StatusLed status={device.status} size={9} />
                <View>
                  <Text style={[styles.hostname, { color: colors.text }]} numberOfLines={1} ellipsizeMode="clip">
                    {device.hostname}
                  </Text>
                  <Text style={[styles.tail, { color: colors.textMuted }]}>{ipTail(device.ip)}</Text>
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  cell: {
    height: 68,
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  hostname: { fontFamily: fonts.monoBold, fontSize: 12, lineHeight: 15 },
  tail: { fontFamily: fonts.mono, fontSize: 11, lineHeight: 14 },
});
