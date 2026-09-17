import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/Button';
import { GradientBackground, GradientFill } from '@/components/GradientFill';
import { RotaMapa, type RotaMapaHandle } from '@/components/RotaMapa';
import { APP_NAME } from '@/constants/app';
import { colors, layout, spacing } from '@/constants/theme';
import { calcularRotaDirigindo, type RotaCalculada } from '@/lib/directions';
import { obterLocalizacaoUsuario } from '@/lib/localizacao';
import { eletropostoRepository } from '@/repositories';
import type { Eletroposto } from '@/types';
import { router, useLocalSearchParams } from 'expo-router';
import { Clock3, Navigation, Route } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RotaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<RotaMapaHandle>(null);
  const [eletroposto, setEletroposto] = useState<Eletroposto | null>(null);
  const [rota, setRota] = useState<RotaCalculada | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const ep = await eletropostoRepository.buscarPorId(id);
        if (!mounted) return;
        if (!ep) {
          setErro('Eletroposto não encontrado.');
          return;
        }
        setEletroposto(ep);

        const origem = await obterLocalizacaoUsuario();
        const calculada = await calcularRotaDirigindo(
          { latitude: origem.latitude, longitude: origem.longitude },
          { latitude: ep.latitude, longitude: ep.longitude },
          {
            origem: origem.endereco || 'Sua localização',
            destino: ep.nome,
          },
        );
        if (!mounted) return;
        setRota(calculada);

        requestAnimationFrame(() => {
          mapRef.current?.enquadrar(calculada.coordenadas);
        });
      } catch (error) {
        if (!mounted) return;
        setErro(error instanceof Error ? error.message : 'Não foi possível calcular a rota.');
      } finally {
        if (mounted) setCarregando(false);
      }
    }

    carregar();
    return () => {
      mounted = false;
    };
  }, [id]);

  const origemCoord = useMemo(() => rota?.coordenadas[0], [rota]);
  const destinoCoord = useMemo(() => {
    if (!eletroposto) return null;
    return { latitude: eletroposto.latitude, longitude: eletroposto.longitude };
  }, [eletroposto]);

  const abrirMapasExternos = async () => {
    if (!eletroposto) return;
    const { latitude, longitude } = eletroposto;
    const apple = `http://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`;
    const google = Platform.select({
      ios: `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`,
      android: `google.navigation:q=${latitude},${longitude}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`,
    })!;

    try {
      const canGoogle = await Linking.canOpenURL(google);
      await Linking.openURL(canGoogle ? google : apple);
    } catch {
      Alert.alert(APP_NAME, 'Não foi possível abrir o app de mapas.');
    }
  };

  return (
    <View style={styles.root}>
      <GradientBackground />

      {carregando || !eletroposto || !rota || !origemCoord || !destinoCoord ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.textPrimary} />
          <Text className="mt-3 font-poppins text-sm text-text-secondary">
            {erro ?? 'Calculando rota...'}
          </Text>
        </View>
      ) : (
        <>
          <RotaMapa
            ref={mapRef}
            origem={origemCoord}
            destino={destinoCoord}
            destinoTitulo={eletroposto.nome}
            destinoDescricao={eletroposto.endereco}
            coordenadas={rota.coordenadas}
          />

          <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
            <BackButton />
          </View>

          <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
            <GradientFill variant="card" rounded style={styles.sheetCard}>
              <View style={styles.sheetContent}>
                <View style={styles.sheetTitleRow}>
                  <Route size={18} color={colors.accent} />
                  <Text style={styles.sheetTitle}>Seguir rota</Text>
                </View>
                <Text style={styles.sheetRoute}>
                  {rota.origem} → {rota.destino}
                </Text>
                <View style={styles.metricsRow}>
                  <View style={styles.metric}>
                    <Navigation size={16} color={colors.textPrimary} />
                    <Text style={styles.metricText}>{rota.distanciaTexto}</Text>
                  </View>
                  <View style={styles.metric}>
                    <Clock3 size={16} color={colors.textPrimary} />
                    <Text style={styles.metricText}>{rota.duracaoTexto}</Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  <Button
                    label="Abrir no Maps"
                    variant="primary"
                    onPress={abrirMapasExternos}
                    style={styles.mapsButton}
                  />
                  <Button
                    variant="secondary"
                    label="Voltar ao eletroposto"
                    onPress={() => router.back()}
                  />
                </View>
              </View>
            </GradientFill>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundEnd,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.paddingHorizontal,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: layout.paddingHorizontal,
    zIndex: 20,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: layout.paddingHorizontal,
    zIndex: 20,
  },
  sheetCard: {
    overflow: 'hidden',
  },
  sheetContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sheetTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  sheetRoute: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  metricsRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metricText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: colors.textPrimary,
  },
  actions: {
    width: '100%',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  mapsButton: {
    backgroundColor: colors.accentDark,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
});
