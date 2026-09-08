import { BackButton, BackButtonSpacer } from '@/components/BackButton';
import { GradientBackground } from '@/components/GradientFill';
import { ReviewComposer } from '@/components/ReviewComposer';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Title } from '@/components/Title';
import { APP_NAME } from '@/constants/app';
import { colors, spacing } from '@/constants/theme';
import { anunciarMensagem } from '@/lib/a11y';
import { montarComentarioComNotas, type NotasPorTopico } from '@/lib/avaliacaoFormato';
import { useAuth } from '@/providers/AuthProvider';
import { avaliacaoRepository, eletropostoRepository, usuarioRepository } from '@/repositories';
import type { Avaliacao, Eletroposto } from '@/types';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function AvaliarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { usuario: usuarioAuth } = useAuth();
  const [usuario, setUsuario] = useState(usuarioAuth);
  const [eletroposto, setEletroposto] = useState<Eletroposto | null>(null);
  const [minhaAvaliacao, setMinhaAvaliacao] = useState<Avaliacao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let mounted = true;
    usuarioRepository.obterAtual().then((u) => {
      if (!mounted) return;
      setUsuario(u ?? usuarioAuth);
    });
    return () => {
      mounted = false;
    };
  }, [usuarioAuth]);

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    async function carregar() {
      try {
        const [ep, minha] = await Promise.all([
          eletropostoRepository.buscarPorId(id),
          usuario ? avaliacaoRepository.obterDoUsuario(id, usuario.id) : Promise.resolve(null),
        ]);
        if (!mounted) return;
        setEletroposto(ep);
        setMinhaAvaliacao(minha);
      } finally {
        if (mounted) setCarregando(false);
      }
    }

    carregar();
    return () => {
      mounted = false;
    };
  }, [id, usuario?.id]);

  const salvar = async (nota: number, comentario: string, notasPorTopico: NotasPorTopico) => {
    if (!id || !usuario) {
      const mensagem = 'Entre na sua conta para avaliar.';
      anunciarMensagem(mensagem);
      Alert.alert(APP_NAME, mensagem);
      router.replace('/(auth)/login');
      return;
    }

    const comentarioFinal = montarComentarioComNotas(comentario, notasPorTopico);
    const notaInteira = Math.max(1, Math.min(5, Math.round(nota)));

    setEnviando(true);
    try {
      if (minhaAvaliacao) {
        await avaliacaoRepository.atualizar(minhaAvaliacao.id, {
          nota: notaInteira,
          comentario: comentarioFinal,
        });
      } else {
        await avaliacaoRepository.criar({
          eletropostoId: id,
          usuarioId: usuario.id,
          nomeUsuario: usuario.nome,
          nota: notaInteira,
          comentario: comentarioFinal,
        });
      }
      router.back();
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível salvar sua avaliação.';
      anunciarMensagem(mensagem);
      Alert.alert(APP_NAME, mensagem);
    } finally {
      setEnviando(false);
    }
  };

  if (carregando || !eletroposto) {
    return (
      <View className="flex-1 items-center justify-center">
        <GradientBackground />
        <ActivityIndicator color={colors.textPrimary} />
      </View>
    );
  }

  return (
    <ScreenContainer keyboard header={
      <View style={styles.topBar}>
        <BackButton />
        <Title size="md" style={styles.topTitle}>
          {minhaAvaliacao ? 'Editar' : 'Avaliar'}
        </Title>
        <BackButtonSpacer />
      </View>
    }>
      <View style={styles.stationBlock}>
        <Text style={styles.stationEyebrow}>Eletroposto</Text>
        <Text style={styles.stationName}>{eletroposto.nome}</Text>
      </View>

      <ReviewComposer
        comentarioInicial={minhaAvaliacao?.comentario ?? ''}
        enviando={enviando}
        onSubmit={salvar}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  topTitle: {
    textAlign: 'center',
  },
  stationBlock: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  stationEyebrow: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  stationName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: 0.5,
    textAlign: 'center',
    color: colors.textPrimary,
    textTransform: 'uppercase',
  },
});
