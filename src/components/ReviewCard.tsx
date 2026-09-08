import { GradientFill } from '@/components/GradientFill';
import { Rating } from '@/components/Rating';
import { colors, layout } from '@/constants/theme';
import { formatarResumoNotas, parseAvaliacaoComentario } from '@/lib/avaliacaoFormato';
import type { Avaliacao } from '@/types';
import { Quote } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

interface ReviewCardProps {
  avaliacao: Avaliacao;
}

export function ReviewCard({ avaliacao }: ReviewCardProps) {
  const parsed = parseAvaliacaoComentario(avaliacao.comentario);
  const resumo = formatarResumoNotas(parsed.notas);
  const texto = parsed.texto || resumo || 'Sem comentário';

  return (
    <GradientFill variant="card" rounded style={styles.card}>
      <View
        style={styles.content}
        accessibilityRole="text"
        accessibilityLabel={`Avaliação de ${avaliacao.nomeUsuario}: ${texto}`}>
        <View style={styles.header}>
          <Text style={styles.name}>{avaliacao.nomeUsuario}</Text>
          <Rating nota={avaliacao.nota} />
        </View>
        {resumo && parsed.texto ? (
          <Text style={styles.topics} numberOfLines={2}>
            {resumo}
          </Text>
        ) : null}
        <Text style={styles.comment} numberOfLines={resumo && parsed.texto ? 3 : 4}>
          {texto}
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
  topics: {
    marginTop: 8,
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 16,
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
