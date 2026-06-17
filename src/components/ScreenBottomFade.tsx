import { ContentFade } from '@/components/ContentFade';
import { layout } from '@/constants/theme';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Fade inferior padronizado — colado na base da tela, home indicator por cima (sistema). */
export function ScreenBottomFade() {
  const insets = useSafeAreaInsets();

  return (
    <ContentFade
      edge="bottom"
      gradientId="screenBottomFade"
      height={layout.fadeHeight + insets.bottom}
      style={styles.container}
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
