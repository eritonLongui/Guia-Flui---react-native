import type { ReactNode } from 'react';
import { requireAdmin } from '@/lib/auth';
import { Sidebar } from '@/components/sidebar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireAdmin();

  return (
    <div className="flex h-svh min-h-0 flex-col overflow-hidden lg:flex-row">
      <Sidebar nome={profile.nome} email={profile.email} />
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-8 lg:py-10">{children}</div>
      </div>
    </div>
  );
}
