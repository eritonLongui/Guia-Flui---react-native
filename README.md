# Guia Flui

Aplicativo mobile para motoristas de veículos elétricos **encontrarem, compararem e escolherem** os melhores pontos de recarga no Brasil.

**Repositório:** [github.com/eritonLongui/Guia-Flui---react-native](https://github.com/eritonLongui/Guia-Flui---react-native)

---

## Início rápido

```bash
git clone git@github.com:eritonLongui/Guia-Flui---react-native.git
cd Guia-Flui---react-native
npm run setup
npx eas-cli whoami          # conta Expo; se for Google, use um Access Token (EXPO_TOKEN)
npm run env:pull            # Maps + Supabase do EAS (mesmo do APK)
npm run start:clear
```

Sem convite no projeto Expo `@marcomendessv/guia-flui`, copie `.env.example` → `.env` e peça as chaves ao time. **Não** crie outro projeto Supabase.

O comando `npm run setup` executa automaticamente:

1. Validação do Node.js (`>= 20.19.4`)
2. Cópia de `.env.example` → `.env` (se ainda não existir)
3. Instalação de dependências (`npm ci`)
4. Verificação TypeScript (`tsc --noEmit`)
5. Checagem do ambiente (git, Xcode, pastas nativas, etc.)

**Alternativa (macOS/Linux):** `chmod +x scripts/setup.sh && ./scripts/setup.sh`

---

## Pré-requisitos

| Ferramenta | Versão | Necessário para |
|------------|--------|-----------------|
| Node.js | `>= 20.19.4` (recomendado **22.13.0**) | Tudo |
| npm | `>= 10` | Tudo |
| Git | qualquer | Clone e versionamento |
| Expo Go | app na loja | Teste rápido no celular (QR Code) |
| Xcode 15+ | — | Simulador iOS / dev build |
| Android Studio | — | Emulador Android / dev build |
| Conta [Expo](https://expo.dev) | gratuita | Gerar APK na nuvem (EAS) |

### Node.js (nvm / asdf / fnm)

```bash
nvm install && nvm use          # usa .nvmrc → 22.13.0
# ou
asdf install && asdf set nodejs 22.13.0
```

---

## Variáveis de ambiente

Arquivo `.env` / `.env.local` na raiz (**não vai para o Git**). Sem elas, mapa, login e dados reais não funcionam.

```bash
GOOGLE_MAPS_API_KEY=sua_chave_aqui
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_REQUIRE_EMAIL_CONFIRMATION=false
```

`EXPO_PUBLIC_REQUIRE_EMAIL_CONFIRMATION` é uma **feature flag** (padrão `false`): o cadastro entra na hora. Isso só funciona se no Supabase, Authentication → Providers → Email, **Confirm email** estiver desligado. Para exigir o link de novo, ligue a flag `true` **e** o Confirm email no dashboard.

O **assistente de voz** (mapa Explorar) grava o microfone e manda o áudio para a Edge Function `assistente-voz`: transcrição no mini, **chat em gpt-4o**, voz `gpt-4o-mini-tts`. A `OPENAI_API_KEY` fica só no Supabase (`npx supabase secrets set` + `npx supabase functions deploy assistente-voz`). Não coloque essa chave no `.env` do app. Precisa de **build nativo** (dev client ou APK), não Expo Go. No Simulator do iOS: **I/O → Audio Input**.

Painel web de eletropostos, avaliações e usuários: pasta [`admin/`](admin/) (Next.js). Ver [docs/ATUALIZACOES.md](docs/ATUALIZACOES.md).

Quem já foi convidado no Expo (`@marcomendessv/guia-flui`) puxa as mesmas chaves do APK:

```bash
export EXPO_TOKEN="seu_token"   # Account settings → Access tokens (conta Google não tem senha no CLI)
npx eas-cli whoami
npm run env:pull
```

Maps: [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials). Supabase: um **único** projeto do time.

Passo a passo (EAS, SHA-1, testers): [docs/SETUP.md](docs/SETUP.md#5-distribuir-para-outras-pessoas).

---

## Como rodar

### Desenvolvimento (Expo Go)

```bash
npm run start:clear
```

Escaneie o QR Code com **Expo Go** (Android) ou **Câmera** (iOS). Celular e Mac na **mesma rede Wi-Fi**.

> O mapa nativo pode não funcionar no Expo Go — use **dev build** ou **APK** (abaixo).

### iOS Simulator (dev build)

Metro na **porta 8083**:

```bash
# Terminal 1
npm run start:clear

# Terminal 2 — primeira vez ou após mudanças nativas
npm run ios

# Reabrir sem rebuild (Metro rodando)
npm run ios:open
```

Simulador padrão: **iPhone 17**. Confirme o Metro: `curl http://127.0.0.1:8083/status` → `packager-status:running`.

### Android Emulator (dev build)

```bash
# Terminal 1
npm run start:clear

# Terminal 2 — emulador aberto
npm run android
```

Pastas `ios/` e `android/` são geradas localmente (`npm run prebuild`) e **não** estão no Git.

---

## APK para testar no celular

Projeto EAS: **[@marcomendessv/guia-flui](https://expo.dev/accounts/marcomendessv/projects/guia-flui)**. O APK de preview já sobe com Maps + Supabase.

**Instalar (Android):** abra o build no Expo (permite fontes desconhecidas se o sistema pedir):

[Builds do Guia Flui](https://expo.dev/accounts/marcomendessv/projects/guia-flui/builds)

Também nas [Releases do GitHub](https://github.com/eritonLongui/Guia-Flui---react-native/releases/latest), quando houver um `.apk` anexado.

Gerar outra versão (variáveis já no ambiente preview):

```bash
export EXPO_TOKEN="seu_token"
npm run build:apk
```

Quem só testa **não** precisa clonar o repo. iPhone não instala APK. Detalhes: [docs/SETUP.md](docs/SETUP.md#5-distribuir-para-outras-pessoas).

---

## Scripts principais

| Comando | Descrição |
|---------|-----------|
| `npm run setup` | Setup completo do zero |
| `npm run validate` | Ambiente + TypeScript (use antes de PR) |
| `npm run metro` | Metro na porta **8083** (reinicia se cair) |
| `npm run start:clear` | Metro na porta **8083** (cache limpo) |
| `npm run ios` | Dev build + simulador iOS |
| `npm run ios:open` | Reabre app no simulador |
| `npm run android` | Dev build + emulador Android |
| `npm run prebuild` | Gera pastas nativas `ios/` e `android/` |
| `npm run prebuild:clean` | Regenera nativo do zero |
| `npm run build:apk` | APK Android via EAS Build (ambiente preview) |
| `npm run env:pull` | Baixa variáveis do EAS para `.env.local` |
| `npm run typecheck` | Apenas verificação de tipos |
| `npm run admin:dev` | Dashboard admin (Next.js em `admin/`) |
| `npm run admin:build` | Build de produção do dashboard |

---

## Documentação

| Documento | Conteúdo |
|-----------|----------|
| [docs/SETUP.md](docs/SETUP.md) | Setup detalhado, iOS, Android, EAS, dashboard admin, troubleshooting |
| [docs/ATUALIZACOES.md](docs/ATUALIZACOES.md) | Admin (web) e assistente de voz — o que foi feito e como liga |
| [admin/README.md](admin/README.md) | Painel web (Next.js) — local e Vercel |
| [docs/BRANDING.md](docs/BRANDING.md) | Ícones do app e logotipo (`assets/images/`) |
| [docs/DECISOES.md](docs/DECISOES.md) | Decisões de produto, dados, motion, identidade e acessibilidade (relatório acadêmico) |
| [docs/ACESSIBILIDADE.md](docs/ACESSIBILIDADE.md) | Apontador para a seção de acessibilidade em DECISOES.md |

---

## Stack

- **Expo SDK 56** · React Native 0.85 · React 19
- **Expo Router** (rotas por arquivo)
- **TypeScript**
- **NativeWind** (Tailwind CSS)
- **React Native Maps** · **@gorhom/bottom-sheet**
- Fontes **Lexend Giga** + **Poppins**
- **EAS Build** para distribuição Android
- **OpenAI** (Edge Function `assistente-voz`) — transcrição, gpt-4o e TTS
- **Next.js** (pasta `admin/`) — dashboard web na Vercel
- Repository Pattern (mock → Supabase)

---

## Telas do MVP

| Tela | Descrição |
|------|-----------|
| Splash | Branding Guia Flui |
| Welcome / Login / Cadastro | Auth com email e senha (Supabase) |
| Home | Veículo ativo, carrossel de estações, recomendação |
| Explorar | Mapa fullscreen + busca + assistente de voz + sheet com resultados |
| Detalhe | Compatibilidade, conectores, avaliações |
| Rota | Navegação até o eletroposto |
| Avaliar | Avaliação do posto |
| Favoritos | Estações salvas |
| Perfil | Usuário, veículo, configurações, modo mockado |
| Admin (web) | Painel Next.js — eletropostos, avaliações, usuários |

---

## Arquitetura

```
Screen → Repository → Mock Data / Supabase
```

```
guia-flui/
├── src/           # app Expo / React Native
├── admin/         # dashboard Next.js (Vercel)
├── supabase/      # schema + RLS compartilhados
└── ...
```

O dashboard **não** usa Expo Web. É um app Next.js separado, no mesmo Git, com o mesmo Supabase. Ver [admin/README.md](admin/README.md).

Telas do app **nunca** importam `src/data/` diretamente.

```
src/
├── app/           # rotas Expo Router
├── components/    # design system e UI
├── features/      # lógica de domínio
├── repositories/  # contratos + implementações
├── providers/     # estado global (veículo, favoritos, mock)
├── data/          # mocks
├── types/         # entidades
├── constants/     # tema, app name, assets
└── lib/           # a11y, formatadores, compatibilidade
```

---

## Fluxo para o time

```bash
git clone git@github.com:eritonLongui/Guia-Flui---react-native.git
cd Guia-Flui---react-native
npm run setup
npx eas-cli whoami && npm run env:pull   # mesmas APIs do APK (projeto @marcomendessv/guia-flui)
# desenvolver com npm run start:clear
npm run validate    # antes de abrir PR
```

---

## Solução de problemas

| Problema | Solução |
|----------|---------|
| `Could not connect to development server` / `No script URL provided` | Metro caiu. Deixe `npm run metro` em um Terminal à parte (reinicia sozinho). Confirme: `curl http://127.0.0.1:8083/status` |
| Porta errada | App usa **8083**, não 8081 |
| Mapa em branco | `.env` sem `GOOGLE_MAPS_API_KEY`, ou APK sem a variável/SHA-1 no EAS |
| `Entity not authorized` no EAS | Conta sem acesso a `@marcomendessv/guia-flui` — peça convite ou use um Access Token da conta certa |
| Cadastro pede confirmação de email | Confirm email ainda ligado no Supabase, ou flag `EXPO_PUBLIC_REQUIRE_EMAIL_CONFIRMATION=true` |
| Erro após `git pull` | `npm run setup` |
| Cache do Metro corrompido | `npm run start:clear` |
| `npm ci` falha | `rm -rf node_modules && npm run setup` |
| Node desatualizado (asdf/nvm) | `nvm use` ou `asdf set nodejs 22.13.0` |

Mais detalhes: [docs/SETUP.md](docs/SETUP.md).

---

## Download

- [APK Android (EAS)](https://expo.dev/accounts/marcomendessv/projects/guia-flui/builds)
- [Releases no GitHub](https://github.com/eritonLongui/Guia-Flui---react-native/releases/latest)
- [Código-fonte](https://github.com/eritonLongui/Guia-Flui---react-native)

---

## Licença

Projeto acadêmico desenvolvido para o Enterprise Challenge **FIAP** em parceria com a **Flui.**
