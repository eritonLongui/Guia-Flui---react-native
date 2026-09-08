import { localizacaoUsuarioMock } from '@/data/mock';
import type { Localizacao } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const STORAGE_KEY = '@guia-flui/localizacao-manual';

let ready = false;
let manual: Localizacao | null = null;
let gpsCache: Localizacao | null = null;
let inflightGps: Promise<Localizacao> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeLocalizacao(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

async function ensureLoaded(): Promise<void> {
  if (ready) return;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      manual = JSON.parse(raw) as Localizacao;
    }
  } catch {
    manual = null;
  }
  ready = true;
}

async function lerGps(): Promise<Localizacao> {
  if (gpsCache) return gpsCache;
  if (inflightGps) return inflightGps;

  inflightGps = (async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        let endereco = 'Sua localização';
        let cidade = '';
        let estado = '';
        try {
          const places = await Location.reverseGeocodeAsync({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          const place = places[0];
          if (place) {
            endereco = [place.street, place.streetNumber].filter(Boolean).join(', ')
              || place.name
              || place.city
              || endereco;
            cidade = place.city ?? place.subregion ?? '';
            estado = place.region ?? '';
          }
        } catch {
          // reverse geocode opcional
        }

        gpsCache = {
          endereco,
          cidade,
          estado,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        return gpsCache;
      }
    } catch {
      // GPS indisponível
    }

    gpsCache = localizacaoUsuarioMock;
    return gpsCache;
  })();

  try {
    return await inflightGps;
  } finally {
    inflightGps = null;
  }
}

export async function obterLocalizacaoUsuario(): Promise<Localizacao> {
  await ensureLoaded();
  if (manual) return manual;
  return lerGps();
}

export function obterLocalizacaoAtualSincrona(): Localizacao | null {
  return manual ?? gpsCache;
}

export function temLocalizacaoManual(): boolean {
  return manual !== null;
}

export async function definirLocalizacaoManual(loc: Localizacao): Promise<void> {
  await ensureLoaded();
  manual = loc;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  notify();
}

export async function usarGpsDoAparelho(): Promise<Localizacao> {
  await ensureLoaded();
  manual = null;
  gpsCache = null;
  await AsyncStorage.removeItem(STORAGE_KEY);
  const loc = await lerGps();
  notify();
  return loc;
}

export async function usarLocalizacaoDemoSaoPaulo(): Promise<Localizacao> {
  await definirLocalizacaoManual(localizacaoUsuarioMock);
  return localizacaoUsuarioMock;
}

export interface SugestaoEndereco {
  id: string;
  titulo: string;
  subtitulo: string;
  localizacao: Localizacao;
}

/** Busca endereços/cidades no Brasil (Nominatim + fallback expo-location). */
export async function buscarEnderecos(termo: string): Promise<SugestaoEndereco[]> {
  const query = termo.trim();
  if (query.length < 2) return [];

  try {
    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?format=json&addressdetails=1&limit=6&countrycodes=br` +
      `&q=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'GuiaFlui/1.0 (rota-mobile; local-dev)',
      },
    });

    if (response.ok) {
      const data = (await response.json()) as Array<{
        place_id: number;
        display_name: string;
        lat: string;
        lon: string;
        address?: {
          road?: string;
          suburb?: string;
          neighbourhood?: string;
          city?: string;
          town?: string;
          village?: string;
          state?: string;
        };
      }>;

      if (data.length > 0) {
        return data.map((item) => {
          const cidade =
            item.address?.city || item.address?.town || item.address?.village || '';
          const bairro = item.address?.suburb || item.address?.neighbourhood || '';
          const rua = item.address?.road || '';
          const estado = item.address?.state || '';
          const titulo = rua || bairro || cidade || item.display_name.split(',')[0];
          const subtitulo = [bairro, cidade, estado].filter(Boolean).join(', ');

          return {
            id: String(item.place_id),
            titulo,
            subtitulo: subtitulo || item.display_name,
            localizacao: {
              endereco: titulo,
              cidade,
              estado,
              latitude: Number(item.lat),
              longitude: Number(item.lon),
            },
          };
        });
      }
    }
  } catch {
    // fallback abaixo
  }

  try {
    const results = await Location.geocodeAsync(`${query}, Brasil`);
    return results.slice(0, 5).map((item, index) => ({
      id: `geo-${index}-${item.latitude}-${item.longitude}`,
      titulo: query,
      subtitulo: 'Resultado da busca',
      localizacao: {
        endereco: query,
        cidade: '',
        estado: '',
        latitude: item.latitude,
        longitude: item.longitude,
      },
    }));
  } catch {
    return [];
  }
}
