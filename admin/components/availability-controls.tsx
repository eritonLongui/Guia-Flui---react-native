'use client';

import { toggleStationOpen, updateChargers } from '@/app/actions/stations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Station } from '@/lib/types';

export function AvailabilityControls({ station }: { station: Station }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <form action={toggleStationOpen.bind(null, station.id, !station.aberto_agora)}>
        <Button type="submit" variant={station.aberto_agora ? 'secondary' : 'default'} size="sm">
          {station.aberto_agora ? 'Marcar fechado' : 'Marcar aberto'}
        </Button>
      </form>
      <form action={updateChargers.bind(null, station.id)} className="flex items-end gap-2">
        <label className="grid gap-1 text-xs text-muted">
          Livres
          <Input
            name="carregadores_disponiveis"
            type="number"
            min={0}
            defaultValue={station.carregadores_disponiveis}
            className="h-8 w-20"
          />
        </label>
        <label className="grid gap-1 text-xs text-muted">
          Total
          <Input
            name="carregadores_total"
            type="number"
            min={0}
            defaultValue={station.carregadores_total}
            className="h-8 w-20"
          />
        </label>
        <Button type="submit" size="sm" variant="outline">
          Atualizar
        </Button>
      </form>
    </div>
  );
}
