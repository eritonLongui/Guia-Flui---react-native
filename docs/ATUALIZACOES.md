# Atualizações recentes — admin e assistente de voz

Resumo do que entrou no Guia Flui depois do MVP de mapa, auth e eletropostos: o **painel web de administração** e o **assistente de voz** no Explorar.

---

## 1. Dashboard admin

Painel Next.js na pasta [`admin/`](../admin/), no mesmo repositório e no **mesmo Supabase** do app. Não é Expo Web.

### Para que serve

- Visão geral (KPIs e gráficos da rede)
- CRUD de eletropostos (incluindo cidade, conectores, aberto agora, carregadores)
- Moderação de avaliações
- Listagem de usuários e veículos

Só entra quem tem `profiles.role = 'admin'`. Motorista comum (`user`) usa só o app.

### Como liga no banco

1. Migration [`supabase/migrations/20260907040000_admin_role.sql`](../supabase/migrations/20260907040000_admin_role.sql)
2. Promover e-mail no SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'seu-email@fiap.com';
```

O painel usa a **anon key** e RLS. Não coloca `service_role` no front.

### Como rodar e publicar

Local: `npm run admin:dev` (ou `cd admin && npm run dev`). Variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (os mesmos valores `EXPO_PUBLIC_*` do app).

Vercel: o mesmo repo GitHub, **Root Directory = `admin`**, as duas `NEXT_PUBLIC_*`. Detalhe em [admin/README.md](../admin/README.md).

---

## 2. Assistente de voz

No mapa **Explorar** (iOS/Android nativo, não Expo Go nem web). O motorista fala; a Guia responde em português, em voz feminina.

### O que ela faz

- Fala de **recarga**, **carro elétrico** e **Brasil** com a inteligência da OpenAI (`gpt-4o` no chat).
- Consulta o **catálogo `stations`** para posto, cidade e mapa (ex.: eletropostos no Rio). Não inventa nome nem ID de posto do app.
- Pode destacar ponto, abrir detalhe ou abrir rota.
- Play/pause: **Falar** grava o microfone; **Pausar** envia o áudio. Enquanto ela pensa ou fala, o botão fica desabilitado. Encerrar é o X.

### Como o áudio anda

```
Microfone (PCM) → Edge Function assistente-voz
  → transcrição (gpt-4o-mini-transcribe)
  → resposta (gpt-4o) + postos do banco
  → voz (gpt-4o-mini-tts, coral)
  → MP3 no app
```

A `OPENAI_API_KEY` fica **só** nos secrets do Supabase, não no `.env` do app.

```bash
npx supabase secrets set OPENAI_API_KEY=sk-...
npx supabase functions deploy assistente-voz
```

### App e simulador

Precisa de **dev build** ou APK/IPA (microfone nativo). No Simulator: **I/O → Audio Input** no microfone do Mac.

Flag `EXPO_PUBLIC_ASSISTENTE_VOZ` (padrão ligado). Mapa e busca de posto no Explorar leem o banco `stations` quando o Supabase está configurado.

### Arquivos principais

| Onde | Papel |
|------|--------|
| [`src/hooks/useAssistenteVoz.ts`](../src/hooks/useAssistenteVoz.ts) | Ciclo ouvir → enviar → falar |
| [`src/components/AssistenteVozOverlay.tsx`](../src/components/AssistenteVozOverlay.tsx) | UI no mapa |
| [`src/lib/vozAssistente.ts`](../src/lib/vozAssistente.ts) | Playback do MP3 |
| [`supabase/functions/assistente-voz/index.ts`](../supabase/functions/assistente-voz/index.ts) | Transcrição, catálogo, gpt-4o, TTS |

---

## 3. O que não misturar

| Assunto | Fonte |
|---------|--------|
| Nome, endereço e ID de eletroposto no app | Tabela `stations` |
| História, recarga, carro, incentivo, mercado no Brasil | OpenAI (`gpt-4o`) |
| Quem é admin | `profiles.role` + RLS |
| Chave OpenAI | Secret da Edge Function |
