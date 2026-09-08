import { chipBadge } from '@/constants/chipBadge';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';

export function OpenNowBadge({
  aberto = true,
  style,
}: {
  aberto?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const label = aberto ? 'Aberto agora' : 'Fechado';

  return (
    <View style={[styles.chip, style]} accessibilityRole="text" accessibilityLabel={label}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    ...chipBadge.container,
    borderRadius: 999,
  },
  label: {
    ...chipBadge.label,
  },
});
