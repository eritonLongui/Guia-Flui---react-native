import { colors } from '@/constants/theme';
import { HIT_SLOP_PADRAO } from '@/lib/a11y';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';

export const BACK_BUTTON_SIZE = 40;

interface BackButtonProps {
  onPress?: PressableProps['onPress'];
  accessibilityHint?: string;
}

export function BackButton({ onPress, accessibilityHint }: BackButtonProps) {
  return (
    <Pressable
      style={styles.button}
      onPress={onPress ?? (() => router.back())}
      accessibilityRole="button"
      accessibilityLabel="Voltar"
      accessibilityHint={accessibilityHint}
      hitSlop={HIT_SLOP_PADRAO}>
      <ArrowLeft aria-hidden={true} size={20} color={colors.textPrimary} />
    </Pressable>
  );
}

/** Reserva o mesmo espaço do botão, para títulos centralizados. */
export function BackButtonSpacer() {
  return <View style={styles.button} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  button: {
    width: BACK_BUTTON_SIZE,
    height: BACK_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
