import { chipBadge } from '@/constants/chipBadge';
import type { NivelSeguranca } from '@/types';
import { StyleSheet, Text, View } from 'react-native';

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
    <View style={styles.chip} className={className}>
      <Text style={styles.label}>{labels[nivel]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: chipBadge.container,
  label: chipBadge.label,
});
