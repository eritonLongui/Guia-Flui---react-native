import { cn } from '@/lib/cn';
import { StyleSheet, Text, type TextProps } from 'react-native';

type TitleSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';

const sizeClasses: Record<TitleSize, string> = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-2xl',
  '2xl': 'text-3xl',
  hero: 'text-4xl',
};

interface TitleProps extends TextProps {
  size?: TitleSize;
  className?: string;
}

export function Title({ size = 'md', className, style, children, ...props }: TitleProps) {
  return (
    <Text
      className={cn(
        'font-lexend-giga uppercase tracking-title text-text-primary',
        sizeClasses[size],
        className,
      )}
      style={[styles.trackingCompensation, style]}
      {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  /** Evita corte da última letra com letter-spacing no Lexend Giga. */
  trackingCompensation: {
    flexShrink: 0,
    paddingRight: 4,
  },
});
