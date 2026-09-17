'use client';

import { Trash2 } from 'lucide-react';
import { deleteReview } from '@/app/actions/reviews';

export function DeleteReviewButton({ id, nome }: { id: string; nome: string }) {
  return (
    <form
      action={async () => {
        const confirmed = window.confirm(`Remover a avaliação de ${nome}?`);
        if (!confirmed) return;
        await deleteReview(id);
      }}
    >
      <button
        type="submit"
        aria-label={`Remover avaliação de ${nome}`}
        title="Remover"
        className="flex size-9 items-center justify-center rounded-xl text-muted hover:bg-elevated hover:text-danger"
      >
        <Trash2 className="size-4" />
      </button>
    </form>
  );
}
