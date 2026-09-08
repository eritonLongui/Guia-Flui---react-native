'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MapPinned, MessageSquare, PlugZap, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';

const links = [
  { href: '/', label: 'Visão geral', icon: LayoutDashboard },
  { href: '/eletropostos', label: 'Eletropostos', icon: PlugZap },
  { href: '/mapa', label: 'Mapa', icon: MapPinned },
  { href: '/avaliacoes', label: 'Avaliações', icon: MessageSquare },
  { href: '/usuarios', label: 'Usuários', icon: Users },
];

export function Sidebar({ nome, email }: { nome: string; email: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-b border-border bg-surface lg:h-full lg:w-64 lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between gap-3 px-5 py-4 lg:block">
        <div>
          <p className="text-[10px] font-medium tracking-[0.22em] text-accent uppercase">Guia Flui</p>
          <p className="font-heading text-lg font-semibold">Admin</p>
        </div>
        <form action={signOut} className="lg:hidden">
          <Button type="submit" variant="ghost" size="sm">
            Sair
          </Button>
        </form>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-0">
        {links.map((link) => {
          const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
                active ? 'bg-accent/15 text-accent' : 'text-secondary hover:bg-elevated hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="hidden border-t border-border px-5 py-4 lg:block">
        <p className="truncate text-sm font-medium">{nome}</p>
        <p className="truncate text-xs text-muted">{email}</p>
        <form action={signOut} className="mt-3">
          <Button type="submit" variant="secondary" size="sm" className="w-full">
            Sair
          </Button>
        </form>
      </div>
    </aside>
  );
}
