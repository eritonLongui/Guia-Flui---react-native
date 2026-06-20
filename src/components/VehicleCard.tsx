import { GradientFill } from '@/components/GradientFill';
import { criarRotuloVeiculo } from '@/lib/a11y';
import { colors } from '@/constants/theme';
import type { Veiculo } from '@/types';
import { Battery, Car, Zap } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

interface VehicleCardProps {
  veiculo: Veiculo;
}

export function VehicleCard({ veiculo }: VehicleCardProps) {
  return (
    <GradientFill variant="card" rounded style={styles.card}>
      <View
        className="p-5"
        accessible
        accessibilityRole="text"
        accessibilityLabel={criarRotuloVeiculo(veiculo.marca, veiculo.modelo, veiculo.autonomiaKm)}>
        <Text className="font-poppins text-sm uppercase tracking-badge text-text-primary">
          Meu carro
        </Text>
        <Text className="mt-2 font-lexend-giga text-2xl text-text-primary">
          {veiculo.marca} {veiculo.modelo}
        </Text>
        <View className="mt-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Battery size={18} color={colors.textPrimary} />
            <Text className="font-poppins text-base text-text-secondary">
              {veiculo.autonomiaKm} km
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Zap size={18} color={colors.textPrimary} />
            <Text style={styles.connector} className="font-poppins text-base text-text-secondary">
              {veiculo.tiposConector[0] ?? 'N/A'}
            </Text>
          </View>
        </View>
        <View pointerEvents="none" style={styles.iconDecor}>
          <Car size={108} color={colors.border} strokeWidth={1.25} />
        </View>
      </View>
    </GradientFill>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    position: 'relative',
  },
  iconDecor: {
    position: 'absolute',
    top: -20,
    right: -14,
    opacity: 0.45,
  },
  connector: {
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
