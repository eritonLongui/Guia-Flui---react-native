'use client';

import Link from 'next/link';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import type { Station } from '@/lib/types';

function markerColor(station: Station) {
  if (!station.aberto_agora) return '#ff6b6b';
  if (station.nivel_seguranca === 'atencao') return '#ffb800';
  return '#31fe50';
}

export function StationsMapInner({ stations }: { stations: Station[] }) {
  const center: [number, number] = stations[0]
    ? [stations[0].latitude, stations[0].longitude]
    : [-23.55, -46.63];

  return (
    <MapContainer center={center} zoom={12} className="h-[70vh] w-full rounded-2xl" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stations.map((station) => (
        <CircleMarker
          key={station.id}
          center={[station.latitude, station.longitude]}
          radius={10}
          pathOptions={{ color: markerColor(station), fillColor: markerColor(station), fillOpacity: 0.9, weight: 2 }}
        >
          <Popup>
            <div className="min-w-44">
              <p className="font-medium">{station.nome}</p>
              <p className="text-xs text-muted">
                {station.aberto_agora ? 'Aberto' : 'Fechado'} · {station.carregadores_disponiveis}/
                {station.carregadores_total} livres
              </p>
              <Link href={`/eletropostos/${station.id}`} className="mt-2 inline-block text-xs text-accent">
                Abrir ficha
              </Link>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
