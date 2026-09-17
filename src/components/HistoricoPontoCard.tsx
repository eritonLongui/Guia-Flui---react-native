import { CompatibilityMark, corCompatibilidade } from '@/components/CompatibilityMark';
import { GradientFill } from '@/components/GradientFill';
import { OpenNowBadge } from '@/components/OpenNowBadge';
import { colors, layout, spacing } from '@/constants/theme';
import { criarRotuloEletroposto } from '@/lib/a11y';
import type { Eletroposto } from '@/types';
import { ChevronRight, Clock, MapPin } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface HistoricoPontoCardProps {
  eletroposto?: Eletroposto;
  tituloFallback: string;
  vistoEm: string;
  onPress: () => void;
}

export function HistoricoPontoCard({
  eletroposto,
  tituloFallback,
  vistoEm,
  onPress,
}: HistoricoPontoCardProps) {
  const nome = eletroposto?.nome ?? tituloFallback;
  const rotulo = eletroposto
    ? `${criarRotuloEletroposto(eletroposto)}, visto ${vistoEm}`
    : `${nome}, visto ${vistoEm}`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      accessibilityHint="Abre os detalhes do eletroposto">
      <GradientFill variant="card" rounded={layout.cardRadius} style={styles.card}>
        <View style={styles.inner}>
          <View style={styles.topo}>
            <Text style={styles.nome} numberOfLines={2}>
              {nome}
            </Text>
            {eletroposto ? (
              <CompatibilityMark
                nivel={eletroposto.nivelCompatibilidade}
                size={20}
                color={corCompatibilidade(eletroposto.nivelCompatibilidade)}
              />
            ) : null}
          </View>

          {eletroposto?.endereco ? (
            <View style={styles.enderecoRow}>
              <MapPin aria-hidden={true} size={14} color={colors.textMuted} />
              <Text style={styles.endereco} numberOfLines={1}>
                {eletroposto.endereco}
              </Text>
            </View>
          ) : null}

          <View style={styles.rodape}>
            {eletroposto ? <OpenNowBadge aberto={eletroposto.abertoAgora} /> : <View />}
            <View style={styles.visto}>
              <Clock aria-hidden={true} size={13} color={colors.textMuted} />
              <Text style={styles.vistoTexto}>{vistoEm}</Text>
              <View style={styles.seta}>
                <ChevronRight aria-hidden={true} size={16} color={colors.textMuted} strokeWidth={2.2} />
              </View>
            </View>
          </View>
        </View>
      </GradientFill>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  inner: {
    padding: 16,
    gap: 10,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nome: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  enderecoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  endereco: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  visto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vistoTexto: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: colors.textMuted,
  },
  seta: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.chipBackground,
    marginLeft: spacing.xs,
  },
});
