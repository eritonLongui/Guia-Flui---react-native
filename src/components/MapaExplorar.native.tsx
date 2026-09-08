import { MapMarkerPin, MAP_MARKER_VIEW_SIZE } from '@/components/MapMarkerPin';
import { UserLocationPulse, USER_LOCATION_MARKER_ANCHOR } from '@/components/UserLocationPulse';
import { criarRotuloEletroposto } from '@/lib/a11y';
import { mapGrayscaleStyle } from '@/constants/mapGrayscaleStyle';
import { localizacaoUsuarioMock } from '@/data/mock';
import type { Eletroposto, Localizacao } from '@/types';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from 'react-native-maps';

const ZOOM_DELTA = 0.025;

function regiaoDaLocalizacao(loc: Localizacao, delta = ZOOM_DELTA): Region {
  return {
    latitude: loc.latitude,
    longitude: loc.longitude,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}

function origemVisivelNaRegiao(origem: Localizacao, region: Region): boolean {
  const latMin = region.latitude - region.latitudeDelta / 2;
  const latMax = region.latitude + region.latitudeDelta / 2;
  const lngMin = region.longitude - region.longitudeDelta / 2;
  const lngMax = region.longitude + region.longitudeDelta / 2;
  return (
    origem.latitude >= latMin &&
    origem.latitude <= latMax &&
    origem.longitude >= lngMin &&
    origem.longitude <= lngMax
  );
}

export type MapaExplorarHandle = {
  centralizarOrigem: () => void;
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
  function MapaExplorar(
    {
      eletropostos,
      selecionado,
      origem,
      onSelectMarker,
      onPressMap,
      onOrigemForaDaVisao,
    },
    ref,
  ) {
    const mapRef = useRef<MapView>(null);
    const onForaRef = useRef(onOrigemForaDaVisao);
    onForaRef.current = onOrigemForaDaVisao;
    const localizacao = origem ?? localizacaoUsuarioMock;
    const origemKey = `${localizacao.latitude.toFixed(5)},${localizacao.longitude.toFixed(5)}`;
    const [snapshotPins, setSnapshotPins] = useState(true);

    useEffect(() => {
      setSnapshotPins(true);
      const timer = setTimeout(() => setSnapshotPins(false), 700);
      return () => clearTimeout(timer);
    }, [selecionado]);

    const centralizarOrigem = () => {
      mapRef.current?.animateToRegion(regiaoDaLocalizacao(localizacao), 450);
      onForaRef.current?.(false);
    };

    useImperativeHandle(ref, () => ({ centralizarOrigem }), [localizacao]);

    useEffect(() => {
      if (selecionado) return;
      mapRef.current?.animateToRegion(regiaoDaLocalizacao(localizacao), 400);
      onForaRef.current?.(false);
    }, [origemKey, selecionado, localizacao]);

    useEffect(() => {
      if (!selecionado) return;
      const ep = eletropostos.find((item) => item.id === selecionado);
      if (!ep) return;
      mapRef.current?.animateToRegion(
        {
          latitude: ep.latitude,
          longitude: ep.longitude,
          latitudeDelta: ZOOM_DELTA,
          longitudeDelta: ZOOM_DELTA,
        },
        350,
      );
    }, [selecionado, eletropostos]);

    const initialRegion = regiaoDaLocalizacao(localizacao);

    return (
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={initialRegion}
          userInterfaceStyle="dark"
          mapType="standard"
          customMapStyle={mapGrayscaleStyle}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          toolbarEnabled={false}
          rotateEnabled
          pitchEnabled
          zoomEnabled
          scrollEnabled
          onPress={() => onPressMap?.()}
          onRegionChangeComplete={(region) => {
            onForaRef.current?.(!origemVisivelNaRegiao(localizacao, region));
          }}>
          <Marker
            coordinate={{
              latitude: localizacao.latitude,
              longitude: localizacao.longitude,
            }}
            anchor={USER_LOCATION_MARKER_ANCHOR}
            tracksViewChanges
            identifier="user-location"
            zIndex={2}
            accessibilityLabel="Sua localização">
            <UserLocationPulse />
          </Marker>
          {eletropostos.map((ep) => (
            <Marker
              key={ep.id}
              coordinate={{ latitude: ep.latitude, longitude: ep.longitude }}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={snapshotPins}
              zIndex={1}
              accessibilityLabel={criarRotuloEletroposto(ep)}
              onPress={() => onSelectMarker(ep.id)}>
              <View collapsable={false} style={styles.markerView}>
                <MapMarkerPin
                  selected={selecionado === ep.id}
                  nivelCompatibilidade={ep.nivelCompatibilidade}
                />
              </View>
            </Marker>
          ))}
        </MapView>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
  },
  map: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  markerView: {
    width: MAP_MARKER_VIEW_SIZE,
    height: MAP_MARKER_VIEW_SIZE,
  },
});
