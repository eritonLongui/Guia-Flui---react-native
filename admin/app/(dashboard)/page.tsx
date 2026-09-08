import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { formatDateTime, formatNumber, labelSeguranca } from '@/lib/format';
import type { Review, Station } from '@/lib/types';
import { KpiCard } from '@/components/kpi-card';
import { OverviewCharts } from '@/components/overview-charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function OverviewPage() {
  const { supabase } = await requireAdmin();

  const [{ data: stations }, { data: profiles }, { data: reviews }, favorites] = await Promise.all([
    supabase.from('stations').select('*'),
    supabase.from('profiles').select('id, criado_em, role'),
    supabase.from('reviews').select('*').order('criado_em', { ascending: false }),
    supabase.from('favorites').select('*', { count: 'exact', head: true }),
  ]);

  const stationList = (stations ?? []) as Station[];
  const reviewList = (reviews ?? []) as Review[];
  const stationNames = new Map(stationList.map((station) => [station.id, station.nome]));

  const chargersFree = stationList.reduce((sum, station) => sum + station.carregadores_disponiveis, 0);
  const chargersTotal = stationList.reduce((sum, station) => sum + station.carregadores_total, 0);
  const closed = stationList.filter((station) => !station.aberto_agora).length;
  const attention = stationList.filter((station) => station.nivel_seguranca === 'atencao').length;
  const avgRating =
    reviewList.length > 0 ? reviewList.reduce((sum, review) => sum + review.nota, 0) / reviewList.length : 0;

  const notes = [1, 2, 3, 4, 5].map((nota) => ({
    nota: `${nota}★`,
    quantidade: reviewList.filter((review) => review.nota === nota).length,
  }));

  const cityMap = new Map<string, number>();
  for (const station of stationList) {
    cityMap.set(station.cidade, (cityMap.get(station.cidade) ?? 0) + 1);
  }
  const cities = [...cityMap.entries()].map(([cidade, quantidade]) => ({ cidade, quantidade }));

  const safetyMap = new Map<string, number>();
  for (const station of stationList) {
    const label = labelSeguranca(station.nivel_seguranca);
    safetyMap.set(label, (safetyMap.get(label) ?? 0) + 1);
  }
  const safety = [...safetyMap.entries()].map(([nivel, quantidade]) => ({ nivel, quantidade }));

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Visão geral</h1>
        <p className="mt-1 text-sm text-secondary">Números ao vivo do mesmo banco usado pelo app.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Eletropostos" value={formatNumber(stationList.length)} />
        <KpiCard label="Usuários" value={formatNumber(profiles?.length ?? 0)} />
        <KpiCard label="Avaliações" value={formatNumber(reviewList.length)} hint={`Nota média ${formatNumber(avgRating, 1)}`} />
        <KpiCard
          label="Carregadores livres"
          value={`${formatNumber(chargersFree)}/${formatNumber(chargersTotal)}`}
          hint={`${formatNumber(favorites.count ?? 0)} favoritos`}
        />
        <KpiCard label="Fechadas agora" value={formatNumber(closed)} tone={closed ? 'warning' : 'success'} />
        <KpiCard label="Segurança atenção" value={formatNumber(attention)} tone={attention ? 'danger' : 'success'} />
        <KpiCard
          label="Admins"
          value={formatNumber(profiles?.filter((profile) => profile.role === 'admin').length ?? 0)}
        />
        <KpiCard
          label="Sem avaliações"
          value={formatNumber(stationList.filter((station) => station.quantidade_avaliacoes === 0).length)}
        />
      </div>

      <OverviewCharts notes={notes} cities={cities} safety={safety} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Avaliações recentes</CardTitle>
          <Link href="/avaliacoes" className="text-sm text-accent hover:underline">
            Ver todas
          </Link>
        </CardHeader>
        <CardContent className="grid gap-3">
          {reviewList.slice(0, 8).length === 0 ? (
            <p className="text-sm text-muted">Nenhuma avaliação ainda.</p>
          ) : (
            reviewList.slice(0, 8).map((review) => (
              <div key={review.id} className="rounded-xl border border-border bg-elevated px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">
                    {review.nome_usuario} · {review.nota}★
                  </p>
                  <p className="text-xs text-muted">{formatDateTime(review.criado_em)}</p>
                </div>
                <p className="mt-1 text-sm text-secondary">{review.comentario || 'Sem comentário'}</p>
                <p className="mt-1 text-xs text-muted">{stationNames.get(review.station_id) ?? review.station_id}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
