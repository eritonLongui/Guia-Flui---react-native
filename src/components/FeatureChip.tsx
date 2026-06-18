import { chipBadge } from '@/constants/chipBadge';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

interface FeatureChipProps {
  label: string;
  className?: string;
  style?: ViewStyle;
}

export function FeatureChip({ label, className, style }: FeatureChipProps) {
  return (
    <View style={[styles.chip, style]} className={className}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: chipBadge.container,
  label: chipBadge.label,
});
