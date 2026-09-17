# Dashboard admin — Guia Flui

Painel web (Next.js) para administrar eletropostos, avaliações e usuários. Mora na pasta `admin/` do **mesmo repositório** do app Expo e usa o **mesmo projeto Supabase**.

## Como rodar

Na pasta `admin/`:

```bash
cp .env.example .env.local
# preencha com a mesma URL e anon key do app mobile
npm install
npm run dev
```

Ou, na raiz do repo: `npm run admin:dev`.

Abra [http://localhost:3000](http://localhost:3000).

## Promover um admin

1. Crie a conta normalmente (cadastro do app ou Authentication no Supabase).
2. Aplique a migration `supabase/migrations/20260907040000_admin_role.sql` (`npx supabase db push` na raiz).
3. No SQL Editor do Supabase:

```sql
update public.profiles set role = 'admin' where email = 'seu-email@fiap.com';
```

Usuários com `role = user` entram no app, mas não no dashboard.

## Deploy na Vercel

1. Importe o **mesmo** repositório GitHub.
2. Em Settings → General, defina **Root Directory** como `admin`.
3. Variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. O framework Next.js é detectado sozinho.

Não coloque a `service_role` key neste projeto. O painel usa a anon key e as policies RLS de admin.

## O que o painel faz

- Visão geral (KPIs e gráficos)
- CRUD de eletropostos e disponibilidade (aberto agora, carregadores)
- Moderação de avaliações
- Listagem de usuários e veículos
