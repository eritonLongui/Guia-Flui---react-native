import { MapMarkerPin } from '@/components/MapMarkerPin';
import { UserLocationPulse } from '@/components/UserLocationPulse';
import { mapGrayscaleStyle } from '@/constants/mapGrayscaleStyle';
import { localizacaoUsuarioMock } from '@/data/mock';
import { usuarioRepository } from '@/repositories/mockRepositories';
import type { Eletroposto, Localizacao } from '@/types';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from 'react-native-maps';

const ZOOM_DELTA = 0.025;

function regiaoDaLocalizacao(loc: Localizacao): Region {
  return {
    latitude: loc.latitude,
    longitude: loc.longitude,
    latitudeDelta: ZOOM_DELTA,
    longitudeDelta: ZOOM_DELTA,
  };
}

interface MapaExplorarProps {
  eletropostos: Eletroposto[];
  selecionado: string | null;
  onSelectMarker: (id: string) => void;
  onOpenDetalhe: (ep: Eletroposto) => void;
}

export function MapaExplorar({
  eletropostos,
  selecionado,
  onSelectMarker,
  onOpenDetalhe,
}: MapaExplorarProps) {
  const mapRef = useRef<MapView>(null);
  const [localizacao, setLocalizacao] = useState<Localizacao>(localizacaoUsuarioMock);
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  const centralizarNaLocalizacao = useCallback((loc: Localizacao) => {
    mapRef.current?.animateToRegion(regiaoDaLocalizacao(loc), 400);
  }, []);

  useEffect(() => {
    let mounted = true;

    usuarioRepository.obterLocalizacaoAtual().then((loc) => {
      if (!mounted) return;
      setLocalizacao(loc);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      usuarioRepository.obterLocalizacaoAtual().then((loc) => {
        if (!active) return;
        setLocalizacao(loc);
        centralizarNaLocalizacao(loc);
      });

      return () => {
        active = false;
      };
    }, [centralizarNaLocalizacao]),
  );

  useEffect(() => {
    setTracksViewChanges(true);
    const timer = setTimeout(() => setTracksViewChanges(false), 600);
    return () => clearTimeout(timer);
  }, [selecionado]);

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
        toolbarEnabled={false}>
        {localizacao && (
          <Marker
            coordinate={{
              latitude: localizacao.latitude,
              longitude: localizacao.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges
            identifier="user-location">
            <UserLocationPulse />
          </Marker>
        )}
        {eletropostos.map((ep) => (
          <Marker
            key={ep.id}
            coordinate={{ latitude: ep.latitude, longitude: ep.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={tracksViewChanges}
            onPress={() => onSelectMarker(ep.id)}
            onCalloutPress={() => onOpenDetalhe(ep)}>
            <MapMarkerPin selected={selecionado === ep.id} />
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
  },
  map: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
});
