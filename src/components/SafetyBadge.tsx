import { cn } from '@/lib/cn';
import type { NivelSeguranca } from '@/types';
import { Text, View } from 'react-native';

const labels: Record<NivelSeguranca, string> = {
  seguro: 'Seguro',
  moderado: 'Moderado',
  atencao: 'Atenção',
};

const styles: Record<NivelSeguranca, string> = {
  seguro: 'bg-accent/20 border-accent',
  moderado: 'bg-warning/20 border-warning',
  atencao: 'bg-danger/20 border-danger',
};

const textStyles: Record<NivelSeguranca, string> = {
  seguro: 'text-accent',
  moderado: 'text-warning',
  atencao: 'text-danger',
};

interface SafetyBadgeProps {
  nivel: NivelSeguranca;
  className?: string;
}

export function SafetyBadge({ nivel, className }: SafetyBadgeProps) {
  return (
    <View className={cn('rounded-full border px-3 py-1', styles[nivel], className)}>
      <Text className={cn('font-inter text-xs font-semibold', textStyles[nivel])}>
        {labels[nivel]}
      </Text>
    </View>
  );
}
