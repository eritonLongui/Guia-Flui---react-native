import { UserLocationPulse, USER_LOCATION_MARKER_ANCHOR } from '@/components/UserLocationPulse';
import { mapGrayscaleStyle } from '@/constants/mapGrayscaleStyle';
import { colors } from '@/constants/theme';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

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

export const RotaMapa = forwardRef<RotaMapaHandle, RotaMapaProps>(function RotaMapa(
  { origem, destino, destinoTitulo, destinoDescricao, coordenadas },
  ref,
) {
  const mapRef = useRef<MapView>(null);

  useImperativeHandle(
    ref,
    () => ({
      enquadrar: (pontos) => {
        mapRef.current?.fitToCoordinates(pontos, {
          edgePadding: { top: 80, right: 48, bottom: 220, left: 48 },
          animated: true,
        });
      },
    }),
    [],
  );

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      provider={PROVIDER_GOOGLE}
      customMapStyle={mapGrayscaleStyle}
      showsUserLocation={false}
      showsMyLocationButton={false}
      showsCompass={false}
      toolbarEnabled={false}>
      <Polyline
        coordinates={coordenadas}
        strokeColor={colors.accent}
        strokeWidth={5}
        lineCap="round"
        lineJoin="round"
      />
      <Marker coordinate={origem} anchor={USER_LOCATION_MARKER_ANCHOR} tracksViewChanges zIndex={2}>
        <UserLocationPulse />
      </Marker>
      <Marker
        coordinate={destino}
        title={destinoTitulo}
        description={destinoDescricao}
        pinColor={colors.accent}
      />
    </MapView>
  );
});
