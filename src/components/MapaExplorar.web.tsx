import type { Eletroposto } from '@/types';
import { Text, View } from 'react-native';

interface MapaExplorarProps {
  eletropostos: Eletroposto[];
  selecionado: string | null;
  onSelectMarker: (id: string) => void;
  onOpenDetalhe: (ep: Eletroposto) => void;
}

export function MapaExplorar({ eletropostos }: MapaExplorarProps) {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="font-poppins text-text-secondary">
        Mapa disponível no app mobile ({eletropostos.length} estações)
      </Text>
    </View>
  );
}
