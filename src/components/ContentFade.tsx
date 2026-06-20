import { colors, layout } from '@/constants/theme';
import { Dimensions, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

const SCREEN_WIDTH = Dimensions.get('window').width;

const STOPS_BOTTOM = [
  { offset: '0', opacity: 0 },
  { offset: '0.55', opacity: 0.45 },
  { offset: '1', opacity: 1 },
] as const;

const STOPS_TOP = [
  { offset: '0', opacity: 1 },
  { offset: '0.45', opacity: 0.45 },
  { offset: '1', opacity: 0 },
] as const;

interface ContentFadeProps {
  edge?: 'top' | 'bottom';
  color?: string;
  height?: number;
  gradientId?: string;
  style?: StyleProp<ViewStyle>;
}

/** Gradiente SVG reutilizável — prefira `ScreenTopFade` / `ScreenBottomFade` nos layouts. */
export function ContentFade({
  edge = 'bottom',
  color = colors.background,
  height = layout.fadeHeight,
  gradientId = 'contentFade',
  style,
}: ContentFadeProps) {
  const stops = edge === 'bottom' ? STOPS_BOTTOM : STOPS_TOP;

  if (height <= 0) return null;

  return (
    <View
      aria-hidden={true}
      importantForAccessibility="no"
      pointerEvents="none"
      style={[styles.container, { height }, style]}>
      <Svg width={SCREEN_WIDTH} height={height}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            {stops.map((stop) => (
              <Stop
                key={String(stop.offset)}
                offset={stop.offset}
                stopColor={color}
                stopOpacity={stop.opacity}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={SCREEN_WIDTH} height={height} fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
