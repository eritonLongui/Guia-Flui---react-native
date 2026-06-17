import { ScreenBottomFade } from '@/components/ScreenBottomFade';
import { ScreenTopFade } from '@/components/ScreenTopFade';

/** Fades superior e inferior globais — usar no layout raiz para todas as telas. */
export function ScreenEdgeFades() {
  return (
    <>
      <ScreenTopFade />
      <ScreenBottomFade />
    </>
  );
}
