import { colors } from '@/constants/theme';
import { Zap } from 'lucide-react-native';
import { Platform, StyleSheet, View } from 'react-native';

const PIN_SIZE = 40;

interface MapMarkerPinProps {
  selected?: boolean;
}

export function MapMarkerPin({ selected = false }: MapMarkerPinProps) {
  return (
    <View style={[styles.pin, selected && styles.pinSelected]}>
      <Zap
        size={20}
        color={selected ? colors.background : colors.accent}
        fill={selected ? colors.background : colors.accent}
        strokeWidth={2}
      />
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
    borderColor: colors.accent,
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
  pinSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
});
