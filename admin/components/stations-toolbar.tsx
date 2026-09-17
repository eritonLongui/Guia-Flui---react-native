import { Plus } from 'lucide-react';
import { IconLink } from '@/components/icon-link';
import { SearchField } from '@/components/search-field';

export function StationsToolbar({ q }: { q: string }) {
  return (
    <form method="get" action="/eletropostos" className="flex items-center gap-3">
      <SearchField
        name="q"
        defaultValue={q}
        placeholder="Buscar por nome, cidade ou endereço"
        aria-label="Buscar eletropostos"
      />
      <IconLink href="/eletropostos/novo" label="Novo eletroposto">
        <Plus className="size-5" />
      </IconLink>
    </form>
  );
}
