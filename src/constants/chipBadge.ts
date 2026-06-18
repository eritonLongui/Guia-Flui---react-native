import { colors } from '@/constants/theme';
import type { TextStyle, ViewStyle } from 'react-native';

export const chipBadge = {
  container: {
    alignSelf: 'flex-start' as const,
    flexGrow: 0,
    flexShrink: 0,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: colors.chipBackground,
  } satisfies ViewStyle,
  label: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: colors.chipText,
  } satisfies TextStyle,
};
