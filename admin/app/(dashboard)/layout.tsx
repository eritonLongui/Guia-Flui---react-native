import type { ReactNode } from 'react';
import { requireAdmin } from '@/lib/auth';
import { Sidebar } from '@/components/sidebar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireAdmin();

  return (
    <div className="flex min-h-full flex-col lg:flex-row">
      <Sidebar nome={profile.nome} email={profile.email} />
      <div className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8 lg:py-8">{children}</div>
      </div>
    </div>
  );
}
