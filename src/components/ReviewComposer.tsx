import { Button } from '@/components/Button';
import { GradientFill } from '@/components/GradientFill';
import { colors, spacing } from '@/constants/theme';
import {
  mediaNotas,
  parseAvaliacaoComentario,
  TOPICOS_AVALIACAO,
  type NotasPorTopico,
  type TopicoAvaliacao,
} from '@/lib/avaliacaoFormato';
import { Star } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface ReviewComposerProps {
  comentarioInicial?: string;
  enviando?: boolean;
  onSubmit: (nota: number, comentario: string, notasPorTopico: NotasPorTopico) => void;
}

function AnimatedStar({
  ativa,
  index,
  valor,
  onPress,
  label,
}: {
  ativa: boolean;
  index: number;
  valor: number;
  onPress: () => void;
  label: string;
}) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(ativa ? 1 : 0);

  useEffect(() => {
    if (ativa) {
      const delay = (index - 1) * 42;
      scale.value = withDelay(
        delay,
        withSequence(
          withSpring(1.28, { damping: 9, stiffness: 260 }),
          withSpring(1, { damping: 12, stiffness: 220 }),
        ),
      );
      glow.value = withDelay(delay, withTiming(1, { duration: 160 }));
    } else {
      scale.value = withSpring(1, { damping: 14, stiffness: 200 });
      glow.value = withTiming(0, { duration: 120 });
    }
  }, [ativa, glow, index, scale, valor]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 0.45 + glow.value * 0.55,
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${index} ${index === 1 ? 'estrela' : 'estrelas'}`}
      onPress={onPress}
      hitSlop={8}
      style={styles.starButton}>
      <Animated.View style={animatedStyle}>
        <Star
          size={28}
          color={ativa ? colors.accent : colors.border}
          fill={ativa ? colors.accent : 'transparent'}
          strokeWidth={ativa ? 0 : 1.8}
        />
      </Animated.View>
    </Pressable>
  );
}

function StarRow({
  label,
  valor,
  onChange,
}: {
  label: string;
  valor: number;
  onChange: (nota: number) => void;
}) {
  return (
    <View style={styles.topicRow}>
      <Text style={styles.topicLabel}>{label}</Text>
      <View
        style={styles.stars}
        accessibilityRole="adjustable"
        accessibilityLabel={`${label}: ${valor || 'sem nota'} de 5`}>
        {[1, 2, 3, 4, 5].map((estrela) => (
          <AnimatedStar
            key={estrela}
            label={label}
            index={estrela}
            valor={valor}
            ativa={estrela <= valor}
            onPress={() => onChange(estrela)}
          />
        ))}
      </View>
    </View>
  );
}

export function ReviewComposer({
  comentarioInicial = '',
  enviando = false,
  onSubmit,
}: ReviewComposerProps) {
  const inicial = useMemo(
    () => parseAvaliacaoComentario(comentarioInicial),
    [comentarioInicial],
  );
  const [notas, setNotas] = useState<NotasPorTopico>(inicial.notas);
  const [comentario, setComentario] = useState(inicial.texto);

  const media = mediaNotas(notas);
  const completo = TOPICOS_AVALIACAO.every((topico) => (notas[topico] ?? 0) >= 1);

  const setNotaTopico = (topico: TopicoAvaliacao, valor: number) => {
    setNotas((atual) => ({ ...atual, [topico]: valor }));
  };

  return (
    <View style={styles.root}>
      <GradientFill variant="card" rounded style={styles.summaryCard}>
        <View style={styles.summaryInner}>
          <Text style={styles.summaryLabel}>Média geral</Text>
          <Text style={styles.summaryScore}>{completo ? media.toFixed(1) : '—'}</Text>
          <Text style={styles.summaryHint}>
            {completo ? 'Calculada pelos tópicos' : 'Preencha todos os tópicos'}
          </Text>
        </View>
      </GradientFill>

      <Text style={styles.sectionLabel}>Avalie cada tópico</Text>
      <GradientFill variant="card" rounded>
        <View style={styles.topicsCard}>
          {TOPICOS_AVALIACAO.map((topico, index) => (
            <View key={topico}>
              <StarRow
                label={topico}
                valor={notas[topico] ?? 0}
                onChange={(valor) => setNotaTopico(topico, valor)}
              />
              {index < TOPICOS_AVALIACAO.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </View>
      </GradientFill>

      <Text style={styles.sectionLabel}>Comentário (opcional)</Text>
      <TextInput
        value={comentario}
        onChangeText={setComentario}
        placeholder="Conte mais detalhes da sua experiência..."
        placeholderTextColor={colors.textMuted}
        multiline
        textAlignVertical="top"
        style={styles.input}
        accessibilityLabel="Comentário da avaliação"
      />

      <View style={styles.actions}>
        <Button
          label={enviando ? 'Publicando...' : 'Publicar'}
          disabled={enviando || !completo}
          onPress={() => onSubmit(media, comentario.trim(), notas)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  summaryCard: {
    marginTop: spacing.md,
  },
  summaryInner: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  summaryLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summaryScore: {
    marginTop: spacing.sm,
    fontFamily: 'Poppins_700Bold',
    fontSize: 40,
    color: colors.accent,
  },
  summaryHint: {
    marginTop: spacing.xs,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionLabel: {
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  topicsCard: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  topicRow: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  topicLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  starButton: {
    padding: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  input: {
    minHeight: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceEnd,
    color: colors.textPrimary,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    textAlign: 'left',
  },
  actions: {
    marginTop: spacing.xxl,
  },
});
