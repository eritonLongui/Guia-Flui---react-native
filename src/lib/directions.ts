import { decodePolyline } from '@/lib/polyline';
import { getGoogleMapsApiKey } from '@/lib/googleMapsKey';

export interface RotaCalculada {
  coordenadas: { latitude: number; longitude: number }[];
  distanciaMetros: number;
  duracaoSegundos: number;
  distanciaTexto: string;
  duracaoTexto: string;
  origem: string;
  destino: string;
  provedor: 'google' | 'osrm' | 'direta';
}

function formatarDistancia(metros: number): string {
  if (metros < 1000) return `${Math.round(metros)} m`;
  return `${(metros / 1000).toFixed(1).replace('.', ',')} km`;
}

function formatarDuracao(segundos: number): string {
  const minutos = Math.max(1, Math.round(segundos / 60));
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

function haversineMetros(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function rotaDireta(
  origem: { latitude: number; longitude: number },
  destino: { latitude: number; longitude: number },
  labels: { origem: string; destino: string },
): RotaCalculada {
  const distanciaMetros = haversineMetros(origem, destino);
  const duracaoSegundos = Math.round((distanciaMetros / 1000 / 35) * 3600);
  return {
    coordenadas: [origem, destino],
    distanciaMetros,
    duracaoSegundos,
    distanciaTexto: formatarDistancia(distanciaMetros),
    duracaoTexto: formatarDuracao(duracaoSegundos),
    origem: labels.origem,
    destino: labels.destino,
    provedor: 'direta',
  };
}

async function viaGoogle(
  origem: { latitude: number; longitude: number },
  destino: { latitude: number; longitude: number },
  labels: { origem: string; destino: string },
): Promise<RotaCalculada | null> {
  const key = getGoogleMapsApiKey();
  if (!key) return null;

  const url =
    `https://maps.googleapis.com/maps/api/directions/json` +
    `?origin=${origem.latitude},${origem.longitude}` +
    `&destination=${destino.latitude},${destino.longitude}` +
    `&mode=driving&language=pt-BR&key=${key}`;

  const response = await fetch(url);
  if (!response.ok) return null;

  const data = (await response.json()) as {
    status: string;
    routes?: Array<{
      overview_polyline?: { points?: string };
      legs?: Array<{
        distance?: { value?: number; text?: string };
        duration?: { value?: number; text?: string };
      }>;
    }>;
  };

  const route = data.routes?.[0];
  const points = route?.overview_polyline?.points;
  if (data.status !== 'OK' || !route || !points) {
    return null;
  }

  const leg = route.legs?.[0];
  const coordenadas = decodePolyline(points);
  const distanciaMetros = leg?.distance?.value ?? haversineMetros(origem, destino);
  const duracaoSegundos = leg?.duration?.value ?? Math.round((distanciaMetros / 1000 / 35) * 3600);

  return {
    coordenadas,
    distanciaMetros,
    duracaoSegundos,
    distanciaTexto: leg?.distance?.text ?? formatarDistancia(distanciaMetros),
    duracaoTexto: leg?.duration?.text ?? formatarDuracao(duracaoSegundos),
    origem: labels.origem,
    destino: labels.destino,
    provedor: 'google',
  };
}

async function viaOsrm(
  origem: { latitude: number; longitude: number },
  destino: { latitude: number; longitude: number },
  labels: { origem: string; destino: string },
): Promise<RotaCalculada | null> {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${origem.longitude},${origem.latitude};${destino.longitude},${destino.latitude}` +
    `?overview=full&geometries=geojson`;

  const response = await fetch(url);
  if (!response.ok) return null;

  const data = (await response.json()) as {
    code?: string;
    routes?: Array<{
      distance?: number;
      duration?: number;
      geometry?: { coordinates?: [number, number][] };
    }>;
  };

  const route = data.routes?.[0];
  const coords = route?.geometry?.coordinates;
  if (data.code !== 'Ok' || !coords?.length) return null;

  const distanciaMetros = route?.distance ?? haversineMetros(origem, destino);
  const duracaoSegundos = Math.round(route?.duration ?? (distanciaMetros / 1000 / 35) * 3600);

  return {
    coordenadas: coords.map(([longitude, latitude]) => ({ latitude, longitude })),
    distanciaMetros,
    duracaoSegundos,
    distanciaTexto: formatarDistancia(distanciaMetros),
    duracaoTexto: formatarDuracao(duracaoSegundos),
    origem: labels.origem,
    destino: labels.destino,
    provedor: 'osrm',
  };
}

/** Calcula rota dirigindo: Google Directions → OSRM → linha direta. */
export async function calcularRotaDirigindo(
  origem: { latitude: number; longitude: number },
  destino: { latitude: number; longitude: number },
  labels: { origem: string; destino: string },
): Promise<RotaCalculada> {
  try {
    const google = await viaGoogle(origem, destino, labels);
    if (google) return google;
  } catch {
    // tenta fallback
  }

  try {
    const osrm = await viaOsrm(origem, destino, labels);
    if (osrm) return osrm;
  } catch {
    // tenta fallback
  }

  return rotaDireta(origem, destino, labels);
}
