import { Title } from '@/components/Title';
import { ContentFade } from '@/components/ContentFade';
import { GradientBackground, GradientFill } from '@/components/GradientFill';
import { ScreenTopFade } from '@/components/ScreenTopFade';
import { Button } from '@/components/Button';
import { CompatibilityBadge } from '@/components/CompatibilityBadge';
import { FeatureChip } from '@/components/FeatureChip';
import { Rating } from '@/components/Rating';
import { ReviewsCarousel } from '@/components/ReviewsCarousel';
import { SafetyBadge } from '@/components/SafetyBadge';
import { APP_NAME } from '@/constants/app';
import { colors, layout } from '@/constants/theme';
import { HIT_SLOP_PADRAO } from '@/lib/a11y';
import { obterExplicacaoCompatibilidade } from '@/lib/compatibilidade';
import { formatarDistancia } from '@/lib/formatadores';
import { useFavoritos } from '@/providers/FavoritosProvider';
import { useVeiculoAtivo } from '@/providers/VeiculoAtivoProvider';
import {
  avaliacaoRepository,
  eletropostoRepository,
} from '@/repositories/mockRepositories';
import type { Avaliacao, Eletroposto } from '@/types';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Clock,
  Coffee,
  Heart,
  MapPin,
  ParkingCircle,
  Toilet,
  Zap,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <GradientFill variant="card" rounded>
      <View className="p-5">
        <Title size="sm" className="mb-3">
          {title}
        </Title>
        {children}
      </View>
    </GradientFill>
  );
}

