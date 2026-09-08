import { CompatibilityMark, corCompatibilidade } from '@/components/CompatibilityMark';
import { GradientFill } from '@/components/GradientFill';
import { OpenNowBadge } from '@/components/OpenNowBadge';
import { Rating } from '@/components/Rating';
import { colors, layout } from '@/constants/theme';
import { criarRotuloCompatibilidade, criarRotuloEletroposto } from '@/lib/a11y';
import { formatarDistancia } from '@/lib/formatadores';
import type { Eletroposto } from '@/types';
import { ChevronRight, MapPin, Star } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface StationCardProps {
  eletroposto: Eletroposto;
  onPress?: () => void;
  compact?: boolean;
  carousel?: boolean;
}

export function StationCard({
  eletroposto,
  onPress,
  carousel = false,
}: StationCardProps) {
  const zapColor = corCompatibilidade(eletroposto.nivelCompatibilidade);
  const temAvaliacoes = eletroposto.quantidadeAvaliacoes > 0;

  const content = (
    <GradientFill
      variant="card"
      rounded={layout.cardRadius}
      style={[styles.card, carousel && styles.carouselCard]}>
      <View
        style={[styles.inner, carousel && styles.innerFixed]}
        aria-hidden={true}
        importantForAccessibility="no">
        <View style={styles.top}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={2}>
              {eletroposto.nome}
            </Text>
            <View
              style={styles.zap}
              accessibilityRole="image"
              accessibilityLabel={criarRotuloCompatibilidade(eletroposto.nivelCompatibilidade)}>
              <CompatibilityMark
                nivel={eletroposto.nivelCompatibilidade}
                size={22}
                color={zapColor}
              />
            </View>
          </View>

          {temAvaliacoes ? (
            <Rating nota={eletroposto.nota} quantidadeAvaliacoes={eletroposto.quantidadeAvaliacoes} />
          ) : (
            <View style={styles.noRating}>
              <Star aria-hidden={true} size={13} color={colors.warning} fill={colors.warning} />
              <Text style={styles.noRatingText}>Sem avaliação</Text>
            </View>
          )}

          <View style={styles.addressRow}>
            <View style={styles.addressWrap}>
              <MapPin aria-hidden={true} size={14} color={colors.textMuted} />
              <Text style={styles.address} numberOfLines={1}>
                {eletroposto.endereco}
              </Text>
            </View>
            {eletroposto.distanciaKm !== undefined ? (
              <Text style={styles.distance}>{formatarDistancia(eletroposto.distanciaKm)}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.footer}>
          <OpenNowBadge aberto={eletroposto.abertoAgora} style={styles.badge} />
          <View style={styles.arrowBtn}>
            <ChevronRight aria-hidden={true} size={16} color={colors.textMuted} strokeWidth={2.2} />
          </View>
        </View>
      </View>
    </GradientFill>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={carousel ? styles.carouselPressable : undefined}
        accessibilityRole="button"
        accessibilityLabel={criarRotuloEletroposto(eletroposto)}
        accessibilityHint="Abre os detalhes do eletroposto">
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'column',
  },
  carouselPressable: {
    height: layout.carouselCardHeight,
  },
  carouselCard: {
    height: layout.carouselCardHeight,
  },
  inner: {
    padding: 18,
    gap: 14,
  },
  innerFixed: {
    flex: 1,
    justifyContent: 'space-between',
  },
  top: {
    gap: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  name: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: 0.2,
    includeFontPadding: false,
    color: colors.textPrimary,
  },
  zap: {
    flexShrink: 0,
    width: 22,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noRating: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  noRatingText: {
    marginLeft: 6,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addressWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  address: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  distance: {
    flexShrink: 0,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  badge: {
    alignSelf: 'center',
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.chipBackground,
  },
});
