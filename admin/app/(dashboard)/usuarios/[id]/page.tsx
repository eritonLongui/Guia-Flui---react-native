import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { formatDateTime, formatNumber } from '@/lib/format';
import type { Profile, Review, Vehicle } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const [{ data: profile }, { data: vehicles }, { data: reviews }, favorites] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).maybeSingle(),
    supabase.from('vehicles').select('*').eq('user_id', id),
    supabase.from('reviews').select('*').eq('user_id', id).order('criado_em', { ascending: false }),
    supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', id),
  ]);

  if (!profile) {
    notFound();
  }

  const user = profile as Profile;
  const vehicleList = (vehicles ?? []) as Vehicle[];
  const reviewList = (reviews ?? []) as Review[];

  return (
    <div className="grid gap-6">
      <div>
        <Link href="/usuarios" className="text-sm text-accent hover:underline">
          ← Usuários
        </Link>
        <h1 className="font-heading mt-2 text-2xl font-semibold">{user.nome}</h1>
        <p className="text-sm text-secondary">{user.email}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant={user.role === 'admin' ? 'success' : 'default'}>{user.role}</Badge>
          <Badge>Reputação {formatNumber(Number(user.reputacao), 1)}</Badge>
          <Badge>Desde {formatDateTime(user.criado_em)}</Badge>
          <Badge>{favorites.count ?? 0} favoritos</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Veículos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {vehicleList.length === 0 ? (
            <p className="text-sm text-muted">Nenhum veículo cadastrado.</p>
          ) : (
            vehicleList.map((vehicle) => (
              <div key={vehicle.id} className="rounded-xl border border-border bg-elevated px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">
                    {vehicle.marca} {vehicle.modelo} {vehicle.ano}
                  </p>
                  {vehicle.ativo ? <Badge variant="success">Ativo</Badge> : <Badge>Inativo</Badge>}
                </div>
                <p className="mt-1 text-sm text-secondary">
                  {vehicle.autonomia_km} km · {vehicle.capacidade_bateria} kWh · {vehicle.potencia_maxima_carregamento} kW
                </p>
                <p className="mt-1 text-xs text-muted">{vehicle.tipos_conector.join(', ') || 'Sem conectores'}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avaliações deste usuário</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {reviewList.length === 0 ? (
            <p className="text-sm text-muted">Nenhuma avaliação.</p>
          ) : (
            reviewList.map((review) => (
              <div key={review.id} className="rounded-xl border border-border bg-elevated px-4 py-3">
                <p className="text-sm font-medium">
                  {review.nota}★ · {formatDateTime(review.criado_em)}
                </p>
                <p className="text-sm text-secondary">{review.comentario || 'Sem comentário'}</p>
                <Link href={`/eletropostos/${review.station_id}`} className="text-xs text-accent hover:underline">
                  Ver eletroposto
                </Link>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
