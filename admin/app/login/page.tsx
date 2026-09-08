import type { Metadata } from 'next';
import { isSupabaseConfigured } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';
import { LoginForm } from '@/components/login-form';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Entrar',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const forbidden = params.error === 'forbidden';

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user && !forbidden) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (profile?.role === 'admin') {
        redirect('/');
      }
    }
  }

  return (
    <main className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-2xl">
        <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">Guia Flui</p>
        <h1 className="font-heading mt-2 text-2xl font-semibold">Painel admin</h1>
        <p className="mt-2 text-sm text-secondary">Entre com uma conta promovida a administrador no Supabase.</p>
        <div className="mt-8">
          <LoginForm configured={isSupabaseConfigured()} forbidden={forbidden} />
        </div>
      </div>
    </main>
  );
}
