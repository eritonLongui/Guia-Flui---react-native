'use client';

import { deleteReview } from '@/app/actions/reviews';
import { Button } from '@/components/ui/button';

export function DeleteReviewButton({ id, nome }: { id: string; nome: string }) {
  return (
    <form
      action={async () => {
        const confirmed = window.confirm(`Remover a avaliação de ${nome}?`);
        if (!confirmed) return;
        await deleteReview(id);
      }}
    >
      <Button type="submit" variant="danger" size="sm">
        Remover
      </Button>
    </form>
  );
}
