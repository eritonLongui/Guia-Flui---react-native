import { Button } from '@/components/Button';
import { colors, spacing } from '@/constants/theme';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  actionLabel?: string;
  actionHint?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  actionHint,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.inner}>
        <View style={styles.icon}>{icon}</View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {actionLabel && onAction ? (
          <Button
            label={actionLabel}
            accessibilityHint={actionHint}
            onPress={onAction}
            className="mt-8 w-full"
          />
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 320,
  },
  inner: {
    width: '100%',
    alignItems: 'center',
  },
  icon: {
    height: 72,
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    backgroundColor: colors.chipBackground,
  },
  title: {
    marginTop: spacing.xl,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: spacing.sm,
    maxWidth: 280,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: colors.textMuted,
  },
});
