import { colors } from '@/constants/theme';
import { Star } from 'lucide-react-native';
import { Text, View } from 'react-native';

interface RatingProps {
  nota: number;
  quantidadeAvaliacoes?: number;
}

export function Rating({ nota, quantidadeAvaliacoes }: RatingProps) {
  return (
    <View className="flex-row items-center gap-1">
      <Star size={14} color={colors.warning} fill={colors.warning} />
      <Text className="font-inter text-sm text-text-primary">{nota.toFixed(1)}</Text>
      {quantidadeAvaliacoes !== undefined && (
        <Text className="font-inter text-xs text-text-muted">({quantidadeAvaliacoes})</Text>
      )}
    </View>
  );
}
