import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { formatNumber } from '@/lib/format';
import type { Station } from '@/lib/types';
import { DeleteStationButton } from '@/components/delete-station-button';
import { PageHeader } from '@/components/page-header';
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
      <PageHeader
        title={station.nome}
        plain
        backHref="/eletropostos"
        backLabel="Eletropostos"
        description={`Nota ${formatNumber(Number(station.nota), 1)} ★ · ${station.quantidade_avaliacoes} avaliações (calculadas automaticamente)`}
        action={<DeleteStationButton id={station.id} nome={station.nome} />}
      />
      <StationForm station={station} />
    </div>
  );
}
