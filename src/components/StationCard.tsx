import { CompatibilityBadge } from '@/components/CompatibilityBadge';
import { FeatureChip } from '@/components/FeatureChip';
import { GradientFill } from '@/components/GradientFill';
import { OpenNowBadge } from '@/components/OpenNowBadge';
import { criarRotuloEletroposto } from '@/lib/a11y';
import { formatarDistancia } from '@/lib/formatadores';
import type { Eletroposto } from '@/types';
import { Clock, MapPin, Zap } from 'lucide-react-native';
import { colors, layout } from '@/constants/theme';
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
  compact = false,
  carousel = false,
}: StationCardProps) {
  const content = (
    <GradientFill
      variant="card"
      rounded
      style={[styles.card, carousel && styles.carouselCard]}>
      <View
        style={[styles.inner, carousel && styles.innerFixed]}
        accessible={false}
        importantForAccessibility="no">
        <View style={styles.header}>
          <CompatibilityBadge nivel={eletroposto.nivelCompatibilidade} />
          {eletroposto.distanciaKm !== undefined && (
            <View style={styles.row}>
              <MapPin accessible={false} size={17} color={colors.textPrimary} />
              <Text style={styles.iconTextGap} className="font-poppins text-base text-text-primary">
                {formatarDistancia(eletroposto.distanciaKm)}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.body, carousel && styles.bodyFixed]}>
          <View style={styles.topBlock}>
            <Text
              style={styles.eletropostoName}
              className="font-poppins-bold text-2xl text-text-primary"
              numberOfLines={2}>
              {eletroposto.nome}
            </Text>
            <View style={styles.stats}>
              <View style={styles.row}>
                <Clock accessible={false} size={17} color={colors.textPrimary} />
                <Text style={styles.iconTextGap} className="font-poppins text-base text-text-secondary">
                  Fila {eletroposto.tempoFilaMinutos}min
                </Text>
              </View>
              <View style={[styles.row, styles.groupGap]}>
                <Zap accessible={false} size={17} color={colors.textPrimary} />
                <Text style={styles.iconTextGap} className="font-poppins text-base text-text-secondary">
                  {eletroposto.tempoCargaMinutos}min
                </Text>
              </View>
            </View>
          </View>

          {!compact && (
            <View style={styles.chipsRow}>
              {eletroposto.abertoAgora && <OpenNowBadge />}
              {eletroposto.conectores.map((c) => (
                <FeatureChip key={c.tipo} label={c.tipo} />
              ))}
            </View>
          )}
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
    padding: 16,
  },
  innerFixed: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  body: {
    marginTop: 12,
  },
  bodyFixed: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBlock: {
    gap: 12,
  },
  eletropostoName: {
    letterSpacing: 1,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconTextGap: {
    marginLeft: 8,
  },
  groupGap: {
    marginLeft: 20,
  },
});
