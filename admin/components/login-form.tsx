'use client';

import { useActionState } from 'react';
import { login, type AuthState } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm({ configured, forbidden }: { configured: boolean; forbidden: boolean }) {
  const [state, action, pending] = useActionState(login, undefined as AuthState);

  return (
    <form action={action} className="grid gap-4">
      {!configured ? (
        <p className="rounded-[16px] border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
          Configure <code>NEXT_PUBLIC_SUPABASE_URL</code> e <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> em{' '}
          <code>admin/.env.local</code>.
        </p>
      ) : null}
      {forbidden ? (
        <p className="rounded-[16px] border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          Esta conta não tem papel de administrador.
        </p>
      ) : null}
      {state?.error ? (
        <p className="rounded-[16px] border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>
      ) : null}
      <Field>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="admin@guiaflui.app" />
      </Field>
      <Field>
        <Label htmlFor="password">Senha</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <Button type="submit" disabled={pending || !configured} className="w-full">
        {pending ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  );
}
