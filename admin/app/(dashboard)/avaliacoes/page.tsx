import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { formatDateTime } from '@/lib/format';
import type { Review, Station } from '@/lib/types';
import { DeleteReviewButton } from '@/components/delete-review-button';
import { Badge } from '@/components/ui/badge';

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ station?: string; nota?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const stationFilter = params.station ?? '';
  const notaFilter = params.nota ?? '';

  const [{ data: reviews }, { data: stations }] = await Promise.all([
    supabase.from('reviews').select('*').order('criado_em', { ascending: false }),
    supabase.from('stations').select('id, nome').order('nome'),
  ]);

  const stationNames = new Map(((stations ?? []) as Pick<Station, 'id' | 'nome'>[]).map((station) => [station.id, station.nome]));
  const list = ((reviews ?? []) as Review[]).filter((review) => {
    if (stationFilter && review.station_id !== stationFilter) return false;
    if (notaFilter && String(review.nota) !== notaFilter) return false;
    return true;
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Avaliações</h1>
        <p className="mt-1 text-sm text-secondary">Modere comentários impróprios. A nota da estação atualiza sozinha.</p>
      </div>

      <form className="flex flex-wrap gap-3">
        <select name="station" defaultValue={stationFilter} className="h-10 rounded-xl border border-border bg-elevated px-3 text-sm">
          <option value="">Todas as estações</option>
          {(stations ?? []).map((station) => (
            <option key={station.id} value={station.id}>
              {station.nome}
            </option>
          ))}
        </select>
        <select name="nota" defaultValue={notaFilter} className="h-10 rounded-xl border border-border bg-elevated px-3 text-sm">
          <option value="">Todas as notas</option>
          {[5, 4, 3, 2, 1].map((nota) => (
            <option key={nota} value={nota}>
              {nota} estrelas
            </option>
          ))}
        </select>
        <button type="submit" className="h-10 rounded-xl bg-accent px-4 text-sm font-medium text-black">
          Filtrar
        </button>
      </form>

      <div className="grid gap-3">
        {list.map((review) => (
          <article key={review.id} className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {review.nome_usuario} · {review.nota}★
                </p>
                <p className="text-sm text-secondary">{review.comentario || 'Sem comentário'}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge>
                    <Link href={`/eletropostos/${review.station_id}`}>
                      {stationNames.get(review.station_id) ?? review.station_id}
                    </Link>
                  </Badge>
                  <Badge>{formatDateTime(review.criado_em)}</Badge>
                </div>
              </div>
              <DeleteReviewButton id={review.id} nome={review.nome_usuario} />
            </div>
          </article>
        ))}
        {list.length === 0 ? <p className="text-sm text-muted">Nenhuma avaliação com esses filtros.</p> : null}
      </div>
    </div>
  );
}
