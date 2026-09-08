import { GradientFill } from '@/components/GradientFill';
import { colors, layout } from '@/constants/theme';
import { criarRotuloVeiculo } from '@/lib/a11y';
import type { Veiculo } from '@/types';
import { Battery, Car, Zap } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

interface VehicleCardProps {
  veiculo: Veiculo;
}

export function VehicleCard({ veiculo }: VehicleCardProps) {
  const conector = veiculo.tiposConector[0] ?? 'N/A';

  return (
    <GradientFill variant="card" rounded={layout.cardRadius} style={styles.card}>
      <View
        style={styles.inner}
        accessible
        accessibilityRole="text"
        accessibilityLabel={criarRotuloVeiculo(veiculo.marca, veiculo.modelo, veiculo.autonomiaKm)}>
        <View style={styles.copy}>
          <Text style={styles.kicker}>Meu carro</Text>
          <View style={styles.nameRow}>
            <View style={styles.iconWrap}>
              <Car aria-hidden={true} size={22} color={colors.accent} strokeWidth={2.2} />
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {veiculo.marca} {veiculo.modelo}
            </Text>
          </View>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Battery aria-hidden={true} size={18} color={colors.textPrimary} strokeWidth={2.2} />
              <Text style={styles.statText}>{veiculo.autonomiaKm} km</Text>
            </View>
            <View style={styles.stat}>
              <Zap aria-hidden={true} size={18} color={colors.textPrimary} strokeWidth={2.2} />
              <Text style={styles.statText}>{conector}</Text>
            </View>
          </View>
        </View>
      </View>
    </GradientFill>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  inner: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  copy: {
    gap: 8,
  },
  kicker: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 22,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'LexendGiga_600SemiBold',
    fontSize: 22,
    lineHeight: 28,
    includeFontPadding: false,
    color: colors.textPrimary,
  },
  stats: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});
