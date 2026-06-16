import { CompatibilityBadge } from '@/components/CompatibilityBadge';
import { FeatureChip } from '@/components/FeatureChip';
import { Rating } from '@/components/Rating';
import { formatarDistancia } from '@/lib/formatadores';
import { cn } from '@/lib/cn';
import type { Eletroposto } from '@/types';
import { Clock, Zap } from 'lucide-react-native';
import { colors } from '@/constants/theme';
import { Pressable, Text, View } from 'react-native';

interface StationCardProps {
  eletroposto: Eletroposto;
  onPress?: () => void;
  compact?: boolean;
  className?: string;
}

export function StationCard({ eletroposto, onPress, compact = false, className }: StationCardProps) {
  const content = (
    <View
      className={cn(
        'rounded-card border border-border bg-surface p-4',
        !compact && 'min-h-[140px]',
        className,
      )}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="font-poppins text-base text-text-primary" numberOfLines={1}>
            {eletroposto.nome}
          </Text>
          {eletroposto.distanciaKm !== undefined && (
            <Text className="mt-1 font-inter text-xs text-text-muted">
              {formatarDistancia(eletroposto.distanciaKm)}
            </Text>
          )}
        </View>
        <CompatibilityBadge nivel={eletroposto.nivelCompatibilidade} />
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <Rating nota={eletroposto.nota} />
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1">
            <Clock size={14} color={colors.textMuted} />
            <Text className="font-inter text-xs text-text-secondary">
              Fila {eletroposto.tempoFilaMinutos}min
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Zap size={14} color={colors.textMuted} />
            <Text className="font-inter text-xs text-text-secondary">
              {eletroposto.tempoCargaMinutos}min
            </Text>
          </View>
        </View>
      </View>

      {!compact && (
        <View className="mt-3 flex-row flex-wrap gap-2">
          {eletroposto.conectores.map((c) => (
            <FeatureChip key={c.tipo} label={c.tipo} />
          ))}
          {eletroposto.abertoAgora && <FeatureChip label="Aberto" />}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}
