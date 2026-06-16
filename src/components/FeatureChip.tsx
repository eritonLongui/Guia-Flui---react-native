import { cn } from '@/lib/cn';
import { Text, View } from 'react-native';

interface FeatureChipProps {
  label: string;
  className?: string;
}

export function FeatureChip({ label, className }: FeatureChipProps) {
  return (
    <View className={cn('rounded-full bg-elevated px-3 py-1.5', className)}>
      <Text className="font-inter text-xs text-text-secondary">{label}</Text>
    </View>
  );
}
