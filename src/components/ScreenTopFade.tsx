import { ContentFade } from '@/components/ContentFade';
import { layout } from '@/constants/theme';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Fade superior padronizado — colado no topo da tela, status bar por cima (sistema). */
export function ScreenTopFade() {
  const insets = useSafeAreaInsets();

  return (
    <ContentFade
      edge="top"
      gradientId="screenTopFade"
      height={layout.fadeHeight + insets.top}
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 40,
  },
});
