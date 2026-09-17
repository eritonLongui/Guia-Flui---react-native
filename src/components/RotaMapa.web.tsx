import { colors } from '@/constants/theme';
import { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type CoordenadaRota = {
  latitude: number;
  longitude: number;
};

export type RotaMapaHandle = {
  enquadrar: (coordenadas: CoordenadaRota[]) => void;
};

interface RotaMapaProps {
  origem: CoordenadaRota;
  destino: CoordenadaRota;
  destinoTitulo: string;
  destinoDescricao: string;
  coordenadas: CoordenadaRota[];
}

export const RotaMapa = forwardRef<RotaMapaHandle, RotaMapaProps>(function RotaMapa(_props, ref) {
  useImperativeHandle(ref, () => ({ enquadrar: () => {} }), []);

  return (
    <View style={styles.fallback}>
      <Text style={styles.texto}>Mapa disponível no app mobile</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  fallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundEnd,
  },
  texto: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
});
