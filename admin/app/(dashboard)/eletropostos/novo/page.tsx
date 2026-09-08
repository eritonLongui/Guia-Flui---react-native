import Link from 'next/link';
import { StationForm } from '@/components/station-form';

export default function NewStationPage() {
  return (
    <div className="grid gap-6">
      <div>
        <Link href="/eletropostos" className="text-sm text-accent hover:underline">
          ← Eletropostos
        </Link>
        <h1 className="font-heading mt-2 text-2xl font-semibold">Novo eletroposto</h1>
      </div>
      <StationForm />
    </div>
  );
}
