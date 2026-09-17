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
    <main className="flex min-h-full items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <img
            src="/logo-guia-flui.png"
            alt="Guia Flui"
            width={222}
            height={60}
            className="h-[60px] w-auto object-contain"
          />
          <h1 className="font-title mt-6 text-2xl">Bem-vindo de volta</h1>
          <p className="mt-3 text-base text-secondary">
            Entre com uma conta promovida a administrador no Supabase.
          </p>
        </div>
        <div className="mt-8">
          <LoginForm configured={isSupabaseConfigured()} forbidden={forbidden} />
        </div>
      </div>
    </main>
  );
}
