import { colors } from '@/constants/theme';
import type { NivelCompatibilidade } from '@/types';
import { Zap, ZapOff } from 'lucide-react-native';

export function corCompatibilidade(nivel: NivelCompatibilidade): string {
  if (nivel === 'compativel') return colors.accent;
  if (nivel === 'incompativel') return colors.danger;
  return colors.warning;
}

export function CompatibilityMark({
  nivel,
  size,
  color,
}: {
  nivel: NivelCompatibilidade;
  size: number;
  color: string;
}) {
  if (nivel === 'incompativel') {
    return <ZapOff aria-hidden={true} size={size} color={color} strokeWidth={2.2} />;
  }
  return <Zap aria-hidden={true} size={size} color={color} fill={color} strokeWidth={2.2} />;
}
