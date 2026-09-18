import { cn } from '@/lib/cn';
import { colors } from '@/constants/theme';
import { Pressable, Text, type PressableProps } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent';

interface ButtonProps extends PressableProps {
  variant?: ButtonVariant;
  label: string;
  className?: string;
}

const variantStyles: Record<
  ButtonVariant,
  { container: string; text: string; backgroundColor?: string }
> = {
  primary: { container: '', text: 'text-background', backgroundColor: colors.white },
  accent: { container: '', text: 'text-background', backgroundColor: colors.accent },
  secondary: { container: 'bg-elevated', text: 'text-text-primary' },
  ghost: { container: 'bg-transparent', text: 'text-text-primary' },
};

export function Button({
  variant = 'secondary',
  label,
  className,
  disabled,
  accessibilityLabel,
  accessibilityHint,
  style,
  ...props
}: ButtonProps) {
  const styles = variantStyles[variant];
  return (
    <Pressable
      className={cn(
        'h-14 items-center justify-center rounded-button px-6',
        styles.container,
        disabled && 'opacity-50',
        className,
      )}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      {...props}
      style={[styles.backgroundColor ? { backgroundColor: styles.backgroundColor } : null, style]}>
      <Text
        aria-hidden={true}
        className={cn('font-poppins-bold text-base uppercase', styles.text)}>
        {label}
      </Text>
    </Pressable>
  );
}
