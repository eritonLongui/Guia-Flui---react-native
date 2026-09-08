import { colors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const BAR_HEIGHT = 18;
const NEON = '#B6FF5A';
const TRACK = '#2F2F31';
const PILL_RADIUS = BAR_HEIGHT / 2;

interface CompatibilityBarProps {
  percentual: number;
}

export function CompatibilityBar({ percentual }: CompatibilityBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percentual)));
  const [trackWidth, setTrackWidth] = useState(0);
  const fillWidth = trackWidth * (clamped / 100);
  const shift = useSharedValue(0);

  useEffect(() => {
    if (fillWidth <= 0) return;
    shift.value = 0;
    shift.value = withRepeat(
      withTiming(-fillWidth * 0.5, {
        duration: 4800,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true,
    );
  }, [fillWidth, shift]);

  const gradientStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shift.value }],
  }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={`${clamped} por cento compatível`}
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
      style={styles.track}
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}>
      {fillWidth > 0 ? (
        <View style={[styles.fillClip, { width: fillWidth }]}>
          <Animated.View style={[styles.gradientBand, { width: fillWidth * 2 }, gradientStyle]}>
            <LinearGradient
              colors={[colors.accent, NEON, colors.accent]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.gradient}
            />
          </Animated.View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: BAR_HEIGHT,
    borderRadius: PILL_RADIUS,
    backgroundColor: TRACK,
    overflow: 'hidden',
  },
  fillClip: {
    height: BAR_HEIGHT,
    borderRadius: PILL_RADIUS,
    overflow: 'hidden',
  },
  gradientBand: {
    height: BAR_HEIGHT,
  },
  gradient: {
    flex: 1,
  },
});
