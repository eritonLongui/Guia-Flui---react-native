import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { formatDateTime, formatNumber } from '@/lib/format';
import type { Profile } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

export default async function UsersPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('profiles').select('*').order('criado_em', { ascending: false });
  const profiles = (data ?? []) as Profile[];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Usuários</h1>
        <p className="mt-1 text-sm text-secondary">{formatNumber(profiles.length)} perfis no Supabase Auth / profiles.</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-elevated text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Papel</th>
              <th className="px-4 py-3">Reputação</th>
              <th className="px-4 py-3">Desde</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <Link href={`/usuarios/${profile.id}`} className="font-medium hover:text-accent">
                    {profile.nome}
                  </Link>
                </td>
                <td className="px-4 py-3 text-secondary">{profile.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={profile.role === 'admin' ? 'success' : 'default'}>{profile.role}</Badge>
                </td>
                <td className="px-4 py-3">{formatNumber(Number(profile.reputacao), 1)}</td>
                <td className="px-4 py-3 text-muted">{formatDateTime(profile.criado_em)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
