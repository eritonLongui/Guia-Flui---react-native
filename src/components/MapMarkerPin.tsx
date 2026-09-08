import { CompatibilityMark, corCompatibilidade } from '@/components/CompatibilityMark';
import { colors } from '@/constants/theme';
import type { NivelCompatibilidade } from '@/types';
import { Platform, StyleSheet, View } from 'react-native';

export const MAP_MARKER_VIEW_SIZE = 40;
const PIN_SIZE = 40;

interface MapMarkerPinProps {
  selected?: boolean;
  nivelCompatibilidade?: NivelCompatibilidade;
}

export function MapMarkerPin({
  selected = false,
  nivelCompatibilidade = 'compativel',
}: MapMarkerPinProps) {
  const borderColor = corCompatibilidade(nivelCompatibilidade);
  const iconColor = selected ? colors.backgroundEnd : borderColor;
  const parcial = nivelCompatibilidade === 'parcial';

  return (
    <View
      collapsable={false}
      style={[
        styles.pin,
        { borderColor },
        selected && { backgroundColor: borderColor },
        parcial && styles.pinParcial,
      ]}>
      <CompatibilityMark nivel={nivelCompatibilidade} size={18} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  pinParcial: {
    borderStyle: 'dashed',
  },
});
