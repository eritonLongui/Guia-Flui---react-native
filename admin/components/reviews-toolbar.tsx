'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchField } from '@/components/search-field';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export function ReviewsToolbar({
  q,
  station,
  nota,
  stations,
}: {
  q: string;
  station: string;
  nota: string;
  stations: { id: string; nome: string }[];
}) {
  const [open, setOpen] = useState(false);
  const activeFilters = Number(Boolean(station)) + Number(Boolean(nota));

  return (
    <form method="get" action="/avaliacoes" className="relative flex items-center gap-3">
      <SearchField
        name="q"
        defaultValue={q}
        placeholder="Buscar por comentário, usuário ou eletroposto"
        aria-label="Buscar avaliações"
      />
      {open ? null : (
        <>
          <input type="hidden" name="station" value={station} />
          <input type="hidden" name="nota" value={nota} />
        </>
      )}

      <div className="relative shrink-0">
        <Button
          type="button"
          variant="secondary"
          size="toolbar"
          aria-label="Filtros"
          title="Filtros"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className={cn('relative', activeFilters > 0 && 'border border-accent-border text-accent')}
        >
          <SlidersHorizontal className="size-5" />
          {activeFilters > 0 ? (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-accent" />
          ) : null}
        </Button>

        {open ? (
          <div className="absolute top-[calc(100%+8px)] right-0 z-20 w-[min(100vw-2rem,22rem)] rounded-[16px] border border-border bg-surface p-4 shadow-2xl">
            <p className="font-title mb-3 text-xs text-muted">Filtros</p>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="station">Eletroposto</Label>
                <Select id="station" name="station" defaultValue={station}>
                  <option value="">Todos</option>
                  {stations.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nome}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="nota">Nota</Label>
                <Select id="nota" name="nota" defaultValue={nota}>
                  <option value="">Todas</option>
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} estrelas
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="flex-1">
                  Aplicar
                </Button>
                <a
                  href="/avaliacoes"
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-[12px] bg-elevated px-4 text-xs font-bold uppercase tracking-wide"
                >
                  Limpar
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </form>
  );
}
