import { cn } from '@/lib/cn';
import type { NivelCompatibilidade } from '@/types';
import { Text, View } from 'react-native';

const labels: Record<NivelCompatibilidade, string> = {
  compativel: 'Compatível',
  parcial: 'Parcial',
  incompativel: 'Incompatível',
};

const styles: Record<NivelCompatibilidade, string> = {
  compativel: 'bg-accent/20 border-accent',
  parcial: 'bg-warning/20 border-warning',
  incompativel: 'bg-danger/20 border-danger',
};

const textStyles: Record<NivelCompatibilidade, string> = {
  compativel: 'text-accent',
  parcial: 'text-warning',
  incompativel: 'text-danger',
};

interface CompatibilityBadgeProps {
  nivel: NivelCompatibilidade;
  className?: string;
}

export function CompatibilityBadge({ nivel, className }: CompatibilityBadgeProps) {
  return (
    <View className={cn('rounded-full border px-3 py-1', styles[nivel], className)}>
      <Text className={cn('font-inter text-xs font-semibold', textStyles[nivel])}>
        {labels[nivel]}
      </Text>
    </View>
  );
}
