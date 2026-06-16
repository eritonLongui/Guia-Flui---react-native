import { Button } from '@/components/Button';
import { CompatibilityBadge } from '@/components/CompatibilityBadge';
import { FeatureChip } from '@/components/FeatureChip';
import { Rating } from '@/components/Rating';
import { SafetyBadge } from '@/components/SafetyBadge';
import { colors, layout } from '@/constants/theme';
import { formatarDistancia } from '@/lib/formatadores';
import { useFavoritos } from '@/providers/FavoritosProvider';
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
    <View className="rounded-card border border-border bg-surface p-5">
      <Text className="mb-3 font-poppins text-base text-text-primary">{title}</Text>
      {children}
    </View>
  );
}

export default function EletropostoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { alternarFavorito, ehFavorito } = useFavoritos();
  const [eletroposto, setEletroposto] = useState<Eletroposto | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [favorito, setFavorito] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function carregar() {
      const [ep, av] = await Promise.all([
        eletropostoRepository.buscarPorId(id),
        avaliacaoRepository.listarPorEletroposto(id, 3),
      ]);
      setEletroposto(ep);
      setAvaliacoes(av);
      setFavorito(ehFavorito(id));
      setCarregando(false);
    }
    carregar();
  }, [id, ehFavorito]);

  const toggleFavorito = async () => {
    if (!id) return;
    await alternarFavorito(id);
    setFavorito(!favorito);
  };

  if (carregando || !eletroposto) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: layout.ctaHeight + insets.bottom + 16 }}>
        <View style={{ height: layout.heroImageHeight }}>
          <Image
            source={{ uri: eletroposto.imagemUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
          <Pressable
            className="absolute left-4 h-10 w-10 items-center justify-center rounded-full bg-surface/90"
            style={{ top: insets.top + 8 }}
            onPress={() => router.back()}>
            <ArrowLeft size={20} color={colors.textPrimary} />
          </Pressable>
          <Pressable
            className="absolute right-4 h-10 w-10 items-center justify-center rounded-full bg-surface/90"
            style={{ top: insets.top + 8 }}
            onPress={toggleFavorito}>
            <Heart
              size={20}
              color={favorito ? colors.danger : colors.textPrimary}
              fill={favorito ? colors.danger : 'transparent'}
            />
          </Pressable>
        </View>

        <View className="px-6 pt-5">
          <Text className="font-poppins text-2xl text-text-primary">{eletroposto.nome}</Text>
          <View className="mt-2 flex-row items-center justify-between">
            <Rating nota={eletroposto.nota} quantidadeAvaliacoes={eletroposto.quantidadeAvaliacoes} />
            {eletroposto.distanciaKm !== undefined && (
              <View className="flex-row items-center gap-1">
                <MapPin size={14} color={colors.textMuted} />
                <Text className="font-inter text-sm text-text-secondary">
                  {formatarDistancia(eletroposto.distanciaKm)}
                </Text>
              </View>
            )}
          </View>

          <View className="mt-5 gap-4">
            <InfoCard title="Compatibilidade">
              <View className="flex-row items-center justify-between">
                <CompatibilityBadge nivel={eletroposto.nivelCompatibilidade} />
                <Text className="font-inter text-2xl font-semibold text-accent">
                  {eletroposto.pontuacaoCompatibilidade}%
                </Text>
              </View>
              <Text className="mt-2 font-inter text-sm text-text-secondary">
                Compatível com seu veículo ativo
              </Text>
            </InfoCard>

            <InfoCard title="Tempo">
              <View className="flex-row gap-6">
                <View className="flex-row items-center gap-2">
                  <Clock size={18} color={colors.warning} />
                  <View>
                    <Text className="font-inter text-xs text-text-muted">Fila</Text>
                    <Text className="font-inter text-base text-text-primary">
                      {eletroposto.tempoFilaMinutos} min
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-2">
                  <Zap size={18} color={colors.accent} />
                  <View>
                    <Text className="font-inter text-xs text-text-muted">Carga</Text>
                    <Text className="font-inter text-base text-text-primary">
                      {eletroposto.tempoCargaMinutos} min
                    </Text>
                  </View>
                </View>
              </View>
            </InfoCard>

            <InfoCard title="Segurança">
              <View className="flex-row items-center justify-between">
                <SafetyBadge nivel={eletroposto.nivelSeguranca} />
                <Text className="font-inter text-base text-text-primary">
                  {eletroposto.pontuacaoSeguranca.toFixed(1)}/5
                </Text>
              </View>
              <Text className="mt-2 font-inter text-sm text-text-secondary">
                {eletroposto.descricaoSeguranca}
              </Text>
            </InfoCard>

            <InfoCard title="Conveniência">
              <View className="flex-row flex-wrap gap-3">
                {eletroposto.temBanheiro && (
                  <View className="flex-row items-center gap-2">
                    <Toilet size={16} color={colors.textSecondary} />
                    <Text className="font-inter text-sm text-text-secondary">Banheiro</Text>
                  </View>
                )}
                {eletroposto.temComida && (
                  <View className="flex-row items-center gap-2">
                    <Coffee size={16} color={colors.textSecondary} />
                    <Text className="font-inter text-sm text-text-secondary">Comida</Text>
                  </View>
                )}
                {eletroposto.temEstacionamento && (
                  <View className="flex-row items-center gap-2">
                    <ParkingCircle size={16} color={colors.textSecondary} />
                    <Text className="font-inter text-sm text-text-secondary">Estacionamento</Text>
                  </View>
                )}
              </View>
              <Text className="mt-3 font-inter text-sm text-text-muted">
                {eletroposto.abertoAgora ? 'Aberto agora' : 'Fechado'} ·{' '}
                {eletroposto.horarioFuncionamento}
              </Text>
            </InfoCard>

            <InfoCard title="Conectores">
              <View className="gap-3">
                {eletroposto.conectores.map((c) => (
                  <View key={c.tipo} className="flex-row items-center justify-between">
                    <FeatureChip label={c.tipo} />
                    <Text className="font-inter text-sm text-text-secondary">
                      {c.potenciaKw} kW · {c.quantidade} un.
                    </Text>
                  </View>
                ))}
              </View>
              <Text className="mt-3 font-inter text-sm text-text-muted">
                {eletroposto.carregadoresDisponiveis}/{eletroposto.carregadoresTotal} disponíveis
              </Text>
            </InfoCard>

            <InfoCard title="Avaliações">
              {avaliacoes.length === 0 ? (
                <Text className="font-inter text-sm text-text-muted">Sem avaliações ainda.</Text>
              ) : (
                <View className="gap-4">
                  {avaliacoes.map((av) => (
                    <View key={av.id} className="border-b border-border pb-3 last:border-0">
                      <View className="flex-row items-center justify-between">
                        <Text className="font-inter text-sm font-medium text-text-primary">
                          {av.nomeUsuario}
                        </Text>
                        <Rating nota={av.nota} />
                      </View>
                      <Text className="mt-1 font-inter text-sm text-text-secondary">
                        {av.comentario}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </InfoCard>
          </View>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-border bg-background px-6 pt-3"
        style={{ paddingBottom: insets.bottom + 12, height: layout.ctaHeight + insets.bottom }}>
        <Button
          label="Seguir Rota"
          onPress={() => Alert.alert('Rota', 'Navegação iniciada (simulada).')}
          className="h-[56px]"
        />
      </View>
    </View>
  );
}
