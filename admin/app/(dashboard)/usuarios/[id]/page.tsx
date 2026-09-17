import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star } from 'lucide-react';
import { requireAdmin } from '@/lib/auth';
import { formatDateTime } from '@/lib/format';
import { textoAvaliacao } from '@/lib/reviewComment';
import { isBanned } from '@/lib/userAuth';
import type { Profile, Review, Station } from '@/lib/types';
import { UserActions } from '@/components/user-actions';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';

type UserAuth = {
  user_id: string;
  last_sign_in_at: string | null;
  banned_until: string | null;
};

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user: admin } = await requireAdmin();

  const [{ data: profile }, { data: reviews }, { data: stations }, authResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).maybeSingle(),
    supabase.from('reviews').select('*').eq('user_id', id).order('criado_em', { ascending: false }),
    supabase.from('stations').select('id, nome'),
    supabase.rpc('admin_users_auth'),
  ]);

  if (!profile) {
    notFound();
  }

  const user = profile as Profile;
  const reviewList = (reviews ?? []) as Review[];
  const stationNames = new Map(((stations ?? []) as Pick<Station, 'id' | 'nome'>[]).map((item) => [item.id, item.nome]));
  const auth = ((authResult.data ?? []) as UserAuth[]).find((row) => row.user_id === id);
  const blocked = isBanned(auth?.banned_until);
  const isSelf = admin.id === user.id;

  return (
    <div className="grid gap-6">
      <PageHeader
        title={user.nome}
        plain
        backHref="/usuarios"
        backLabel="Usuários"
        description={user.email}
        action={
          isSelf ? undefined : (
            <UserActions id={user.id} nome={user.nome} role={user.role} blocked={blocked} />
          )
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={user.role === 'admin' ? 'success' : 'default'}>{user.role}</Badge>
        {blocked ? <Badge variant="danger">Bloqueado</Badge> : null}
      </div>

      <dl className="surface-card grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <dt className="font-title text-[12px] text-muted">Criado em</dt>
          <dd className="mt-1 text-sm">{formatDateTime(user.criado_em)}</dd>
        </div>
        <div>
          <dt className="font-title text-[12px] text-muted">Último login</dt>
          <dd className="mt-1 text-sm">{auth?.last_sign_in_at ? formatDateTime(auth.last_sign_in_at) : 'Nunca'}</dd>
        </div>
      </dl>

      <section>
        <h2 className="font-title mb-4 text-base">Avaliações</h2>
        {reviewList.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma avaliação ainda.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {reviewList.map((review) => (
              <article key={review.id} className="surface-card flex h-full flex-col p-5">
                <p className="flex items-center gap-1 text-sm text-warning">
                  <Star aria-hidden={true} className="size-3.5 fill-current" />
                  {review.nota}
                </p>
                <p className="mt-3 line-clamp-4 flex-1 text-sm leading-6 text-secondary">
                  {textoAvaliacao(review.comentario)}
                </p>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                  <Link href={`/eletropostos/${review.station_id}`} className="truncate text-xs text-muted hover:text-accent">
                    {stationNames.get(review.station_id) ?? review.station_id}
                  </Link>
                  <p className="shrink-0 text-xs text-muted">{formatDateTime(review.criado_em)}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
