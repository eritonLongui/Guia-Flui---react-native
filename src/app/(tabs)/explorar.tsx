import { ScreenEdgeFades } from '@/components/ScreenEdgeFades';
import { Title } from '@/components/Title';
import { ExploreBottomSheet } from '@/components/ExploreBottomSheet';
import { Input } from '@/components/Input';
import { MapStationPopup } from '@/components/MapStationPopup';
import { MapaExplorar } from '@/components/MapaExplorar';
import { colors, layout, spacing } from '@/constants/theme';
import { eletropostoRepository } from '@/repositories/mockRepositories';
import type { Eletroposto } from '@/types';
import { router } from 'expo-router';
import { SlidersHorizontal } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ExplorarScreen() {
  const insets = useSafeAreaInsets();
  const [eletropostos, setEletropostos] = useState<Eletroposto[]>([]);
  const [busca, setBusca] = useState('');
  const [selecionado, setSelecionado] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const timer = setTimeout(async () => {
      const dados = busca
        ? await eletropostoRepository.buscar(busca)
        : await eletropostoRepository.listar();
      if (mounted) setEletropostos(dados);
    }, 150);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [busca]);

  const eletropostoSelecionado = useMemo(
    () => eletropostos.find((ep) => ep.id === selecionado) ?? null,
    [eletropostos, selecionado],
  );

  const handleSelectMarker = useCallback((id: string) => {
    setSelecionado((atual) => (atual === id ? null : id));
  }, []);

  const handleSelect = (ep: Eletroposto) => {
    router.push(`/eletroposto/${ep.id}`);
  };

  if (Platform.OS === 'web') {
    return (
      <View className="flex-1 bg-background">
        <View className="absolute left-0 right-0 top-12 z-10 flex-row items-center gap-3 px-4">
          <View className="flex-1">
            <Input
              icon
              placeholder="Buscar eletroposto"
              value={busca}
              onChangeText={setBusca}
            />
          </View>
        <Pressable
          style={styles.filterButton}
          onPress={() => Alert.alert('Filtros', 'Filtros disponíveis em breve.')}>
          <SlidersHorizontal size={20} color={colors.textPrimary} />
        </Pressable>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="font-poppins text-text-secondary">
            Mapa disponível no app mobile
          </Text>
        </View>
        <View className="absolute bottom-0 left-0 right-0 max-h-[60%] rounded-t-card bg-surface pt-4">
          <View className="mb-3 items-center px-6">
            <Title size="sm" className="text-center">
              {eletropostos.length} resultados encontrados
            </Title>
          </View>
          <View className="gap-3 px-6 pb-8">
            {eletropostos.map((ep) => (
              <Pressable key={ep.id} onPress={() => handleSelect(ep)}>
                <View className="rounded-card bg-elevated p-4">
                  <Text className="font-poppins-bold text-xl tracking-title text-text-primary">{ep.nome}</Text>
                  <Text className="mt-1 font-poppins text-xs text-text-muted">{ep.endereco}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapArea}>
        <MapaExplorar
          eletropostos={eletropostos}
          selecionado={selecionado}
          onSelectMarker={handleSelectMarker}
          onOpenDetalhe={handleSelect}
        />
      </View>

      {eletropostoSelecionado && (
        <MapStationPopup
          eletroposto={eletropostoSelecionado}
          onClose={() => setSelecionado(null)}
          onVerMais={() => handleSelect(eletropostoSelecionado)}
        />
      )}

      <View
        pointerEvents="box-none"
        style={[styles.searchBar, { top: insets.top + spacing.lg }]}>
        <View style={styles.searchInput}>
          <Input
            icon
            placeholder="Buscar eletroposto"
            value={busca}
            onChangeText={setBusca}
          />
        </View>
        <Pressable
          style={styles.filterButton}
          onPress={() => Alert.alert('Filtros', 'Filtros disponíveis em breve.')}>
          <SlidersHorizontal size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ExploreBottomSheet eletropostos={eletropostos} onSelect={handleSelect} />
      <ScreenEdgeFades />
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
    backgroundColor: colors.surface,
  },
});
