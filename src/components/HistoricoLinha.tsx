import { colors } from '@/constants/theme';
import { Rating } from '@/components/Rating';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface HistoricoLinhaProps {
  titulo: string;
  detalhe?: string;
  nota?: number;
  last?: boolean;
  onPress?: () => void;
}

export function HistoricoLinha({ titulo, detalhe, nota, last, onPress }: HistoricoLinhaProps) {
  return (
    <Pressable
      style={[styles.row, !last && styles.rowBorder]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={detalhe ? `${titulo}, ${detalhe}` : titulo}>
      <View style={styles.text}>
        <Text style={styles.titulo} numberOfLines={1}>
          {titulo}
        </Text>
        {detalhe ? (
          <Text style={styles.detalhe} numberOfLines={1}>
            {detalhe}
          </Text>
        ) : null}
      </View>
      {nota !== undefined ? <Rating nota={nota} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  text: {
    flex: 1,
    minWidth: 0,
  },
  titulo: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  detalhe: {
    marginTop: 2,
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
  },
});
