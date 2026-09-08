import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { formatNumber, labelSeguranca } from '@/lib/format';
import type { Station } from '@/lib/types';
import { AvailabilityControls } from '@/components/availability-controls';
import { Badge } from '@/components/ui/badge';

function safetyVariant(nivel: string) {
  if (nivel === 'seguro') return 'success' as const;
  if (nivel === 'atencao') return 'danger' as const;
  return 'warning' as const;
}

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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Eletropostos</h1>
          <p className="mt-1 text-sm text-secondary">{formatNumber(stations.length)} no catálogo</p>
        </div>
        <Link
          href="/eletropostos/novo"
          className="inline-flex h-10 items-center rounded-xl bg-accent px-4 text-sm font-medium text-black hover:bg-accent/90"
        >
          Novo eletroposto
        </Link>
      </div>

      <form className="flex max-w-xl gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome, cidade ou endereço"
          className="h-10 w-full rounded-xl border border-border bg-elevated px-3 text-sm"
        />
        <button type="submit" className="h-10 shrink-0 rounded-xl bg-elevated px-4 text-sm text-foreground">
          Buscar
        </button>
      </form>

      <div className="grid gap-3">
        {stations.map((station) => (
          <article key={station.id} className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link href={`/eletropostos/${station.id}`} className="font-heading text-base font-semibold hover:text-accent">
                  {station.nome}
                </Link>
                <p className="text-sm text-secondary">
                  {station.endereco} · {station.cidade}/{station.estado}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant={station.aberto_agora ? 'success' : 'danger'}>
                    {station.aberto_agora ? 'Aberto' : 'Fechado'}
                  </Badge>
                  <Badge variant={safetyVariant(station.nivel_seguranca)}>{labelSeguranca(station.nivel_seguranca)}</Badge>
                  <Badge>
                    {station.carregadores_disponiveis}/{station.carregadores_total} livres
                  </Badge>
                  <Badge>
                    {formatNumber(station.nota, 1)} ★ · {station.quantidade_avaliacoes}
                  </Badge>
                </div>
              </div>
              <Link href={`/eletropostos/${station.id}`} className="text-sm text-accent hover:underline">
                Editar
              </Link>
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <AvailabilityControls station={station} />
            </div>
          </article>
        ))}
        {stations.length === 0 ? <p className="text-sm text-muted">Nenhum eletroposto encontrado.</p> : null}
      </div>
    </div>
  );
}
