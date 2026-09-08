import { colors } from '@/constants/theme';
import { ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface SettingsRowProps {
  icon: ReactNode;
  label: string;
  onPress?: () => void;
  trailing?: ReactNode;
  last?: boolean;
  destructive?: boolean;
}

export function SettingsRow({
  icon,
  label,
  onPress,
  trailing,
  last,
  destructive,
}: SettingsRowProps) {
  const labelColor = destructive ? colors.danger : colors.textPrimary;

  return (
    <Pressable
      style={[styles.row, !last && styles.rowBorder]}
      onPress={onPress}
      disabled={!onPress && !trailing}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !onPress && !trailing }}>
      <View style={styles.left} aria-hidden={true}>
        {icon}
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      </View>
      {trailing ??
        (onPress ? (
          <View style={styles.arrowBtn}>
            <ChevronRight aria-hidden={true} size={16} color={colors.textMuted} strokeWidth={2.2} />
          </View>
        ) : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  left: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    lineHeight: 22,
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.chipBackground,
  },
});
