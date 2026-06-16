import { Button } from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
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
import { Lightbulb, MapPin, Route } from 'lucide-react-native';
import { colors } from '@/constants/theme';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function HomeScreen() {
  const { veiculo, carregando: carregandoVeiculo } = useVeiculoAtivo();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [proximos, setProximos] = useState<Eletroposto[]>([]);
  const [recomendado, setRecomendado] = useState<Eletroposto | null>(null);
  const [ultimaRota, setUltimaRota] = useState<Rota | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const [u, p, r, rota] = await Promise.all([
        usuarioRepository.obterAtual(),
        eletropostoRepository.listarProximos(3),
        eletropostoRepository.listarRecomendados(1),
        usuarioRepository.obterAtual().then((usr) => rotaRepository.obterUltima(usr.id)),
      ]);
      setUsuario(u);
      setProximos(p);
      setRecomendado(r[0] ?? null);
      setUltimaRota(rota);
      setCarregando(false);
    }
    carregar();
  }, []);

  if (carregando || carregandoVeiculo) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator color={colors.accent} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <View className="pt-4">
        <Text className="font-inter text-base text-text-secondary">{obterSaudacao()},</Text>
        <Text className="font-poppins text-2xl text-text-primary">{usuario?.nome}</Text>
      </View>

      {veiculo && (
        <View className="mt-6">
          <VehicleCard veiculo={veiculo} />
        </View>
      )}

      <View className="mt-6">
        <Button
          label="Encontrar Recarga"
          onPress={() => router.push('/(tabs)/explorar')}
        />
      </View>

      <View className="mt-8">
        <View className="mb-3 flex-row items-center gap-2">
          <MapPin size={18} color={colors.accent} />
          <Text className="font-poppins text-lg text-text-primary">Perto de Você</Text>
        </View>
        <View className="gap-3">
          {proximos.map((ep) => (
            <StationCard
              key={ep.id}
              eletroposto={ep}
              onPress={() => router.push(`/eletroposto/${ep.id}`)}
            />
          ))}
        </View>
      </View>

      {recomendado && (
        <View className="mt-8">
          <Text className="mb-3 font-poppins text-lg text-text-primary">
            Recomendado para Você
          </Text>
          <StationCard
            eletroposto={recomendado}
            onPress={() => router.push(`/eletroposto/${recomendado.id}`)}
          />
        </View>
      )}

      {ultimaRota && (
        <View className="mt-8 rounded-card border border-border bg-surface p-5">
          <View className="mb-3 flex-row items-center gap-2">
            <Route size={18} color={colors.accent} />
            <Text className="font-poppins text-lg text-text-primary">Última Rota</Text>
          </View>
          <Text className="font-inter text-sm text-text-secondary">
            {ultimaRota.origem} → {ultimaRota.destino}
          </Text>
          <Text className="mt-2 font-inter text-base text-text-primary">
            {ultimaRota.distanciaEstimada} · {ultimaRota.tempoEstimado}
          </Text>
        </View>
      )}

      <View className="mt-8 rounded-card border border-border bg-elevated p-5">
        <View className="mb-2 flex-row items-center gap-2">
          <Lightbulb size={18} color={colors.warning} />
          <Text className="font-poppins text-base text-text-primary">Dica de Recarga</Text>
        </View>
        <Text className="font-inter text-sm leading-5 text-text-secondary">
          Carregue até 80% em viagens longas para preservar a bateria e reduzir o tempo de
          espera na fila.
        </Text>
      </View>
    </ScreenContainer>
  );
}
