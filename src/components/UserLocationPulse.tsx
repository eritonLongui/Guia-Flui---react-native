import { colors } from '@/constants/theme';
import { Car } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export const USER_LOCATION_MARKER_SIZE = 80;
const DOT = 26;
const PULSE_MS = 2400;

/** Centro do círculo — Marker `anchor` 0.5 / 0.5. */
export const USER_LOCATION_MARKER_ANCHOR = { x: 0.5, y: 0.5 } as const;

export function UserLocationPulse() {
  const t = usePulseClock(PULSE_MS);
  const a = ring(t);
  const b = ring((t + 0.5) % 1);

  return (
    <View collapsable={false} style={styles.wrap}>
      <View collapsable={false} style={[styles.bound, styles.boundTL]} />
      <View collapsable={false} style={[styles.bound, styles.boundTR]} />
      <View collapsable={false} style={[styles.bound, styles.boundBL]} />
      <View collapsable={false} style={[styles.bound, styles.boundBR]} />
      <PulseRing ring={a} />
      <PulseRing ring={b} />
      <View collapsable={false} style={styles.dot}>
        <Car size={13} color={colors.backgroundEnd} fill={colors.backgroundEnd} strokeWidth={2.2} />
      </View>
    </View>
  );
}

function PulseRing({ ring }: { ring: { size: number; opacity: number } }) {
  const offset = (USER_LOCATION_MARKER_SIZE - ring.size) / 2;
  return (
    <View
      pointerEvents="none"
      collapsable={false}
      style={[
        styles.ring,
        {
          width: ring.size,
          height: ring.size,
          borderRadius: ring.size / 2,
          left: offset,
          top: offset,
          opacity: ring.opacity,
        },
      ]}
    />
  );
}

function ring(t: number) {
  const eased = 1 - (1 - t) * (1 - t);
  const size = DOT + (USER_LOCATION_MARKER_SIZE - 10 - DOT) * eased;
  const fade = (1 - t) * (1 - t);
  return { size, opacity: 0.55 * fade };
}

function usePulseClock(durationMs: number) {
  const [t, setT] = useState(0);

  useEffect(() => {
    let raf = 0;
    let origin = 0;
    let last = 0;
    const tick = (now: number) => {
      if (!origin) origin = now;
      if (now - last >= 48) {
        last = now;
        setT(((now - origin) % durationMs) / durationMs);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [durationMs]);

  return t;
}

const styles = StyleSheet.create({
  wrap: {
    width: USER_LOCATION_MARKER_SIZE,
    height: USER_LOCATION_MARKER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  bound: {
    position: 'absolute',
    width: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  boundTL: { top: 0, left: 0 },
  boundTR: { top: 0, right: 0 },
  boundBL: { bottom: 0, left: 0 },
  boundBR: { bottom: 0, right: 0 },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: 'rgba(49, 254, 80, 0.16)',
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    zIndex: 2,
  },
});
