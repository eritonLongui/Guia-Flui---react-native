import Link from 'next/link';
import { Clock, MapPin, Pencil, Plug, Star } from 'lucide-react';
import { formatNumber } from '@/lib/format';
import type { Station } from '@/lib/types';
import { DeleteStationButton } from '@/components/delete-station-button';

export function StationCard({ station }: { station: Station }) {
  const temAvaliacoes = station.quantidade_avaliacoes > 0;
  const conectores = station.conectores.reduce((total, item) => total + item.quantidade, 0);

  return (
    <article className="surface-card flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/eletropostos/${station.id}`} className="line-clamp-2 font-medium hover:text-accent">
            {station.nome}
          </Link>
          <p className="mt-1 flex items-center gap-1 text-sm text-warning">
            <Star aria-hidden={true} className="size-3.5 fill-current" />
            {temAvaliacoes ? (
              <>
                {formatNumber(station.nota, 1)}
                <span className="text-muted"> · {station.quantidade_avaliacoes}</span>
              </>
            ) : (
              <span className="text-muted">Sem avaliação</span>
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center">
          <Link
            href={`/eletropostos/${station.id}`}
            aria-label="Editar eletroposto"
            title="Editar"
            className="flex size-9 items-center justify-center rounded-xl text-muted hover:bg-elevated hover:text-foreground"
          >
            <Pencil className="size-4" />
          </Link>
          <DeleteStationButton id={station.id} nome={station.nome} />
        </div>
      </div>

      <p className="mt-3 flex items-center gap-2 text-sm text-secondary">
        <MapPin aria-hidden={true} className="size-4 shrink-0 text-muted" />
        <span className="truncate">
          {station.cidade}/{station.estado}
        </span>
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-sm text-secondary">
        <p className="flex min-w-0 items-center gap-2">
          <Clock aria-hidden={true} className="size-4 shrink-0 text-muted" />
          <span className="truncate">{station.horario_funcionamento}</span>
        </p>
        <p className="flex shrink-0 items-center gap-1.5">
          <Plug aria-hidden={true} className="size-4 text-muted" />
          {conectores}
        </p>
      </div>
    </article>
  );
}
