import { colors } from '@/constants/theme';
import type { EstadoAssistente } from '@/hooks/useAssistenteVoz';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';

interface AssistenteVozAvatarProps {
  estado: EstadoAssistente;
  volume?: number;
}

function Olhos() {
  return (
    <Svg width={72} height={36} viewBox="0 0 72 36" accessibilityElementsHidden>
      <Rect
        x={6}
        y={6}
        width={20}
        height={24}
        rx={10}
        fill="none"
        stroke={colors.accent}
        strokeWidth={2.4}
      />
      <Rect
        x={46}
        y={6}
        width={20}
        height={24}
        rx={10}
        fill="none"
        stroke={colors.accent}
        strokeWidth={2.4}
      />
    </Svg>
  );
}

export function AssistenteVozAvatar({ estado, volume = 0 }: AssistenteVozAvatarProps) {
  const pulsoA = useSharedValue(1);
  const pulsoB = useSharedValue(1);
  const opacidadeA = useSharedValue(0.35);
  const opacidadeB = useSharedValue(0.22);
  const olharX = useSharedValue(0);
  const olharY = useSharedValue(0);
  const piscar = useSharedValue(1);
  const volumeAnim = useSharedValue(0);

  useEffect(() => {
    volumeAnim.value = withTiming(volume, { duration: 80, easing: Easing.out(Easing.quad) });
  }, [volume, volumeAnim]);

  useEffect(() => {
    cancelAnimation(pulsoA);
    cancelAnimation(pulsoB);
    cancelAnimation(opacidadeA);
    cancelAnimation(opacidadeB);
    cancelAnimation(olharX);
    cancelAnimation(olharY);
    cancelAnimation(piscar);

    const ease = Easing.inOut(Easing.sin);

    if (estado === 'ouvindo') {
      olharY.value = withTiming(0, { duration: 220, easing: ease });
      olharX.value = withRepeat(
        withSequence(
          withTiming(3, { duration: 1800, easing: ease }),
          withTiming(-3, { duration: 1800, easing: ease }),
        ),
        -1,
        true,
      );
      piscar.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2200 }),
          withTiming(0.14, { duration: 110, easing: ease }),
          withTiming(1, { duration: 160, easing: ease }),
        ),
        -1,
        false,
      );
      return;
    }

    if (estado === 'pensando') {
      pulsoA.value = withRepeat(withTiming(1.18, { duration: 1400, easing: ease }), -1, true);
      opacidadeA.value = withRepeat(withTiming(0.14, { duration: 1400, easing: ease }), -1, true);
      pulsoB.value = withRepeat(withTiming(1.1, { duration: 1800, easing: ease }), -1, true);
      opacidadeB.value = withRepeat(withTiming(0.08, { duration: 1800, easing: ease }), -1, true);
      olharX.value = withTiming(0, { duration: 220, easing: ease });
      olharY.value = withRepeat(withTiming(-4, { duration: 900, easing: ease }), -1, true);
      piscar.value = withRepeat(withTiming(0.62, { duration: 700, easing: ease }), -1, true);
      return;
    }

    if (estado === 'falando') {
      pulsoA.value = withRepeat(withTiming(1.48, { duration: 900, easing: ease }), -1, true);
      opacidadeA.value = withRepeat(withTiming(0.16, { duration: 900, easing: ease }), -1, true);
      pulsoB.value = withDelay(
        220,
        withRepeat(withTiming(1.32, { duration: 900, easing: ease }), -1, true),
      );
      opacidadeB.value = withDelay(
        220,
        withRepeat(withTiming(0.1, { duration: 900, easing: ease }), -1, true),
      );
      olharX.value = withTiming(0, { duration: 180, easing: ease });
      olharY.value = withTiming(0, { duration: 180, easing: ease });
      piscar.value = withRepeat(withTiming(0.82, { duration: 180, easing: ease }), -1, true);
      return;
    }

    pulsoA.value = withTiming(1, { duration: 280, easing: ease });
    pulsoB.value = withTiming(1, { duration: 280, easing: ease });
    opacidadeA.value = withTiming(0.14, { duration: 280, easing: ease });
    opacidadeB.value = withTiming(0.08, { duration: 280, easing: ease });
    olharX.value = withTiming(0, { duration: 220, easing: ease });
    olharY.value = withTiming(estado === 'erro' ? 3 : 0, { duration: 220, easing: ease });
    piscar.value = withTiming(estado === 'erro' ? 0.45 : 1, { duration: 220, easing: ease });
  }, [estado, olharX, olharY, opacidadeA, opacidadeB, piscar, pulsoA, pulsoB]);

  const anelAVolume = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + volumeAnim.value * 0.52 }],
    opacity: 0.16 + volumeAnim.value * 0.45,
  }));
  const anelBVolume = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + volumeAnim.value * 0.34 }],
    opacity: 0.1 + volumeAnim.value * 0.32,
  }));
  const anelALoop = useAnimatedStyle(() => ({
    transform: [{ scale: pulsoA.value }],
    opacity: opacidadeA.value,
  }));
  const anelBLoop = useAnimatedStyle(() => ({
    transform: [{ scale: pulsoB.value }],
    opacity: opacidadeB.value,
  }));
  const olhosStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: olharX.value },
      { translateY: olharY.value },
      { scaleY: piscar.value },
    ],
  }));

  const ouvindo = estado === 'ouvindo';

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.anel, ouvindo ? anelAVolume : anelALoop]} />
      <Animated.View style={[styles.anel, ouvindo ? anelBVolume : anelBLoop]} />
      <View style={styles.rosto}>
        <Animated.View style={olhosStyle}>
          <Olhos />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 168,
    height: 168,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anel: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  rosto: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
