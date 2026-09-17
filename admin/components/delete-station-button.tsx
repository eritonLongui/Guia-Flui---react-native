'use client';

import { Trash2 } from 'lucide-react';
import { deleteStation } from '@/app/actions/stations';

export function DeleteStationButton({ id, nome }: { id: string; nome: string }) {
  return (
    <form
      action={async () => {
        const confirmed = window.confirm(`Excluir "${nome}"? As avaliações deste eletroposto também saem.`);
        if (!confirmed) return;
        await deleteStation(id);
      }}
    >
      <button
        type="submit"
        aria-label={`Excluir ${nome}`}
        title="Excluir"
        className="flex size-9 items-center justify-center rounded-xl text-muted hover:bg-elevated hover:text-danger"
      >
        <Trash2 className="size-4" />
      </button>
    </form>
  );
}
