import { cn } from '@/lib/cn';
import type { NivelSeguranca } from '@/types';
import { Text, View } from 'react-native';

const labels: Record<NivelSeguranca, string> = {
  seguro: 'Seguro',
  moderado: 'Moderado',
  atencao: 'Atenção',
};

interface SafetyBadgeProps {
  nivel: NivelSeguranca;
  className?: string;
}

export function SafetyBadge({ nivel, className }: SafetyBadgeProps) {
  return (
    <View className={cn('self-start rounded-full bg-elevated px-3 py-1', className)}>
      <Text className="font-poppins text-xs font-semibold text-text-primary">{labels[nivel]}</Text>
    </View>
  );
}
