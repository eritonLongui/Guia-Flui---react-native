import type { Eletroposto, Localizacao } from '@/types';
import { forwardRef, useImperativeHandle } from 'react';
import { Text, View } from 'react-native';

export type MapaExplorarHandle = {
  centralizarOrigem: () => void;
  encaixarEstacoes: (eletropostos: Eletroposto[]) => void;
};

interface MapaExplorarProps {
  eletropostos: Eletroposto[];
  selecionado: string | null;
  origem?: Localizacao | null;
  onSelectMarker: (id: string) => void;
  onOpenDetalhe: (ep: Eletroposto) => void;
  onPressMap?: () => void;
  onOrigemForaDaVisao?: (fora: boolean) => void;
}

export const MapaExplorar = forwardRef<MapaExplorarHandle, MapaExplorarProps>(
  function MapaExplorar({ eletropostos }, ref) {
    useImperativeHandle(ref, () => ({ centralizarOrigem: () => {}, encaixarEstacoes: () => {} }), []);

    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="font-poppins text-text-secondary">
          Mapa disponível no app mobile ({eletropostos.length} estações)
        </Text>
      </View>
    );
  },
);
