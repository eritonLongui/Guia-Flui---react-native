import { GradientFill } from '@/components/GradientFill';
import { colors, layout } from '@/constants/theme';
import type { Conector } from '@/types';
import { Plug } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ConnectorCardProps {
  conector: Conector;
}

function formatarUnidades(quantidade: number): string {
  return quantidade === 1 ? '1 unidade' : `${quantidade} unidades`;
}

function ConnectorAccent() {
  return (
    <View
      pointerEvents="none"
      style={styles.art}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <Svg width={188} height={168} viewBox="0 0 160 180" style={styles.curve}>
        <Path
          d="M144 -16 C 78 28, 186 64, 98 102 C 22 136, 142 156, 76 192"
          stroke={colors.accent}
          strokeWidth={24}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

export function ConnectorCard({ conector }: ConnectorCardProps) {
  const unidades = formatarUnidades(conector.quantidade);
  const subtexto = `${conector.potenciaKw} kW · ${unidades}`;

  return (
    <GradientFill variant="card" rounded={layout.cardRadius} style={styles.card}>
      <ConnectorAccent />
      <View
        style={styles.content}
        accessibilityRole="text"
        accessibilityLabel={`${conector.tipo}, ${conector.potenciaKw} quilowatts, ${unidades}`}>
        <View style={styles.titleRow}>
          <Plug aria-hidden={true} size={22} color={colors.accent} strokeWidth={2.2} />
          <Text style={styles.name} numberOfLines={1}>
            {conector.tipo}
          </Text>
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {subtexto}
        </Text>
      </View>
    </GradientFill>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    overflow: 'hidden',
  },
  art: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 0,
  },
  curve: {
    position: 'absolute',
    right: -12,
    top: -22,
  },
  content: {
    flex: 1,
    zIndex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    paddingRight: 64,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    lineHeight: 32,
    includeFontPadding: false,
    color: colors.textPrimary,
  },
  meta: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});
