import { Title } from '@/components/Title';
import { Button } from '@/components/Button';
import { GradientFill } from '@/components/GradientFill';
import { ScreenContainer } from '@/components/ScreenContainer';
import { StationCarousel } from '@/components/StationCarousel';
import { StationCard } from '@/components/StationCard';
import { VehicleCard } from '@/components/VehicleCard';
import { obterSaudacao } from '@/lib/formatadores';
import { useVeiculoAtivo } from '@/providers/VeiculoAtivoProvider';
import {
  eletropostoRepository,
  rotaRepository,
  usuarioRepository,
} from '@/repositories/mockRepositories';
import type { Eletroposto, Rota, Usuario } from '@/types';
import { router } from 'expo-router';
import { Lightbulb, Route, User } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const { veiculo, carregando: carregandoVeiculo } = useVeiculoAtivo();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [proximos, setProximos] = useState<Eletroposto[]>([]);
  const [recomendado, setRecomendado] = useState<Eletroposto | null>(null);
  const [ultimaRota, setUltimaRota] = useState<Rota | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function carregar() {
      const [u, p, r, rota] = await Promise.all([
        usuarioRepository.obterAtual(),
        eletropostoRepository.listarProximos(3),
        eletropostoRepository.listarRecomendados(1),
        usuarioRepository.obterAtual().then((usr) => rotaRepository.obterUltima(usr.id)),
      ]);
      if (!mounted) return;
      setUsuario(u);
      setProximos(p);
      setRecomendado(r[0] ?? null);
      setUltimaRota(rota);
      setCarregando(false);
    }

    carregar();

    return () => {
      mounted = false;
    };
  }, []);

  const carregandoTela = carregando || carregandoVeiculo;

  return (
    <ScreenContainer scroll>
      {carregandoTela ? (
        <View
          className="min-h-[50%] flex-1 items-center justify-center py-24"
          accessibilityRole="progressbar"
          accessibilityLabel="Carregando">
          <ActivityIndicator color={colors.textPrimary} />
        </View>
      ) : (
        <>
          <View className="flex-row items-center gap-4 pt-4">
            {usuario ? (
              <Image
                source={require('../../../assets/images/foto-perfil.png')}
                style={styles.avatar}
                resizeMode="cover"
                accessibilityLabel={`Foto de ${usuario.nome}`}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <User size={24} color={colors.textPrimary} />
              </View>
            )}
            <View className="flex-1">
              <Text className="font-poppins text-lg text-text-secondary">{obterSaudacao()},</Text>
              <Text style={styles.userName} className="text-2xl uppercase text-text-primary">
                {usuario?.nome}
              </Text>
            </View>
          </View>

          {veiculo && (
            <View style={styles.section}>
              <VehicleCard veiculo={veiculo} />
            </View>
          )}

          <View style={styles.section}>
            <Button
              label="Encontrar Recarga"
              accessibilityHint="Abre o mapa para buscar eletropostos"
              onPress={() => router.push('/(tabs)/explorar')}
            />
          </View>

          <View style={styles.section}>
            <Title size="sm" style={styles.sectionTitle}>
              Perto de Você
            </Title>
            <StationCarousel
              data={proximos}
              onSelect={(ep) => router.push(`/eletroposto/${ep.id}`)}
            />
          </View>

          {recomendado && (
            <View style={styles.section}>
              <Title size="sm" style={styles.sectionTitle}>
                Recomendado para Você
              </Title>
              <StationCard
                eletroposto={recomendado}
                onPress={() => router.push(`/eletroposto/${recomendado.id}`)}
              />
            </View>
          )}

          {ultimaRota && (
            <GradientFill variant="card" rounded style={styles.section}>
              <View className="p-5">
                <View className="mb-3 flex-row items-center gap-2">
                  <Route size={18} color={colors.textPrimary} />
                  <Title size="lg" className="shrink-0">
                    Última Rota
                  </Title>
                </View>
                <Text className="font-poppins text-base text-text-secondary">
                  {ultimaRota.origem} → {ultimaRota.destino}
                </Text>
                <Text className="mt-2 font-poppins text-base text-text-primary">
                  {ultimaRota.distanciaEstimada} · {ultimaRota.tempoEstimado}
                </Text>
              </View>
            </GradientFill>
          )}

          <GradientFill
            variant="card"
            rounded
            style={ultimaRota ? styles.stackedCard : styles.section}>
            <View className="p-5">
              <View className="mb-3 flex-row items-center gap-2">
                <Lightbulb size={18} color={colors.textPrimary} />
                <Title size="lg" className="shrink-0">
                  Dica de Recarga
                </Title>
              </View>
              <Text className="font-poppins text-base leading-6 text-text-secondary">
                Carregue até 80% em viagens longas para preservar a bateria e reduzir o tempo de
                espera na fila.
              </Text>
            </View>
          </GradientFill>
        </>
      )}
    </ScreenContainer>
  );
}

const AVATAR_SIZE = 52;

const styles = StyleSheet.create({
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarFallback: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.elevated,
  },
  userName: {
    fontFamily: 'LexendGiga_600SemiBold',
    letterSpacing: 2,
  },
  section: {
    marginTop: spacing.xxl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  stackedCard: {
    marginTop: spacing.xl,
  },
});
