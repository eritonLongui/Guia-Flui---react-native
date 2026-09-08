'use client';

import dynamic from 'next/dynamic';
import type { Station } from '@/lib/types';

const StationsMapInner = dynamic(() => import('./stations-map-inner').then((mod) => mod.StationsMapInner), {
  ssr: false,
  loading: () => <div className="flex h-[70vh] items-center justify-center rounded-2xl border border-border bg-surface text-sm text-muted">Carregando mapa…</div>,
});

export function StationsMap({ stations }: { stations: Station[] }) {
  return <StationsMapInner stations={stations} />;
}
