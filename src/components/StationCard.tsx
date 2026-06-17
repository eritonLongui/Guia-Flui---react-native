import { CompatibilityBadge } from '@/components/CompatibilityBadge';
import { FeatureChip } from '@/components/FeatureChip';
import { formatarDistancia } from '@/lib/formatadores';
import { cn } from '@/lib/cn';
import type { Eletroposto } from '@/types';
import { Clock, MapPin, Zap } from 'lucide-react-native';
import { colors, layout } from '@/constants/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface StationCardProps {
  eletroposto: Eletroposto;
  onPress?: () => void;
  compact?: boolean;
  carousel?: boolean;
  className?: string;
}

export function StationCard({
  eletroposto,
  onPress,
  compact = false,
  carousel = false,
  className,
}: StationCardProps) {
  const content = (
    <View
      className={cn('rounded-card bg-surface p-4', className)}
      style={[
        styles.card,
        carousel && styles.carouselCard,
        !carousel && !compact && styles.defaultCard,
      ]}>
      <View className="flex-row items-center justify-between">
        <CompatibilityBadge nivel={eletroposto.nivelCompatibilidade} />
        {eletroposto.distanciaKm !== undefined && (
          <View style={styles.row}>
            <MapPin size={17} color={colors.textPrimary} />
            <Text style={styles.iconTextGap} className="font-poppins text-base text-text-primary">
              {formatarDistancia(eletroposto.distanciaKm)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.titleBlock}>
        <Text
          style={styles.eletropostoName}
          className="font-poppins-bold text-2xl text-text-primary"
          numberOfLines={2}>
          {eletroposto.nome}
        </Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.row}>
          <Clock size={17} color={colors.textPrimary} />
          <Text style={styles.iconTextGap} className="font-poppins text-base text-text-secondary">
            Fila {eletroposto.tempoFilaMinutos}min
          </Text>
        </View>
        <View style={[styles.row, styles.groupGap]}>
          <Zap size={17} color={colors.textPrimary} />
          <Text style={styles.iconTextGap} className="font-poppins text-base text-text-secondary">
            {eletroposto.tempoCargaMinutos}min
          </Text>
        </View>
      </View>

      {!compact && (
        <View style={[styles.chipsRow, styles.chipsBottom]}>
          {eletroposto.conectores.map((c) => (
            <FeatureChip key={c.tipo} label={c.tipo} />
          ))}
          {eletroposto.abertoAgora && <FeatureChip label="Aberto" />}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={carousel ? styles.carouselPressable : undefined}>
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
  defaultCard: {
    minHeight: layout.carouselCardHeight,
  },
  titleBlock: {
    marginTop: 12,
    minHeight: layout.carouselTitleHeight,
    justifyContent: 'flex-start',
  },
  eletropostoName: {
    letterSpacing: 1,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  chipsBottom: {
    marginTop: 'auto',
    paddingTop: 16,
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
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
