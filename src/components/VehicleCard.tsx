import { FeatureChip } from '@/components/FeatureChip';
import { colors } from '@/constants/theme';
import type { Veiculo } from '@/types';
import { Battery, Zap } from 'lucide-react-native';
import { Text, View } from 'react-native';

interface VehicleCardProps {
  veiculo: Veiculo;
}

export function VehicleCard({ veiculo }: VehicleCardProps) {
  return (
    <View className="rounded-card border border-border bg-surface p-5">
      <Text className="font-poppins text-xs uppercase tracking-wider text-text-muted">
        Veículo ativo
      </Text>
      <Text className="mt-2 font-poppins text-xl text-text-primary">
        {veiculo.marca} {veiculo.modelo}
      </Text>
      <View className="mt-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Battery size={18} color={colors.accent} />
          <Text className="font-inter text-base text-text-secondary">
            {veiculo.autonomiaKm} km
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Zap size={18} color={colors.accent} />
          <FeatureChip label={veiculo.tiposConector[0] ?? 'N/A'} />
        </View>
      </View>
    </View>
  );
}
