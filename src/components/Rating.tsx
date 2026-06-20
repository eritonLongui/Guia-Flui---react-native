import { criarRotuloAvaliacao } from '@/lib/a11y';
import { colors } from '@/constants/theme';
import { Star } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

interface RatingProps {
  nota: number;
  quantidadeAvaliacoes?: number;
}

export function Rating({ nota, quantidadeAvaliacoes }: RatingProps) {
  return (
    <View
      style={styles.row}
      accessibilityRole="text"
      accessibilityLabel={criarRotuloAvaliacao(nota, quantidadeAvaliacoes)}>
      <Star aria-hidden={true} size={13} color={colors.warning} fill={colors.warning} />
      <Text aria-hidden={true} style={styles.score} className="font-poppins-bold text-sm text-warning">
        {nota.toFixed(1)}
      </Text>
      {quantidadeAvaliacoes !== undefined && (
        <Text aria-hidden={true} style={styles.count} className="font-poppins text-sm text-text-muted">
          ({quantidadeAvaliacoes})
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  score: {
    marginLeft: 6,
  },
  count: {
    marginLeft: 4,
  },
});
