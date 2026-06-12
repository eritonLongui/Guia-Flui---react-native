import { StyleSheet } from 'react-native';
import { Colors, Spacing, Layout, Typography } from '../../styles/theme';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardDark,
    borderRadius: Layout.borderRadius.lg,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.grey800,
    ...Layout.shadow,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.regular,
    color: Colors.textSecondaryDark,
    marginBottom: Spacing.sm,
  },
  content: {
    marginTop: Spacing.xs,
  },
});
