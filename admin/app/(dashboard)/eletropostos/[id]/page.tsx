import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { formatNumber } from '@/lib/format';
import type { Station } from '@/lib/types';
import { DeleteStationButton } from '@/components/delete-station-button';
import { StationForm } from '@/components/station-form';

export default async function EditStationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('stations').select('*').eq('id', id).maybeSingle();

  if (!data) {
    notFound();
  }

  const station = data as Station;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/eletropostos" className="text-sm text-accent hover:underline">
            ← Eletropostos
          </Link>
          <h1 className="font-heading mt-2 text-2xl font-semibold">{station.nome}</h1>
          <p className="text-sm text-muted">
            Nota {formatNumber(Number(station.nota), 1)} ★ · {station.quantidade_avaliacoes} avaliações (calculadas
            automaticamente)
          </p>
        </div>
        <DeleteStationButton id={station.id} nome={station.nome} />
      </div>
      <StationForm station={station} />
    </div>
  );
}
