import { GradientFill } from '@/components/GradientFill';
import { Rating } from '@/components/Rating';
import { colors, layout } from '@/constants/theme';
import type { Avaliacao } from '@/types';
import { Quote } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

interface ReviewCardProps {
  avaliacao: Avaliacao;
}

export function ReviewCard({ avaliacao }: ReviewCardProps) {
  return (
    <GradientFill variant="card" rounded style={styles.card}>
      <View
        style={styles.content}
        accessibilityRole="text"
        accessibilityLabel={`Avaliação de ${avaliacao.nomeUsuario}: ${avaliacao.comentario}`}>
        <View style={styles.header}>
          <Text style={styles.name}>{avaliacao.nomeUsuario}</Text>
          <Rating nota={avaliacao.nota} />
        </View>
        <Text style={styles.comment} numberOfLines={4}>
          {avaliacao.comentario}
        </Text>
        <View pointerEvents="none" style={styles.iconDecor}>
          <Quote
            aria-hidden={true}
            size={72}
            color={colors.border}
            fill={colors.border}
            strokeWidth={0}
          />
        </View>
      </View>
    </GradientFill>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: layout.reviewCardHeight,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 20,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  name: {
    flex: 1,
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  comment: {
    marginTop: 10,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  iconDecor: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    opacity: 0.4,
  },
});
