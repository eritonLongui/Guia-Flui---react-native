import { colors } from '@/constants/theme';
import { useFocusEffect } from 'expo-router';
import { Car, Check } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const THUMB = 56;
const TRACK_HEIGHT = 64;
const TRACK_PAD = 4;
const CHECK_SLOT = 28;

const SNAP_BACK = { damping: 20, stiffness: 260, mass: 0.7, overshootClamping: true };

interface SlideToStartProps {
  label?: string;
  onComplete: () => void;
}

function clampProgress(x: number, max: number) {
  'worklet';
  if (max <= 0) return 0;
  return Math.min(Math.max(x, 0), max);
}

function FlowStreak({
  delay,
  translateX,
  maxX,
  flow,
}: {
  delay: number;
  translateX: SharedValue<number>;
  maxX: SharedValue<number>;
  flow: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const x = clampProgress(translateX.value, maxX.value);
    const fillWidth = x + THUMB;
    const travel = Math.max(fillWidth - 40, 0);
    const pos = ((flow.value + delay) % 1) * travel;
    const progress = maxX.value > 0 ? x / maxX.value : 0;

    return {
      opacity: interpolate(progress, [0.05, 0.2, 1], [0, 0.85, 1], Extrapolation.CLAMP),
      transform: [{ translateX: pos }, { skewX: '-20deg' }],
    };
  });

  return <Animated.View style={[styles.streak, style]} />;
}

export function SlideToStart({ label = 'Iniciar', onComplete }: SlideToStartProps) {
  const translateX = useSharedValue(0);
  const maxX = useSharedValue(0);
  const completed = useSharedValue(false);
  const flow = useSharedValue(0);
  const [gestureKey, setGestureKey] = useState(0);

  useEffect(() => {
    flow.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.linear }),
      -1,
      false,
    );
  }, [flow]);

  useFocusEffect(
    useCallback(() => {
      completed.value = false;
      translateX.value = 0;
      setGestureKey((key) => key + 1);
    }, [completed, translateX]),
  );

  const finish = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const onTrackLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    maxX.value = Math.max(width - THUMB - TRACK_PAD * 2, 0);
  };

  const snapBack = () => {
    'worklet';
    translateX.value = withSpring(0, SNAP_BACK);
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .failOffsetY([-18, 18])
    .onUpdate((event) => {
      'worklet';
      if (completed.value || maxX.value <= 0) return;
      translateX.value = clampProgress(event.translationX, maxX.value);
    })
    .onFinalize(() => {
      'worklet';
      if (completed.value || maxX.value <= 0) return;
      const x = clampProgress(translateX.value, maxX.value);
      if (x >= maxX.value * 0.78) {
        completed.value = true;
        translateX.value = withSpring(maxX.value, SNAP_BACK, (done) => {
          if (done && completed.value) {
            runOnJS(finish)();
          }
        });
        return;
      }
      snapBack();
    });

  const thumbStyle = useAnimatedStyle(() => {
    const x = clampProgress(translateX.value, maxX.value);
    const progress = maxX.value > 0 ? x / maxX.value : 0;
    return {
      transform: [{ translateX: x }, { scale: interpolate(progress, [0, 1], [1, 1.04]) }],
      shadowOpacity: interpolate(progress, [0, 1], [0.45, 0.9]),
      shadowRadius: interpolate(progress, [0, 1], [10, 18]),
    };
  });

  const labelStyle = useAnimatedStyle(() => {
    const x = clampProgress(translateX.value, maxX.value);
    return {
      opacity: interpolate(x, [0, Math.max(maxX.value * 0.45, 1)], [1, 0], Extrapolation.CLAMP),
    };
  });

  const fillStyle = useAnimatedStyle(() => {
    const x = clampProgress(translateX.value, maxX.value);
    return {
      width: x + THUMB,
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    const x = clampProgress(translateX.value, maxX.value);
    const progress = maxX.value > 0 ? x / maxX.value : 0;
    return {
      opacity:
        interpolate(progress, [0, 0.15, 1], [0, 0.35, 0.55], Extrapolation.CLAMP) *
        (0.65 + 0.35 * Math.sin(flow.value * Math.PI * 2)),
    };
  });

  const checkStyle = useAnimatedStyle(() => {
    const x = clampProgress(translateX.value, maxX.value);
    const progress = maxX.value > 0 ? x / maxX.value : 0;
    return {
      opacity: interpolate(progress, [0, 0.55, 0.9], [0.22, 0.45, 1], Extrapolation.CLAMP),
      transform: [
        {
          scale: interpolate(progress, [0.7, 1], [0.92, 1.08], Extrapolation.CLAMP),
        },
      ],
    };
  });

  return (
    <View
      style={styles.track}
      onLayout={onTrackLayout}
      accessibilityRole="adjustable"
      accessibilityLabel={`${label}. Arraste para a direita para continuar.`}
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'activate') {
          finish();
        }
      }}>
      <Animated.View style={[styles.fill, fillStyle]}>
        <LinearGradient
          colors={[
            'rgba(49, 254, 80, 0.08)',
            'rgba(49, 254, 80, 0.28)',
            'rgba(49, 254, 80, 0.5)',
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[styles.pulseGlow, pulseStyle]} />
        <FlowStreak delay={0} translateX={translateX} maxX={maxX} flow={flow} />
        <FlowStreak delay={0.33} translateX={translateX} maxX={maxX} flow={flow} />
        <FlowStreak delay={0.66} translateX={translateX} maxX={maxX} flow={flow} />
      </Animated.View>

      <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>

      <Animated.View style={[styles.checkWrap, checkStyle]} pointerEvents="none">
        <Check size={18} color={colors.accent} strokeWidth={2.4} />
      </Animated.View>

      <GestureDetector key={gestureKey} gesture={pan}>
        <Animated.View style={[styles.thumb, thumbStyle]}>
          <Car size={24} color={colors.backgroundEnd} strokeWidth={2.4} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: 'rgba(30, 30, 31, 0.92)',
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: TRACK_PAD,
    top: TRACK_PAD,
    bottom: TRACK_PAD,
    borderRadius: THUMB / 2,
    overflow: 'hidden',
  },
  pulseGlow: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(49, 254, 80, 0.22)',
  },
  streak: {
    position: 'absolute',
    top: 10,
    bottom: 14,
    width: 18,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    shadowColor: colors.accent,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  label: {
    position: 'absolute',
    left: 0,
    right: CHECK_SLOT + 8,
    textAlign: 'center',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingLeft: THUMB / 2,
  },
  checkWrap: {
    position: 'absolute',
    right: 14,
    width: CHECK_SLOT,
    height: CHECK_SLOT,
    borderRadius: CHECK_SLOT / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(49, 254, 80, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(49, 254, 80, 0.22)',
  },
  thumb: {
    position: 'absolute',
    left: TRACK_PAD,
    top: TRACK_PAD,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.55,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
});
