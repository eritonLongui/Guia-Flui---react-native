import { EmptyState } from '@/components/EmptyState';
import { GradientFill } from '@/components/GradientFill';
import { HistoricoLinha } from '@/components/HistoricoLinha';
import { SettingsScreen } from '@/components/SettingsScreen';
import { colors, layout } from '@/constants/theme';
import { parseAvaliacaoComentario } from '@/lib/avaliacaoFormato';
import { formatarDataCurta } from '@/lib/formatadores';
import { hidratarEletropostosPorIds } from '@/lib/hidratarEletropostos';
import { useAuth } from '@/providers/AuthProvider';
import { avaliacaoRepository, usuarioRepository } from '@/repositories';
import type { Avaliacao, Eletroposto } from '@/types';
import { router, useFocusEffect } from 'expo-router';
import { Star } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function PerfilAvaliacoesScreen() {
  const { usuario: usuarioAuth } = useAuth();
  const [carregando, setCarregando] = useState(true);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [eletropostos, setEletropostos] = useState<Map<string, Eletroposto>>(new Map());

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        const usuario = (await usuarioRepository.obterAtual()) ?? usuarioAuth;
        if (!usuario) {
          if (mounted) {
            setAvaliacoes([]);
            setCarregando(false);
          }
          return;
        }
        const avs = await avaliacaoRepository.listarPorUsuario(usuario.id).catch(() => []);
        if (!mounted) return;
        setAvaliacoes(avs);
        const mapa = await hidratarEletropostosPorIds(avs.map((a) => a.eletropostoId)).catch(
          () => new Map<string, Eletroposto>(),
        );
        if (!mounted) return;
        setEletropostos(mapa);
        setCarregando(false);
      })();
      return () => {
        mounted = false;
      };
    }, [usuarioAuth]),
  );

  return (
    <SettingsScreen title="Minhas avaliações">
      {carregando ? (
        <View style={styles.estado} accessibilityRole="progressbar" accessibilityLabel="Carregando">
          <ActivityIndicator aria-hidden={true} color={colors.textPrimary} />
        </View>
      ) : avaliacoes.length === 0 ? (
        <EmptyState
          icon={<Star aria-hidden={true} size={28} color={colors.accent} strokeWidth={2.2} />}
          title="Nenhuma avaliação ainda."
          subtitle="Depois de recarregar, avalie o eletroposto para acompanhar suas notas aqui."
          actionLabel="Encontrar recarga"
          actionHint="Abre o mapa para buscar eletropostos"
          onAction={() => router.push('/(tabs)/explorar')}
        />
      ) : (
        <GradientFill variant="card" rounded={layout.cardRadius}>
          <View style={styles.inner}>
            {avaliacoes.map((av, index) => {
              const texto = parseAvaliacaoComentario(av.comentario).texto;
              return (
                <HistoricoLinha
                  key={av.id}
                  titulo={eletropostos.get(av.eletropostoId)?.nome ?? 'Eletroposto'}
                  detalhe={[formatarDataCurta(av.criadoEm), texto].filter(Boolean).join(' · ')}
                  nota={av.nota}
                  last={index === avaliacoes.length - 1}
                  onPress={() => router.push(`/eletroposto/${av.eletropostoId}`)}
                />
              );
            })}
          </View>
        </GradientFill>
      )}
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  inner: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  estado: {
    paddingTop: 48,
    alignItems: 'center',
  },
});
