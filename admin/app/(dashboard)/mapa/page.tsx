import { requireAdmin } from '@/lib/auth';
import type { Station } from '@/lib/types';
import { StationsMap } from '@/components/stations-map';

export default async function MapPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('stations').select('*');
  const stations = (data ?? []) as Station[];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Mapa</h1>
        <p className="mt-1 text-sm text-secondary">
          Verde: aberto · Amarelo: segurança atenção · Vermelho: fechado agora.
        </p>
      </div>
      <StationsMap stations={stations} />
    </div>
  );
}
