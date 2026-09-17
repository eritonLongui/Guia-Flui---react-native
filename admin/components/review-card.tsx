import Link from 'next/link';
import { Pencil, Star } from 'lucide-react';
import { formatDateTime } from '@/lib/format';
import { textoAvaliacao } from '@/lib/reviewComment';
import type { Review } from '@/lib/types';
import { DeleteReviewButton } from '@/components/delete-review-button';

export function ReviewCard({
  review,
  stationName,
}: {
  review: Review;
  stationName: string;
}) {
  return (
    <article className="surface-card flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{review.nome_usuario}</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-warning">
            <Star aria-hidden={true} className="size-3.5 fill-current" />
            {review.nota}
          </p>
        </div>
        <div className="flex shrink-0 items-center">
          <Link
            href={`/eletropostos/${review.station_id}`}
            aria-label="Ver eletroposto"
            title="Ver eletroposto"
            className="flex size-9 items-center justify-center rounded-xl text-muted hover:bg-elevated hover:text-foreground"
          >
            <Pencil className="size-4" />
          </Link>
          <DeleteReviewButton id={review.id} nome={review.nome_usuario} />
        </div>
      </div>

      <p className="mt-4 line-clamp-4 flex-1 text-sm leading-6 text-secondary">
        {textoAvaliacao(review.comentario)}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
        <Link href={`/eletropostos/${review.station_id}`} className="truncate text-xs text-muted hover:text-accent">
          {stationName}
        </Link>
        <p className="shrink-0 text-xs text-muted">{formatDateTime(review.criado_em)}</p>
      </div>
    </article>
  );
}
