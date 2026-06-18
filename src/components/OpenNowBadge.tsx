import { chipBadge } from '@/constants/chipBadge';
import { colors } from '@/constants/theme';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

function PulseDot() {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.35, duration: 1000, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return <Animated.View style={[styles.dot, { opacity }]} />;
}

export function OpenNowBadge() {
  return (
    <View
      style={styles.chip}
      accessibilityRole="text"
      accessibilityLabel="Aberto agora">
      <PulseDot />
      <Text style={styles.label}>Aberto agora</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    ...chipBadge.container,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  label: {
    ...chipBadge.label,
  },
});
