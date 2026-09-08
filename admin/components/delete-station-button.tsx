'use client';

import { deleteStation } from '@/app/actions/stations';
import { Button } from '@/components/ui/button';

export function DeleteStationButton({ id, nome }: { id: string; nome: string }) {
  return (
    <form
      action={async () => {
        const confirmed = window.confirm(`Excluir "${nome}"? As avaliações deste eletroposto também saem.`);
        if (!confirmed) return;
        await deleteStation(id);
      }}
    >
      <Button type="submit" variant="danger" size="sm">
        Excluir
      </Button>
    </form>
  );
}
