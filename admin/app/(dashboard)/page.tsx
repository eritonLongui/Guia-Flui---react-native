import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { requireAdmin } from '@/lib/auth';
import { countByLabel, countByWeek, countLastDays, uniqueIdsLastDays, usersByWeek } from '@/lib/analytics';
import { formatNumber } from '@/lib/format';
import type { Review, Station } from '@/lib/types';
import { KpiCard } from '@/components/kpi-card';
import { OverviewCharts } from '@/components/overview-charts';
import { PageHeader } from '@/components/page-header';
import { IconLink } from '@/components/icon-link';

type AuthActivity = {
  user_id: string;
  occurred_at: string;
};

export default async function OverviewPage() {
  const { supabase } = await requireAdmin();

  const [{ data: stations }, { data: profiles }, { data: reviews }, { data: vehicles }, activityResult] =
    await Promise.all([
      supabase.from('stations').select('*'),
      supabase.from('profiles').select('id, criado_em, role'),
      supabase.from('reviews').select('*').order('criado_em', { ascending: false }),
      supabase.from('vehicles').select('user_id'),
      supabase.rpc('admin_user_activity'),
    ]);

  const stationList = (stations ?? []) as Station[];
  const reviewList = (reviews ?? []) as Review[];
  const profileDates = (profiles ?? []).map((profile) => profile.criado_em);
  const usersWithVehicle = new Set((vehicles ?? []).map((vehicle) => vehicle.user_id)).size;
  const activity = ((activityResult.data ?? []) as AuthActivity[]).map((row) => ({
    id: row.user_id,
    date: row.occurred_at,
  }));

  const mau = uniqueIdsLastDays(activity, 30);
  const wau = uniqueIdsLastDays(activity, 7);

  const ranked = [...stationList]
    .filter((station) => station.quantidade_avaliacoes > 0)
    .sort((a, b) => b.nota - a.nota || b.quantidade_avaliacoes - a.quantidade_avaliacoes)
    .slice(0, 10);

  return (
    <div className="grid gap-6">
      <PageHeader title="Visão geral" description="Métricas de uso, cadastro e da rede." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Usuários"
          value={formatNumber(profiles?.length ?? 0)}
          hint={`${formatNumber(usersWithVehicle)} com veículo`}
        />
        <KpiCard
          label="Ativos · 30 dias"
          value={formatNumber(mau)}
          hint="Pessoas que entraram no app nos últimos 30 dias"
        />
        <KpiCard
          label="Ativos · 7 dias"
          value={formatNumber(wau)}
          hint="Pessoas que entraram no app nos últimos 7 dias"
        />
        <KpiCard
          label="Cadastros · 30 dias"
          value={formatNumber(countLastDays(profileDates, 30))}
          hint="Contas novas neste período"
        />
      </div>

      <OverviewCharts
        users={usersByWeek(profileDates, activity)}
        reviews={countByWeek(reviewList.map((review) => review.criado_em))}
        cities={countByLabel(stationList.map((station) => station.cidade), 5)}
      />

      <section className="surface-card overflow-x-auto">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-title text-base">Top 10 mais bem avaliados</h2>
          <IconLink href="/eletropostos" label="Ver catálogo" className="size-10">
            <ChevronRight className="size-4" />
          </IconLink>
        </div>
        {ranked.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted">Ainda não há notas suficientes.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="font-title text-[12px] text-muted">
              <tr>
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Eletroposto</th>
                <th className="px-5 py-3">Cidade</th>
                <th className="px-5 py-3">Nota</th>
                <th className="px-5 py-3">Avaliações</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((station, index) => (
                <tr key={station.id} className="border-t border-border">
                  <td className="px-5 py-3 text-muted">{index + 1}</td>
                  <td className="px-5 py-3">
                    <Link href={`/eletropostos/${station.id}`} className="font-medium hover:text-accent">
                      {station.nome}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-secondary">{station.cidade}</td>
                  <td className="px-5 py-3">{formatNumber(station.nota, 1)} ★</td>
                  <td className="px-5 py-3 text-muted">{formatNumber(station.quantidade_avaliacoes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
