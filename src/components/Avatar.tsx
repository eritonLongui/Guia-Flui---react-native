import { colors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

interface AvatarProps {
  nome?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

function inicialDoNome(nome?: string | null): string {
  const parte = nome?.trim().split(/\s+/).find(Boolean);
  if (!parte) return '?';
  return parte.charAt(0).toLocaleUpperCase('pt-BR');
}

/** Avatar com gradiente verde da marca + inicial do nome. */
export function Avatar({ nome, size = 52, style }: AvatarProps) {
  const inicial = inicialDoNome(nome);

  return (
    <LinearGradient
      colors={[colors.accentDark, colors.accent]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel={nome?.trim() ? `Avatar de ${nome.trim()}` : 'Avatar'}>
      <Text
        style={[
          styles.initial,
          {
            fontSize: Math.round(size * 0.4),
            lineHeight: Math.round(size * 0.48),
          },
        ]}
        allowFontScaling={false}>
        {inicial}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
