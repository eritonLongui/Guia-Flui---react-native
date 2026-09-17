import { requireAdmin } from '@/lib/auth';
import { formatDateTime, formatNumber } from '@/lib/format';
import { isBanned } from '@/lib/userAuth';
import type { Profile } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

type UserAuth = {
  user_id: string;
  last_sign_in_at: string | null;
  banned_until: string | null;
};

export default async function UsersPage() {
  const { supabase } = await requireAdmin();
  const [{ data }, authResult] = await Promise.all([
    supabase.from('profiles').select('*').order('criado_em', { ascending: false }),
    supabase.rpc('admin_users_auth'),
  ]);
  const profiles = (data ?? []) as Profile[];
  const authById = new Map(((authResult.data ?? []) as UserAuth[]).map((row) => [row.user_id, row]));

  return (
    <div className="grid gap-6">
      <PageHeader title="Usuários" description={`${formatNumber(profiles.length)} no app`} />
      <div className="surface-card overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="font-title text-[12px] text-muted">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Papel</th>
              <th className="px-4 py-3">Desde</th>
              <th className="px-4 py-3">
                <span className="sr-only">Abrir</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => {
              const blocked = isBanned(authById.get(profile.id)?.banned_until);
              return (
                <tr key={profile.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/usuarios/${profile.id}`} className="font-medium hover:text-accent">
                        {profile.nome}
                      </Link>
                      {blocked ? <Badge variant="danger">Bloqueado</Badge> : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-secondary">{profile.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={profile.role === 'admin' ? 'success' : 'default'}>{profile.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDateTime(profile.criado_em)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/usuarios/${profile.id}`}
                      aria-label={`Ver ${profile.nome}`}
                      className="flex size-9 items-center justify-center rounded-xl text-muted hover:bg-elevated hover:text-foreground"
                    >
                      <ChevronRight className="size-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
