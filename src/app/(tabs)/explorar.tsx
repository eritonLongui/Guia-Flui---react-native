import { ExploreResultsSheet } from '@/components/ExploreResultsSheet';
import { FiltrosSheet } from '@/components/FiltrosSheet';
import { Input } from '@/components/Input';
import { MapStationPopup } from '@/components/MapStationPopup';
import { MapaExplorar, type MapaExplorarHandle } from '@/components/MapaExplorar';
import { ScreenBottomFade } from '@/components/ScreenBottomFade';
import { colors, layout, spacing } from '@/constants/theme';
import { HIT_SLOP_PADRAO } from '@/lib/a11y';
import { registrarBusca } from '@/lib/historicoLocal';
import { useExplorarQuery } from '@/providers/ExplorarQueryProvider';
import { useLocalizacao } from '@/providers/LocalizacaoProvider';
import type { Eletroposto } from '@/types';
import { router } from 'expo-router';
import { Locate, SlidersHorizontal } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type TextInput,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ExplorarScreen() {
  const insets = useSafeAreaInsets();
  const { localizacao, isManual } = useLocalizacao();
  const { busca, setBusca, filtros, setFiltros, filtrados, filtrosAtivos } = useExplorarQuery();

  const buscaRef = useRef<TextInput>(null);
  const mapaRef = useRef<MapaExplorarHandle>(null);

  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [resultadosAbertos, setResultadosAbertos] = useState(false);
  const [origemForaDaVisao, setOrigemForaDaVisao] = useState(false);

  const eletropostoSelecionado = useMemo(
    () => filtrados.find((ep) => ep.id === selecionado) ?? null,
    [filtrados, selecionado],
  );

  const fecharResultados = useCallback(() => {
    setResultadosAbertos(false);
    buscaRef.current?.blur();
    Keyboard.dismiss();
  }, []);
  useEffect(() => {
    if (selecionado && !filtrados.some((ep) => ep.id === selecionado)) {
      setSelecionado(null);
    }
  }, [filtrados, selecionado]);

  const handleSelectMarker = useCallback((id: string) => {
    setResultadosAbertos(false);
    buscaRef.current?.blur();
    Keyboard.dismiss();
    setSelecionado((atual) => (atual === id ? null : id));
  }, []);

  const handleSelect = (ep: Eletroposto) => {
    registrarBusca(busca);
    router.push(`/eletroposto/${ep.id}`);
  };

  const centralizarOrigem = () => {
    if (selecionado) {
      setSelecionado(null);
      return;
    }
    mapaRef.current?.centralizarOrigem();
  };

  const tabBarTop =
    insets.bottom + layout.floatingTabBar.bottomOffset + layout.floatingTabBar.height;

  if (Platform.OS === 'web') {
    return (
      <View className="flex-1 bg-background">
        <View className="absolute left-0 right-0 top-12 z-10 flex-row items-center gap-3 px-4">
          <View className="flex-1">
            <Input
              icon
              placeholder="Buscar eletroposto"
              accessibilityLabel="Buscar eletroposto"
              value={busca}
              onChangeText={setBusca}
            />
          </View>
          <Pressable
            style={[styles.filterButton, filtrosAtivos > 0 && styles.filterButtonActive]}
            accessibilityRole="button"
            accessibilityLabel={
              filtrosAtivos > 0
                ? `Filtros, ${filtrosAtivos} ativos`
                : 'Filtros e localização'
            }
            accessibilityHint="Abre filtros e definição de localização"
            hitSlop={HIT_SLOP_PADRAO}
            onPress={() => setFiltrosAbertos(true)}>
            <SlidersHorizontal aria-hidden={true} size={20} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="font-poppins text-text-secondary">
            Mapa disponível no app mobile
          </Text>
        </View>
        <FiltrosSheet
          visible={filtrosAbertos}
          value={filtros}
          onClose={() => setFiltrosAbertos(false)}
          onApply={setFiltros}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapArea}>
        <MapaExplorar
          ref={mapaRef}
          eletropostos={filtrados}
          selecionado={selecionado}
          origem={localizacao}
          onSelectMarker={handleSelectMarker}
          onOpenDetalhe={handleSelect}
          onPressMap={fecharResultados}
          onOrigemForaDaVisao={setOrigemForaDaVisao}
        />
      </View>

      {eletropostoSelecionado && (
        <MapStationPopup
          key={eletropostoSelecionado.id}
          eletroposto={eletropostoSelecionado}
          onClose={() => setSelecionado(null)}
          onVerMais={() => handleSelect(eletropostoSelecionado)}
        />
      )}

      {origemForaDaVisao && !resultadosAbertos ? (
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(140)}
          pointerEvents="box-none"
          style={[styles.recenterWrap, { bottom: tabBarTop + spacing.md }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Centralizar na sua localização"
            accessibilityHint="Move o mapa de volta para o ponto de origem"
            hitSlop={HIT_SLOP_PADRAO}
            onPress={centralizarOrigem}
            style={styles.recenterButton}>
            <Locate aria-hidden={true} size={16} color={colors.textPrimary} />
            <Text style={styles.recenterLabel}>Centralizar</Text>
          </Pressable>
        </Animated.View>
      ) : null}

      <View
        pointerEvents="box-none"
        style={[styles.searchBar, { top: insets.top + spacing.lg }]}>
        <View style={styles.searchInput}>
          <Input
            ref={buscaRef}
            icon
            placeholder="Buscar eletroposto"
            accessibilityLabel="Buscar eletroposto"
            value={busca}
            onChangeText={(texto) => {
              setBusca(texto);
              setResultadosAbertos(true);
            }}
            onFocus={() => {
              setSelecionado(null);
              setResultadosAbertos(true);
            }}
            returnKeyType="search"
            onSubmitEditing={() => {
              registrarBusca(busca);
              setResultadosAbertos(true);
            }}
            autoCorrect={false}
            autoComplete="off"
            textContentType="none"
          />
        </View>
        <Pressable
          style={[
            styles.filterButton,
            (filtrosAtivos > 0 || isManual) && styles.filterButtonActive,
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            filtrosAtivos > 0
              ? `Filtros, ${filtrosAtivos} ativos`
              : 'Filtros e localização'
          }
          accessibilityHint="Abre filtros e definição de localização"
          hitSlop={HIT_SLOP_PADRAO}
          onPress={() => {
            fecharResultados();
            setFiltrosAbertos(true);
          }}>
          <SlidersHorizontal aria-hidden={true} size={20} color={colors.textPrimary} />
          {filtrosAtivos > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{filtrosAtivos}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <ExploreResultsSheet
        visible={resultadosAbertos}
        eletropostos={filtrados}
        onSelect={handleSelect}
        onClose={fecharResultados}
        topOffset={insets.top + spacing.lg + layout.searchHeight + spacing.md}
      />

      <ScreenBottomFade
        gradientId="explorarBottomFade"
        style={styles.bottomFade}
      />

      <FiltrosSheet
        visible={filtrosAbertos}
        value={filtros}
        onClose={() => setFiltrosAbertos(false)}
        onApply={setFiltros}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mapArea: {
    flex: 1,
    overflow: 'hidden',
  },
  bottomFade: {
    zIndex: 48,
    elevation: 48,
  },
  searchBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  searchInput: {
    flex: 1,
  },
  filterButton: {
    width: layout.searchHeight,
    height: layout.searchHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: layout.inputRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceEnd,
  },
  filterButtonActive: {
    borderColor: colors.accentBorder,
  },
  recenterWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 44,
  },
  recenterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceEnd,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 6,
  },
  recenterLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: colors.textPrimary,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 3,
  },
  badgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: colors.backgroundEnd,
  },
});
