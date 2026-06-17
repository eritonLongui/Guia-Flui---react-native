import { cn } from '@/lib/cn';
import type { NivelCompatibilidade } from '@/types';
import { StyleSheet, Text, View } from 'react-native';

const labels: Record<NivelCompatibilidade, string> = {
  compativel: 'Compatível',
  parcial: 'Parcial',
  incompativel: 'Incompatível',
};

const containerStyles: Record<NivelCompatibilidade, string> = {
  compativel: 'bg-accent/20',
  parcial: 'bg-warning/20',
  incompativel: 'bg-danger/20',
};

const textStyles: Record<NivelCompatibilidade, string> = {
  compativel: 'text-accent',
  parcial: 'text-warning',
  incompativel: 'text-danger',
};

interface CompatibilityBadgeProps {
  nivel: NivelCompatibilidade;
  className?: string;
}

export function CompatibilityBadge({ nivel, className }: CompatibilityBadgeProps) {
  return (
    <View style={styles.badge} className={cn('px-3 py-1', containerStyles[nivel], className)}>
      <Text
        className={cn(
          'font-poppins-bold text-xs uppercase tracking-badge',
          textStyles[nivel],
        )}>
        {labels[nivel]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexGrow: 0,
    flexShrink: 0,
    borderRadius: 4,
  },
});