export default function EletropostoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { alternarFavorito, ehFavorito } = useFavoritos();
  const { veiculo } = useVeiculoAtivo();
  const [eletroposto, setEletroposto] = useState<Eletroposto | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [favorito, setFavorito] = useState(false);

  useEffect(() => {
    if (!id) return;

    let mounted = true;

    async function carregar() {
      const [ep, av] = await Promise.all([
        eletropostoRepository.buscarPorId(id),
        avaliacaoRepository.listarPorEletroposto(id, 3),
      ]);
      if (!mounted) return;
      setEletroposto(ep);
      setAvaliacoes(av);
      setFavorito(ehFavorito(id));
      setCarregando(false);
    }

    carregar();

    return () => {
      mounted = false;
    };
  }, [id, ehFavorito]);

  const toggleFavorito = async () => {
    if (!id) return;
    await alternarFavorito(id);
    setFavorito(!favorito);
  };

  if (carregando || !eletroposto) {
    return (
      <View
        className="flex-1 items-center justify-center"
        accessibilityRole="progressbar"
        accessibilityLabel="Carregando">
        <GradientBackground />
        <ActivityIndicator aria-hidden={true} color={colors.textPrimary} />
      </View>
    );
  }

  const explicacaoCompatibilidade = obterExplicacaoCompatibilidade(
    eletroposto.nivelCompatibilidade,
    eletroposto.pontuacaoCompatibilidade,
    eletroposto.conectores,
    veiculo?.tiposConector,
  );

  const ctaFadeHeight = layout.fadeHeight + insets.bottom + layout.ctaHeight;

  return (
    <View className="flex-1">
      <GradientBackground />
      <ScrollView
        style={{ backgroundColor: 'transparent' }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: ctaFadeHeight + 16 }}>
        <View style={{ height: layout.heroImageHeight }}>
          <Image
            source={{ uri: eletroposto.imagemUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            accessibilityRole="image"
            accessibilityLabel={`Foto do ${eletroposto.nome}`}
          />
          <Pressable
            className="absolute left-4 h-10 w-10 items-center justify-center rounded-full bg-surface/90"
            style={{ top: insets.top + 8, zIndex: 50 }}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            accessibilityHint="Retorna à tela anterior"
            hitSlop={HIT_SLOP_PADRAO}
            onPress={() => router.back()}>
            <ArrowLeft aria-hidden={true} size={20} color={colors.textPrimary} />
          </Pressable>
          <Pressable
            className="absolute right-4 h-10 w-10 items-center justify-center rounded-full bg-surface/90"
            style={{ top: insets.top + 8, zIndex: 50 }}
            accessibilityRole="button"
            accessibilityLabel={favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            accessibilityState={{ selected: favorito }}
            hitSlop={HIT_SLOP_PADRAO}
            onPress={toggleFavorito}>
            <Heart
              size={20}
              color={favorito ? colors.danger : colors.textPrimary}
              fill={favorito ? colors.danger : 'transparent'}
            />
          </Pressable>
        </View>

        <View style={styles.infoSection}>
          <Text className="font-poppins-bold text-2xl tracking-title text-text-primary">{eletroposto.nome}</Text>
          <View className="mt-2 flex-row items-center justify-between">
            <Rating nota={eletroposto.nota} quantidadeAvaliacoes={eletroposto.quantidadeAvaliacoes} />
            {eletroposto.distanciaKm !== undefined && (
              <View className="flex-row items-center gap-1">
                <MapPin size={14} color={colors.textMuted} />
                <Text className="font-poppins text-sm text-text-secondary">
                  {formatarDistancia(eletroposto.distanciaKm)}
                </Text>
              </View>
            )}
          </View>

          <View className="mt-5 gap-4">
            <InfoCard title="Compatibilidade">
              <View className="flex-row items-center justify-between">
                <CompatibilityBadge nivel={eletroposto.nivelCompatibilidade} />
                <Text className="font-poppins text-2xl font-semibold text-accent">
                  {eletroposto.pontuacaoCompatibilidade}%
                </Text>
              </View>
              <Text className="mt-3 font-poppins text-base leading-6 text-text-primary">
                {explicacaoCompatibilidade}
              </Text>
            </InfoCard>

            <InfoCard title="Tempo">
              <View className="flex-row gap-6">
                <View className="flex-row items-center gap-2">
                  <Clock size={18} color={colors.textPrimary} />
                  <View>
                    <Text className="font-poppins text-sm text-text-muted">Fila</Text>
                    <Text className="font-poppins text-lg text-text-primary">
                      {eletroposto.tempoFilaMinutos} min
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-2">
                  <Zap size={18} color={colors.textPrimary} />
                  <View>
                    <Text className="font-poppins text-sm text-text-muted">Carga</Text>
                    <Text className="font-poppins text-lg text-text-primary">
                      {eletroposto.tempoCargaMinutos} min
                    </Text>
                  </View>
                </View>
              </View>
            </InfoCard>

            <InfoCard title="Segurança">
              <View className="flex-row items-center justify-between">
                <SafetyBadge nivel={eletroposto.nivelSeguranca} />
                <Text className="font-poppins text-base text-text-primary">
                  {eletroposto.pontuacaoSeguranca.toFixed(1)}/5
                </Text>
              </View>
              <Text className="mt-2 font-poppins text-sm text-text-secondary">
                {eletroposto.descricaoSeguranca}
              </Text>
            </InfoCard>

            <InfoCard title="Conveniência">
              <View className="flex-row flex-wrap gap-3">
                {eletroposto.temBanheiro && (
                  <View className="flex-row items-center gap-2">
                    <Toilet size={16} color={colors.textSecondary} />
                    <Text className="font-poppins text-sm text-text-secondary">Banheiro</Text>
                  </View>
                )}
                {eletroposto.temComida && (
                  <View className="flex-row items-center gap-2">
                    <Coffee size={16} color={colors.textSecondary} />
                    <Text className="font-poppins text-sm text-text-secondary">Comida</Text>
                  </View>
                )}
                {eletroposto.temEstacionamento && (
                  <View className="flex-row items-center gap-2">
                    <ParkingCircle size={16} color={colors.textSecondary} />
                    <Text className="font-poppins text-sm text-text-secondary">Estacionamento</Text>
                  </View>
                )}
              </View>
              <Text className="mt-3 font-poppins text-sm text-text-muted">
                {eletroposto.abertoAgora ? 'Aberto agora' : 'Fechado'} ·{' '}
                {eletroposto.horarioFuncionamento}
              </Text>
            </InfoCard>

            <InfoCard title="Conectores">
              <View className="gap-3">
                {eletroposto.conectores.map((c) => (
                  <View key={c.tipo} className="flex-row items-center justify-between">
                    <FeatureChip label={c.tipo} />
                    <Text className="font-poppins text-sm text-text-secondary">
                      {c.potenciaKw} kW · {c.quantidade} un.
                    </Text>
                  </View>
                ))}
              </View>
              <Text className="mt-3 font-poppins text-sm text-text-muted">
                {eletroposto.carregadoresDisponiveis}/{eletroposto.carregadoresTotal} disponíveis
              </Text>
            </InfoCard>

            <View>
              <Title size="sm" className="mb-3">
                Avaliações
              </Title>
              {avaliacoes.length === 0 ? (
                <Text className="font-poppins text-sm text-text-muted">Sem avaliações ainda.</Text>
              ) : (
                <ReviewsCarousel data={avaliacoes} />
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <View pointerEvents="box-none" style={styles.ctaArea}>
        <ContentFade
          edge="bottom"
          gradientId="eletropostoCtaFade"
          height={ctaFadeHeight}
          style={styles.ctaFade}
        />
        <View
          style={[
            styles.ctaButtonWrap,
            { paddingBottom: insets.bottom + 12 },
          ]}>
          <Button
            label="Seguir Rota"
            onPress={() => Alert.alert(APP_NAME, 'Navegação iniciada (simulada).')}
            className="h-[56px]"
          />
        </View>
      </View>
      <ScreenTopFade />
    </View>
  );
}

const styles = StyleSheet.create({
  infoSection: {
    marginTop: -layout.cardRadius,
    paddingTop: 20,
    paddingHorizontal: layout.paddingHorizontal,
    backgroundColor: colors.backgroundEnd,
    borderTopLeftRadius: layout.cardRadius,
    borderTopRightRadius: layout.cardRadius,
  },
  ctaArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  ctaFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  ctaButtonWrap: {
    paddingHorizontal: layout.paddingHorizontal,
    paddingTop: 12,
  },
});
