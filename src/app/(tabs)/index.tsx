import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { ScreenTopFade } from '@/components/ScreenTopFade';
import { StationCarousel } from '@/components/StationCarousel';
import { TipCard } from '@/components/TipCard';
import { Title } from '@/components/Title';
import { VehicleCard } from '@/components/VehicleCard';
import { colors, layout, spacing } from '@/constants/theme';
import { obterSaudacao } from '@/lib/formatadores';
import { useAuth } from '@/providers/AuthProvider';
import { useMockMode } from '@/providers/MockModeProvider';
import { useVeiculoAtivo } from '@/providers/VeiculoAtivoProvider';
import { eletropostoRepository, usuarioRepository } from '@/repositories';
import type { Eletroposto, Usuario } from '@/types';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { veiculo, carregando: carregandoVeiculo } = useVeiculoAtivo();
  const { usuario: usuarioAuth } = useAuth();
  const { isMockMode } = useMockMode();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [proximos, setProximos] = useState<Eletroposto[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function carregar() {
      try {
        const [u, p] = await Promise.all([
          usuarioRepository.obterAtual(),
          eletropostoRepository.listarProximos(3),
        ]);
        if (!mounted) return;
        const atual = u ?? usuarioAuth;
        setUsuario(atual);
        setProximos(p);
      } catch {
        if (!mounted) return;
      } finally {
        if (mounted) setCarregando(false);
      }
    }

    carregar();

    return () => {
      mounted = false;
    };
  }, [usuarioAuth, isMockMode]);

  const carregandoTela = carregando || carregandoVeiculo;
  const saudacao = obterSaudacao();

  if (carregandoTela) {
    return (
      <View
        style={styles.screen}
        accessibilityRole="progressbar"
        accessibilityLabel="Carregando">
        <ActivityIndicator aria-hidden={true} color={colors.textPrimary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + layout.floatingTabBar.scrollPadding },
        ]}>
        <Animated.View entering={FadeIn.duration(400)} style={styles.scrollInner}>
          <View style={[styles.headerBand, { paddingTop: insets.top + 20 }]}>
            <View style={styles.helloRow}>
              <View style={styles.helloText}>
                <Text style={styles.greeting}>{saudacao},</Text>
                <Text style={styles.userName} numberOfLines={1}>
                  {usuario?.nome}
                </Text>
              </View>
              <Avatar nome={usuario?.nome} size={56} />
            </View>
          </View>

          <View style={styles.bodySheet}>
            {veiculo ? (
              <View style={styles.block}>
                <VehicleCard veiculo={veiculo} />
              </View>
            ) : null}

            <View style={styles.blockTight}>
              <Button
                label="Encontrar Recarga"
                accessibilityHint="Abre o mapa para buscar eletropostos"
                onPress={() => router.push('/(tabs)/explorar')}
              />
            </View>

            {proximos.length > 0 ? (
              <View style={styles.section}>
                <Title size="sm" style={styles.sectionTitle}>
                  Perto de você
                </Title>
                <StationCarousel
                  data={proximos}
                  onSelect={(ep) => router.push(`/eletroposto/${ep.id}`)}
                />
              </View>
            ) : null}

            <View style={styles.section}>
              <TipCard />
            </View>
          </View>
        </Animated.View>
      </ScrollView>
      <ScreenTopFade />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundEnd,
  },
  scroll: {
    backgroundColor: 'transparent',
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
    paddingBottom: 48,
  },
  helloRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  helloText: {
    flex: 1,
    minWidth: 0,
  },
  greeting: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  userName: {
    marginTop: 2,
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 0.3,
    color: colors.textPrimary,
  },
  bodySheet: {
    flexGrow: 1,
    backgroundColor: colors.backgroundEnd,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 28,
    paddingHorizontal: layout.paddingHorizontal,
  },
  block: {
    marginTop: 0,
  },
  blockTight: {
    marginTop: spacing.lg,
  },
  section: {
    marginTop: spacing.xxl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
});
