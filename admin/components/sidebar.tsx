'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, LogOut, MessageSquare, PlugZap, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';

const links = [
  { href: '/', label: 'Visão geral', icon: LayoutDashboard },
  { href: '/eletropostos', label: 'Eletropostos', icon: PlugZap },
  { href: '/avaliacoes', label: 'Avaliações', icon: MessageSquare },
  { href: '/usuarios', label: 'Usuários', icon: Users },
];

export function Sidebar({ nome, email }: { nome: string; email: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-auto w-full shrink-0 flex-col border-b border-white/12 bg-surface/95 lg:h-full lg:w-72 lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between gap-3 px-5 py-5">
        <div className="min-w-0">
          <img
            src="/logo-guia-flui.png"
            alt="Guia Flui"
            width={148}
            height={40}
            className="h-10 w-auto max-w-[168px] object-contain object-left"
          />
          <p className="font-title mt-2 text-[11px] text-muted">Admin</p>
        </div>
        <form action={signOut} className="lg:hidden">
          <Button type="submit" variant="ghost" size="toolbar" aria-label="Sair" title="Sair">
            <LogOut className="size-5" />
          </Button>
        </form>
      </div>
      <nav className="flex gap-3 overflow-x-auto px-4 pb-4 lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:px-4 lg:pb-0">
        {links.map((link) => {
          const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex shrink-0 items-center gap-3 rounded-full px-1 py-1 text-sm transition-colors',
                active ? 'text-foreground' : 'text-muted hover:text-foreground',
              )}
            >
              <span
                className={cn(
                  'flex size-12 items-center justify-center rounded-full border-2 bg-elevated',
                  active ? 'border-accent-border text-accent' : 'border-transparent',
                )}
              >
                <Icon className="size-[22px]" />
              </span>
              <span className="hidden font-medium lg:inline">{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="hidden border-t border-white/12 px-5 py-5 lg:block">
        <p className="truncate text-sm font-medium">{nome}</p>
        <p className="truncate text-xs text-muted">{email}</p>
        <form action={signOut} className="mt-4">
          <Button type="submit" variant="secondary" size="toolbar" aria-label="Sair" title="Sair">
            <LogOut className="size-5" />
          </Button>
        </form>
      </div>
    </aside>
  );
}
