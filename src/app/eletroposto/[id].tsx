import { BackButton, BACK_BUTTON_SIZE } from '@/components/BackButton';
import { Title } from '@/components/Title';
import { ContentFade } from '@/components/ContentFade';
import { GradientBackground, GradientFill } from '@/components/GradientFill';
import { ScreenTopFade } from '@/components/ScreenTopFade';
import { Button } from '@/components/Button';
import { CompatibilityBar } from '@/components/CompatibilityBar';
import { CompatibilityInfoSheet } from '@/components/CompatibilityInfoSheet';
import { ConnectorsCarousel } from '@/components/ConnectorsCarousel';
import { OpenNowBadge } from '@/components/OpenNowBadge';
import { Rating } from '@/components/Rating';
import { ReviewsCarousel } from '@/components/ReviewsCarousel';
import { CompatibilityMark, corCompatibilidade } from '@/components/CompatibilityMark';
import { colors, layout } from '@/constants/theme';
import { criarRotuloCompatibilidade, HIT_SLOP_PADRAO } from '@/lib/a11y';
import { formatarResumoNotas, parseAvaliacaoComentario } from '@/lib/avaliacaoFormato';
import { obterExplicacaoCompatibilidade } from '@/lib/compatibilidade';
import { formatarDistancia } from '@/lib/formatadores';
import { registrarPontoAberto } from '@/lib/historicoLocal';
import { formatarHorarioMenorMovimento } from '@/lib/horarioEstacao';
import { useAuth } from '@/providers/AuthProvider';
import { useFavoritos } from '@/providers/FavoritosProvider';
import { useVeiculoAtivo } from '@/providers/VeiculoAtivoProvider';
import { avaliacaoRepository, eletropostoRepository, usuarioRepository } from '@/repositories';
import type { Avaliacao, Eletroposto } from '@/types';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  CircleHelp,
  Clock,
  Coffee,
  Heart,
  MapPin,
  MessageSquare,
  ParkingCircle,
  Star,
  Toilet,
  Zap,
} from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type TextStyle,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TempoCard({
  icon,
  title,
  titleStyle,
  value,
  accessibilityLabel,
}: {
  icon: React.ReactNode;
  title: string;
  titleStyle?: TextStyle;
  value: string;
  accessibilityLabel: string;
}) {
  return (
    <GradientFill variant="card" rounded={16} style={styles.tempoCard}>
      <View
        style={styles.tempoInner}
        accessibilityRole="text"
        accessibilityLabel={accessibilityLabel}>
        {icon}
        <Text style={[styles.tempoTitle, titleStyle]}>{title}</Text>
        <View style={styles.tempoSpacer} />
        <Text style={styles.tempoValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </GradientFill>
  );
}

function AmenityCard({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <GradientFill variant="card" rounded={layout.cardRadius} style={styles.amenityCard}>
      <View
        style={styles.amenityInner}
        accessibilityRole="text"
        accessibilityLabel={label}>
        {icon}
        <Text style={styles.amenityLabel}>{label}</Text>
      </View>
    </GradientFill>
  );
}

export default function EletropostoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { alternarFavorito, ehFavorito } = useFavoritos();
  const { veiculo } = useVeiculoAtivo();
  const { usuario: usuarioAuth } = useAuth();
  const [usuario, setUsuario] = useState(usuarioAuth);
  const [eletroposto, setEletroposto] = useState<Eletroposto | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [minhaAvaliacao, setMinhaAvaliacao] = useState<Avaliacao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [favorito, setFavorito] = useState(false);
  const [compatSheetAberto, setCompatSheetAberto] = useState(false);

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

  const carregar = useCallback(async () => {
    if (!id) return;
    try {
      const [ep, av, minha] = await Promise.all([
        eletropostoRepository.buscarPorId(id),
        avaliacaoRepository.listarPorEletroposto(id, 20),
        usuario ? avaliacaoRepository.obterDoUsuario(id, usuario.id) : Promise.resolve(null),
      ]);
      setEletroposto(ep);
      if (ep) registrarPontoAberto(ep.id);
      setAvaliacoes(av.filter((item) => item.usuarioId !== usuario?.id));
      setMinhaAvaliacao(minha);
      setFavorito(ehFavorito(id));
    } catch {
      // mantém estado anterior em falha transitória
    } finally {
      setCarregando(false);
    }
  }, [id, ehFavorito, usuario?.id]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const toggleFavorito = async () => {
    if (!id) return;
    await alternarFavorito(id);
    setFavorito(!favorito);
  };

  const abrirAvaliacao = () => {
    if (!id) return;
    if (!usuario) {
      router.push('/(auth)/login');
      return;
    }
    router.push(`/avaliar/${id}`);
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
  const zapColor = corCompatibilidade(eletroposto.nivelCompatibilidade);
  const horarioMenorMovimento = formatarHorarioMenorMovimento(eletroposto.horarioMenorMovimento);
  const temAvaliacoes = eletroposto.quantidadeAvaliacoes > 0;

  return (
    <View style={styles.screen}>
      <ScrollView
        style={{ backgroundColor: 'transparent' }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeIn.duration(400)} style={styles.scrollInner}>
          <View style={[styles.headerBand, { paddingTop: insets.top + 64 }]}>
            <View style={styles.stationRow}>
              <Text
                style={styles.stationName}
                accessibilityRole="header"
                numberOfLines={2}>
                {eletroposto.nome}
              </Text>
              <View
                style={styles.stationZap}
                accessibilityRole="image"
                accessibilityLabel={criarRotuloCompatibilidade(eletroposto.nivelCompatibilidade)}>
                <CompatibilityMark
                  nivel={eletroposto.nivelCompatibilidade}
                  size={28}
                  color={zapColor}
                />
              </View>
            </View>

            <View style={styles.metaRow}>
              {temAvaliacoes ? (
                <Rating
                  nota={eletroposto.nota}
                  quantidadeAvaliacoes={eletroposto.quantidadeAvaliacoes}
                />
              ) : (
                <View
                  style={styles.noRatingRow}
                  accessibilityRole="text"
                  accessibilityLabel="Sem avaliação">
                  <Star aria-hidden={true} size={13} color={colors.warning} fill={colors.warning} />
                  <Text aria-hidden={true} style={styles.noRating}>
                    Sem avaliação
                  </Text>
                </View>
              )}
              <OpenNowBadge aberto={eletroposto.abertoAgora} />
            </View>

            <View style={styles.addressRow}>
              <View style={styles.addressWrap}>
                <MapPin aria-hidden={true} size={14} color={colors.textMuted} />
                <Text style={styles.address} numberOfLines={1}>
                  {eletroposto.endereco}
                </Text>
              </View>
              {eletroposto.distanciaKm !== undefined ? (
                <Text style={styles.distance}>{formatarDistancia(eletroposto.distanciaKm)}</Text>
              ) : null}
            </View>

            <View style={styles.hoursRow}>
              <Clock aria-hidden={true} size={14} color={colors.textMuted} />
              <Text style={styles.hours}>{eletroposto.horarioFuncionamento}</Text>
            </View>
          </View>

          <View style={[styles.bodySheet, { paddingBottom: ctaFadeHeight + 16 }]}>
            <View style={styles.compatBlock}>
              <CompatibilityBar percentual={eletroposto.pontuacaoCompatibilidade} />
              <View style={styles.compatMeta}>
                <Text style={styles.compatLabel}>
                  {eletroposto.pontuacaoCompatibilidade}% compatível
                </Text>
                <Pressable
                  onPress={() => setCompatSheetAberto(true)}
                  accessibilityRole="button"
                  accessibilityLabel="O que significa a compatibilidade"
                  hitSlop={HIT_SLOP_PADRAO}
                  style={styles.compatHelp}>
                  <CircleHelp size={20} color={colors.textMuted} strokeWidth={2} />
                </Pressable>
              </View>
            </View>

            {eletroposto.conectores.length > 0 ? (
              <View style={styles.connectorsSection}>
                <ConnectorsCarousel data={eletroposto.conectores} />
              </View>
            ) : null}

            <View className="mt-5 gap-4">
              <View style={styles.tempoRow}>
                <TempoCard
                  icon={<Clock aria-hidden={true} size={20} color={colors.textPrimary} strokeWidth={2.2} />}
                  title="Horário de menor movimento"
                  titleStyle={styles.tempoTitleStrong}
                  value={horarioMenorMovimento}
                  accessibilityLabel={`Horário de menor movimento, ${horarioMenorMovimento}`}
                />
                <TempoCard
                  icon={<Zap aria-hidden={true} size={20} color={colors.textPrimary} strokeWidth={2.2} />}
                  title="Tempo de recarga"
                  value={`${eletroposto.tempoCargaMinutos} min`}
                  accessibilityLabel={`Tempo de recarga, ${eletroposto.tempoCargaMinutos} minutos`}
                />
              </View>

              <View>
                <Title size="sm" className="mb-3">
                  Conveniência
                </Title>
                {(eletroposto.temBanheiro ||
                  eletroposto.temComida ||
                  eletroposto.temEstacionamento) && (
                  <View style={styles.amenityRow}>
                    {eletroposto.temBanheiro ? (
                      <AmenityCard
                        icon={
                          <Toilet aria-hidden={true} size={24} color={colors.textMuted} />
                        }
                        label="Banheiro"
                      />
                    ) : null}
                    {eletroposto.temComida ? (
                      <AmenityCard
                        icon={
                          <Coffee aria-hidden={true} size={24} color={colors.textMuted} />
                        }
                        label="Comida"
                      />
                    ) : null}
                    {eletroposto.temEstacionamento ? (
                      <AmenityCard
                        icon={
                          <ParkingCircle aria-hidden={true} size={24} color={colors.textMuted} />
                        }
                        label="Estacionamento"
                      />
                    ) : null}
                  </View>
                )}
              </View>

              <View>
                <Title size="sm" className="mb-3">
                  Avaliações
                </Title>

                {minhaAvaliacao ? (
                  <GradientFill variant="card" rounded>
                    <View className="p-5">
                      <Text className="mb-3 font-poppins text-sm text-text-muted">Sua avaliação</Text>
                      <Rating nota={minhaAvaliacao.nota} />
                      {(() => {
                        const parsed = parseAvaliacaoComentario(minhaAvaliacao.comentario);
                        const resumo = formatarResumoNotas(parsed.notas);
                        return (
                          <>
                            {resumo ? (
                              <Text className="mt-3 font-poppins text-sm leading-5 text-text-secondary">
                                {resumo}
                              </Text>
                            ) : null}
                            {parsed.texto ? (
                              <Text className="mt-3 font-poppins text-base leading-6 text-text-primary">
                                {parsed.texto}
                              </Text>
                            ) : null}
                          </>
                        );
                      })()}
                    </View>
                  </GradientFill>
                ) : null}

                {avaliacoes.length > 0 ? (
                  <View className={minhaAvaliacao ? 'mt-4' : undefined}>
                    <ReviewsCarousel data={avaliacoes} />
                  </View>
                ) : !minhaAvaliacao ? (
                  <GradientFill variant="card" rounded>
                    <View style={styles.emptyReviews}>
                      <MessageSquare
                        aria-hidden={true}
                        size={32}
                        color={colors.textMuted}
                        strokeWidth={1.8}
                      />
                      <Text style={styles.emptyReviewsText}>Seja o primeiro a avaliar</Text>
                    </View>
                  </GradientFill>
                ) : null}

                <Button
                  variant="secondary"
                  label={minhaAvaliacao ? 'Editar' : 'Avaliar'}
                  accessibilityLabel={minhaAvaliacao ? 'Editar avaliação' : 'Avaliar eletroposto'}
                  onPress={abrirAvaliacao}
                  className="mt-4"
                />
              </View>
            </View>
          </View>
        </Animated.View>
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
            onPress={() => id && router.push(`/rota/${id}`)}
            className="h-[56px]"
          />
        </View>
      </View>
      <ScreenTopFade />
      <View pointerEvents="box-none" style={[styles.headerControls, { top: insets.top + 8 }]}>
        <BackButton accessibilityHint="Retorna à tela anterior" />
        <Pressable
          style={styles.headerAction}
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
      <CompatibilityInfoSheet
        visible={compatSheetAberto}
        explicacao={explicacaoCompatibilidade}
        onClose={() => setCompatSheetAberto(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundEnd,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollInner: {
    flexGrow: 1,
  },
  headerBand: {
    backgroundColor: colors.surface,
    paddingHorizontal: layout.paddingHorizontal,
    paddingBottom: 56,
  },
  bodySheet: {
    flexGrow: 1,
    backgroundColor: colors.backgroundEnd,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 28,
    paddingHorizontal: layout.paddingHorizontal,
    overflow: 'hidden',
  },
  metaRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  noRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  noRating: {
    marginLeft: 6,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stationName: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: 0.4,
    includeFontPadding: false,
    textAlignVertical: 'center',
    color: colors.textPrimary,
  },
  stationZap: {
    flexShrink: 0,
    width: 28,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressRow: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addressWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  address: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  distance: {
    flexShrink: 0,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  hoursRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hours: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  connectorsSection: {
    marginTop: 28,
  },
  compatBlock: {
    marginTop: 0,
  },
  compatMeta: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  compatLabel: {
    flex: 1,
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  compatHelp: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempoRow: {
    flexDirection: 'row',
    gap: 20,
  },
  tempoCard: {
    flex: 1,
    minHeight: 168,
  },
  tempoInner: {
    flex: 1,
    padding: 20,
  },
  tempoTitle: {
    marginTop: 10,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  tempoTitleStrong: {
    fontFamily: 'Poppins_500Medium',
  },
  tempoSpacer: {
    flex: 1,
    minHeight: 12,
  },
  tempoValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    lineHeight: 34,
    color: colors.textPrimary,
  },
  amenityRow: {
    flexDirection: 'row',
    gap: 12,
  },
  amenityCard: {
    flex: 1,
  },
  amenityInner: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 10,
    gap: 10,
  },
  amenityLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  emptyReviews: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    gap: 12,
  },
  emptyReviewsText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  headerControls: {
    position: 'absolute',
    left: layout.paddingHorizontal,
    right: layout.paddingHorizontal,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerAction: {
    width: BACK_BUTTON_SIZE,
    height: BACK_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: colors.backgroundEnd,
    paddingHorizontal: layout.paddingHorizontal,
    paddingTop: 12,
  },
});
