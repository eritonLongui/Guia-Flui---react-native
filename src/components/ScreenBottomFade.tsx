import { ContentFade } from '@/components/ContentFade';
import { layout } from '@/constants/theme';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenBottomFadeProps {
  /** Sobrescreve o z-index padrão (ex.: acima do sheet do Explorar, abaixo da tab bar). */
  style?: StyleProp<ViewStyle>;
  gradientId?: string;
}

/** Fade inferior padronizado — colado na base da tela, home indicator por cima (sistema). */
export function ScreenBottomFade({
  style,
  gradientId = 'screenBottomFade',
}: ScreenBottomFadeProps = {}) {
  const insets = useSafeAreaInsets();

  return (
    <ContentFade
      edge="bottom"
      gradientId={gradientId}
      height={layout.fadeHeight + insets.bottom}
      style={[styles.container, style]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
  },
});
