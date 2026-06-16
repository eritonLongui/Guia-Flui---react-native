import { ExploreBottomSheet } from '@/components/ExploreBottomSheet';
import { Input } from '@/components/Input';
import { colors } from '@/constants/theme';
import { eletropostoRepository } from '@/repositories/mockRepositories';
import type { Eletroposto } from '@/types';
import { router } from 'expo-router';
import { SlidersHorizontal } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, Pressable, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const REGIAO_SP = {
  latitude: -23.5505,
  longitude: -46.6333,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

export default function ExplorarScreen() {
  const [eletropostos, setEletropostos] = useState<Eletroposto[]>([]);
  const [busca, setBusca] = useState('');
  const [selecionado, setSelecionado] = useState<string | null>(null);

  const carregar = useCallback(async (termo = '') => {
    const dados = termo
      ? await eletropostoRepository.buscar(termo)
      : await eletropostoRepository.listar();
    setEletropostos(dados);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    const timer = setTimeout(() => carregar(busca), 300);
    return () => clearTimeout(timer);
  }, [busca, carregar]);

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
            className="h-12 w-12 items-center justify-center rounded-input border border-border bg-surface"
            onPress={() => Alert.alert('Filtros', 'Filtros disponíveis em breve.')}>
            <SlidersHorizontal size={20} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="font-inter text-text-secondary">
            Mapa disponível no app mobile
          </Text>
        </View>
        <View className="absolute bottom-0 left-0 right-0 max-h-[60%] rounded-t-card bg-surface pt-4">
          <Text className="mb-3 px-6 font-poppins text-base text-text-primary">
            {eletropostos.length} resultados encontrados
          </Text>
          <View className="gap-3 px-6 pb-8">
            {eletropostos.map((ep) => (
              <Pressable key={ep.id} onPress={() => handleSelect(ep)}>
                <View className="rounded-card border border-border bg-elevated p-4">
                  <Text className="font-poppins text-base text-text-primary">{ep.nome}</Text>
                  <Text className="mt-1 font-inter text-xs text-text-muted">{ep.endereco}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <MapView style={{ flex: 1 }} initialRegion={REGIAO_SP} userInterfaceStyle="dark">
        {eletropostos.map((ep) => (
          <Marker
            key={ep.id}
            coordinate={{ latitude: ep.latitude, longitude: ep.longitude }}
            title={ep.nome}
            description={`★ ${ep.nota} · ${ep.nivelCompatibilidade}`}
            pinColor={selecionado === ep.id ? colors.accent : colors.info}
            onPress={() => setSelecionado(ep.id)}
            onCalloutPress={() => handleSelect(ep)}
          />
        ))}
      </MapView>

      <View className="absolute left-0 right-0 top-14 z-10 flex-row items-center gap-3 px-4">
        <View className="flex-1">
          <Input
            icon
            placeholder="Buscar eletroposto"
            value={busca}
            onChangeText={setBusca}
          />
        </View>
        <Pressable
          className="h-12 w-12 items-center justify-center rounded-input border border-border bg-surface"
          onPress={() => Alert.alert('Filtros', 'Filtros disponíveis em breve.')}>
          <SlidersHorizontal size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ExploreBottomSheet eletropostos={eletropostos} onSelect={handleSelect} />
    </View>
  );
}
