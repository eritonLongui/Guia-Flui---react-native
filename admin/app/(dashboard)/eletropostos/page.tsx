import { requireAdmin } from '@/lib/auth';
import { formatNumber } from '@/lib/format';
import type { Station } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { StationCard } from '@/components/station-card';
import { StationsToolbar } from '@/components/stations-toolbar';

export default async function StationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q.trim().toLowerCase() : '';

  const { data } = await supabase.from('stations').select('*').order('nome');
  const stations = ((data ?? []) as Station[]).filter((station) => {
    if (!q) return true;
    return `${station.nome} ${station.cidade} ${station.endereco}`.toLowerCase().includes(q);
  });

  return (
    <div className="grid gap-6">
      <PageHeader title="Eletropostos" description={`${formatNumber(stations.length)} no catálogo`} />

      <StationsToolbar q={q} />

      {stations.length === 0 ? (
        <p className="text-sm text-muted">Nenhum eletroposto encontrado.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stations.map((station) => (
            <StationCard key={station.id} station={station} />
          ))}
        </div>
      )}
    </div>
  );
}
