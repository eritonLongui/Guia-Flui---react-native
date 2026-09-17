import { requireAdmin } from '@/lib/auth';
import type { Review, Station } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { ReviewCard } from '@/components/review-card';
import { ReviewsToolbar } from '@/components/reviews-toolbar';

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; station?: string; nota?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q.trim().toLowerCase() : '';
  const stationFilter = params.station ?? '';
  const notaFilter = params.nota ?? '';

  const [{ data: reviews }, { data: stations }] = await Promise.all([
    supabase.from('reviews').select('*').order('criado_em', { ascending: false }),
    supabase.from('stations').select('id, nome').order('nome'),
  ]);

  const stationList = (stations ?? []) as Pick<Station, 'id' | 'nome'>[];
  const stationNames = new Map(stationList.map((item) => [item.id, item.nome]));
  const list = ((reviews ?? []) as Review[]).filter((review) => {
    if (stationFilter && review.station_id !== stationFilter) return false;
    if (notaFilter && String(review.nota) !== notaFilter) return false;
    if (!q) return true;
    const haystack = `${review.nome_usuario} ${review.comentario} ${stationNames.get(review.station_id) ?? ''}`.toLowerCase();
    return haystack.includes(q);
  });

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Avaliações"
        description="Modere comentários impróprios. A nota da estação atualiza sozinha."
      />

      <ReviewsToolbar q={q} station={stationFilter} nota={notaFilter} stations={stationList} />

      {list.length === 0 ? (
        <p className="text-sm text-muted">Nenhuma avaliação com esses filtros.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              stationName={stationNames.get(review.station_id) ?? review.station_id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
