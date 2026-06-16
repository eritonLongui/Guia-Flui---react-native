import { cn } from '@/lib/cn';
import { Pressable, Text, type PressableProps } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends PressableProps {
  variant?: ButtonVariant;
  label: string;
  className?: string;
}

const variantStyles: Record<ButtonVariant, { container: string; text: string }> = {
  primary: { container: 'bg-accent', text: 'text-background' },
  secondary: { container: 'bg-surface border border-border', text: 'text-text-primary' },
  ghost: { container: 'bg-transparent', text: 'text-text-primary' },
};

export function Button({ variant = 'primary', label, className, disabled, ...props }: ButtonProps) {
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
      {...props}>
      <Text className={cn('font-inter text-base font-semibold', styles.text)}>{label}</Text>
    </Pressable>
  );
}
