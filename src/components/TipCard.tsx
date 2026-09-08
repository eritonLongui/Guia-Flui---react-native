import { GradientFill } from '@/components/GradientFill';
import { colors, layout } from '@/constants/theme';
import { Lightbulb } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const TITLE = 'Dica de recarga';
const BODY =
  'Carregue até 80% em viagens longas para preservar a bateria e reduzir o tempo de espera.';

function TipAccent() {
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

export function TipCard() {
  return (
    <GradientFill variant="card" rounded={layout.cardRadius} style={styles.card}>
      <TipAccent />
      <View
        style={styles.content}
        accessibilityRole="text"
        accessibilityLabel={`${TITLE}. ${BODY}`}>
        <View style={styles.titleRow}>
          <Lightbulb
            aria-hidden={true}
            size={26}
            color={colors.accent}
            strokeWidth={2.2}
            style={styles.icon}
          />
          <Text style={styles.title} numberOfLines={1}>
            {TITLE}
          </Text>
        </View>
        <Text style={styles.body} numberOfLines={3}>
          {BODY}
        </Text>
      </View>
    </GradientFill>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    minHeight: 132,
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
    right: -48,
    top: -18,
  },
  content: {
    flex: 1,
    zIndex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 16,
    paddingRight: 88,
    minHeight: 140,
    gap: 28,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    transform: [{ translateY: -2 }],
  },
  title: {
    flex: 1,
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    lineHeight: 22,
    includeFontPadding: false,
    textAlignVertical: 'center',
    color: colors.textPrimary,
    transform: [{ translateY: 2 }],
  },
  body: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});
