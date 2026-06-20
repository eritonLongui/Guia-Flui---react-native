import { gradients, layout } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

export type GradientVariant = keyof typeof gradients;

interface GradientFillProps {
  variant?: GradientVariant;
  rounded?: boolean | number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

export function GradientFill({
  variant = 'background',
  rounded = false,
  style,
  children,
}: GradientFillProps) {
  const borderRadius =
    rounded === true ? layout.cardRadius : typeof rounded === 'number' ? rounded : 0;

  return (
    <LinearGradient
      aria-hidden={true}
      importantForAccessibility="no"
      colors={[...gradients[variant]]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[borderRadius > 0 && { borderRadius, overflow: 'hidden' }, style]}>
      {children}
    </LinearGradient>
  );
}

/** Gradiente de fundo das telas — preenche o container pai. */
export function GradientBackground({ style }: { style?: StyleProp<ViewStyle> }) {
  return <GradientFill variant="background" style={[StyleSheet.absoluteFill, style]} />;
}

/** Gradiente padrão de cards e superfícies. */
export function GradientSurface({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <GradientFill variant="card" rounded style={style}>
      {children}
    </GradientFill>
  );
}
