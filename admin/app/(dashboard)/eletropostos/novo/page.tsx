import { StationForm } from '@/components/station-form';
import { PageHeader } from '@/components/page-header';

export default function NewStationPage() {
  return (
    <div className="grid gap-6">
      <PageHeader title="Novo eletroposto" backHref="/eletropostos" backLabel="Eletropostos" />
      <StationForm />
    </div>
  );
}
