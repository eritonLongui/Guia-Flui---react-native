import { EmptyState } from '@/components/EmptyState';
import { GradientFill } from '@/components/GradientFill';
import { HistoricoPontoCard } from '@/components/HistoricoPontoCard';
import { SettingsScreen } from '@/components/SettingsScreen';
import { colors, layout, spacing } from '@/constants/theme';
import { formatarDataCurta } from '@/lib/formatadores';
import { hidratarEletropostosPorIds } from '@/lib/hidratarEletropostos';
import { useHistoricoLocal } from '@/lib/historicoLocal';
import { useExplorarQuery } from '@/providers/ExplorarQueryProvider';
import type { Eletroposto } from '@/types';
import { router, useFocusEffect } from 'expo-router';
import { Clock, Eye, Search } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function PerfilRecentesScreen() {
  const { setBusca } = useExplorarQuery();
  const { pontos, buscas, limparPontos, limparBuscas } = useHistoricoLocal();
  const [eletropostos, setEletropostos] = useState<Map<string, Eletroposto>>(new Map());

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      hidratarEletropostosPorIds(pontos.map((p) => p.id))
        .then((mapa) => {
          if (mounted) setEletropostos(mapa);
        })
        .catch(() => {
          if (mounted) setEletropostos(new Map());
        });
      return () => {
        mounted = false;
      };
    }, [pontos]),
  );

  const abrirBusca = (termo: string) => {
    setBusca(termo);
    router.push('/(tabs)/explorar');
  };

  const vazio = pontos.length === 0 && buscas.length === 0;

  return (
    <SettingsScreen title="Histórico">
      {vazio ? (
        <EmptyState
          icon={<Eye aria-hidden={true} size={28} color={colors.accent} strokeWidth={2.2} />}
          title="Nenhum ponto visto ainda."
          subtitle="Os eletropostos que você abrir e as buscas que fizer aparecem neste histórico."
          actionLabel="Explorar mapa"
          actionHint="Abre o mapa para buscar eletropostos"
          onAction={() => router.push('/(tabs)/explorar')}
        />
      ) : (
        <>
          {pontos.length > 0 ? (
            <>
              <View style={styles.cabecalho}>
                <Text style={styles.secao}>Pontos</Text>
                <Pressable onPress={limparPontos} accessibilityRole="button" accessibilityLabel="Limpar pontos recentes">
                  <Text style={styles.limpar}>Limpar</Text>
                </Pressable>
              </View>
              <View style={styles.lista}>
                {pontos.map((ponto) => (
                  <HistoricoPontoCard
                    key={ponto.id}
                    eletroposto={eletropostos.get(ponto.id)}
                    tituloFallback="Eletroposto"
                    vistoEm={formatarDataCurta(ponto.vistoEm)}
                    onPress={() => router.push(`/eletroposto/${ponto.id}`)}
                  />
                ))}
              </View>
            </>
          ) : null}

          {buscas.length > 0 ? (
            <>
              <View style={[styles.cabecalho, pontos.length > 0 && styles.cabecalhoDepois]}>
                <Text style={styles.secao}>Buscas</Text>
                <Pressable onPress={limparBuscas} accessibilityRole="button" accessibilityLabel="Limpar buscas recentes">
                  <Text style={styles.limpar}>Limpar</Text>
                </Pressable>
              </View>
              <View style={styles.lista}>
                {buscas.map((busca) => (
                  <Pressable
                    key={`${busca.termo}-${busca.em}`}
                    onPress={() => abrirBusca(busca.termo)}
                    accessibilityRole="button"
                    accessibilityLabel={`Buscar ${busca.termo}`}>
                    <GradientFill variant="card" rounded={layout.cardRadius} style={styles.buscaCard}>
                      <View style={styles.buscaInner}>
                        <View style={styles.buscaIcone}>
                          <Search aria-hidden={true} size={16} color={colors.accent} />
                        </View>
                        <View style={styles.buscaTexto}>
                          <Text style={styles.buscaTermo} numberOfLines={1}>
                            {busca.termo}
                          </Text>
                          <View style={styles.buscaQuando}>
                            <Clock aria-hidden={true} size={12} color={colors.textMuted} />
                            <Text style={styles.buscaData}>{formatarDataCurta(busca.em)}</Text>
                          </View>
                        </View>
                      </View>
                    </GradientFill>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}
        </>
      )}
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  cabecalhoDepois: {
    marginTop: 28,
  },
  secao: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  limpar: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: colors.accent,
  },
  lista: {
    gap: spacing.md,
  },
  buscaCard: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  buscaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  buscaIcone: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.chipBackground,
  },
  buscaTexto: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  buscaTermo: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: colors.textPrimary,
  },
  buscaQuando: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buscaData: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: colors.textMuted,
  },
});
