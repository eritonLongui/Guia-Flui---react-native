# Setup e build — Guia Flui

Guia completo para configurar o ambiente e testar o app no **iOS Simulator**, **Android Emulator** ou via **APK**.

---

## 1. Primeira vez no projeto

```bash
git clone git@github.com:eritonLongui/Guia-Flui---react-native.git
cd rota-facul
npm run setup
```

O `setup` faz automaticamente:

1. Valida Node.js `>= 20.19.4`
2. Instala dependências (`npm ci`)
3. Roda TypeScript (`tsc --noEmit`)
4. Verifica ferramentas opcionais (git, watchman, Xcode)

### Node.js

| Gerenciador | Comando |
|-------------|---------|
| nvm | `nvm install && nvm use` |
| asdf | `asdf install && asdf set nodejs 22.13.0` |
| fnm | `fnm install && fnm use` |

### Variáveis de ambiente

Não commite o `.env`. O jeito preferido no time é puxar do EAS (depois de ser convidado ao projeto Expo):

```bash
npm run env:pull
```

Isso cria/atualiza `.env.local` com as mesmas chaves do APK. Alternativa manual:

```bash
cp .env.example .env
# Edite .env:
# GOOGLE_MAPS_API_KEY — mapa nativo na aba Explorar
# EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY — login e dados reais
```

Use **o mesmo** projeto Supabase e a **mesma** chave Google do time. Sem isso, cada pessoa vê um banco vazio e o mapa/rotas quebram.

### Supabase (CLI)

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
npx supabase projects api-keys --project-ref SEU_PROJECT_REF
```

Cole a URL e a `anon` key no `.env`.

**Confirm email (feature flag):** o app lê `EXPO_PUBLIC_REQUIRE_EMAIL_CONFIRMATION` (padrão `false`). Com `false`, o cadastro entra na hora — no dashboard, Authentication → Providers → Email, desative **Confirm email**. Para voltar a exigir o link, ligue os dois: a flag `true` e Confirm email no Supabase.

Os 12 eletropostos e as avaliações seedadas vão no banco na migration `supabase/migrations/20260831130000_init_rota.sql`.

A pasta `admin/` (dashboard Next.js) usa **as mesmas** `EXPO_PUBLIC_SUPABASE_URL` / anon key, com os nomes `NEXT_PUBLIC_*`. Depois do `db push`, promova um admin:

```sql
update public.profiles set role = 'admin' where email = 'seu-email@fiap.com';
```

Detalhes: [admin/README.md](../admin/README.md).

---

## 2. Desenvolvimento (Expo Go / Metro)

```bash
npm run metro
# ou, se o cache estiver estranho:
npm run start:clear
```

`npm run metro` sobe o bundler em **127.0.0.1:8083** e **reinicia sozinho** se o processo cair. Deixe esse Terminal aberto enquanto usa o simulador.

Escaneie o QR Code com **Expo Go** (Android) ou **Câmera** (iOS).

> O mapa nativo pode exigir **dev build** (seções 3 e 4 abaixo).

---

## 3. iOS Simulator (dev build)

O app usa a **porta 8083** do Metro.

### Primeira vez (ou após mudanças nativas)

```bash
# Terminal 1 — Metro
npm run start:clear

# Terminal 2 — gera ios/ + compila + instala no simulador
npm run ios
```

### Só reabrir o app (Metro já rodando)

```bash
npm run ios:open
```

Simulador padrão: **iPhone 17**. Para outro:

```bash
IOS_SIMULATOR_DEVICE="iPhone 15" npm run ios:open
```

### Verificar Metro

```bash
curl http://127.0.0.1:8083/status
# deve retornar: packager-status:running
```

---

## 4. Android Emulator (dev build)

### Pré-requisitos

- [Android Studio](https://developer.android.com/studio) com SDK e um AVD criado
- `ANDROID_HOME` configurado (o Studio costuma fazer isso)

### Primeira vez

```bash
# Terminal 1 — Metro
npm run start:clear

# Terminal 2 — gera android/ + compila + instala no emulador
npm run android
```

O emulador deve estar **aberto** antes de rodar `npm run android`.

### Regenerar pastas nativas

```bash
npm run prebuild:clean
npm run android   # ou npm run ios
```

> As pastas `ios/` e `android/` são geradas localmente (não vão pro Git).

---

## 5. Distribuir para outras pessoas

Há dois públicos. As chaves **não vão no Git**: o `.env` local é ignorado no upload do EAS. Sem variáveis no EAS, o APK sobe sem mapa, login nem dados reais.

| Quem | O que recebe | O que precisa |
|------|----------------|---------------|
| Tester (só usar o app) | APK + link | Celular Android e permissão de “fontes desconhecidas” |
| Dev (buildar no computador) | Repo + convite no Expo | Node 22, `.env` via `npm run env:pull`, opcionalmente Android Studio / Xcode |

Tudo aponta para **um** backend (Supabase do time) e **uma** chave Google Maps, como um app de usuário de verdade.

### 5.1 Uma vez no projeto (quem administra)

1. Convide o time no GitHub **e** no projeto Expo (`@marcomendessv/guia-flui`), senão ninguém puxa env nem gera APK.
2. Confirme o projeto Supabase único (URL + `anon` key). Com a flag `EXPO_PUBLIC_REQUIRE_EMAIL_CONFIRMATION=false` (padrão), desative **Confirm email** em Authentication → Providers → Email.
3. No Google Cloud, ative **Maps SDK for Android**, **Maps SDK for iOS** e **Directions API**. Restrinja a chave ao pacote `com.rota.app`.
4. Grave as variáveis no ambiente **preview** do EAS (visibilidade **sensitive**, não `secret` — `secret` não entra na resolução do `app.config.js`):

```bash
npx eas-cli login

npx eas-cli env:create --name GOOGLE_MAPS_API_KEY --environment preview --visibility sensitive --value "SUA_CHAVE"
npx eas-cli env:create --name EXPO_PUBLIC_SUPABASE_URL --environment preview --visibility sensitive --value "https://xxxx.supabase.co"
npx eas-cli env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --environment preview --visibility sensitive --value "eyJ..."
```

Repita `--environment development` (e `production`, se for o caso) se o time também for gerar dev client.

5. Depois do **primeiro** APK, pegue o SHA-1 do keystore do EAS e coloque na restrição Android da chave Google. Sem isso o mapa fica em branco no celular de testers:

```bash
npx eas-cli credentials -p android
```

A `anon` key do Supabase é pública por desenho (o RLS protege os dados). A chave do Maps precisa estar restrita ao app; não commite nenhuma das duas.

### 5.2 Tester: instalar o APK

Quem gera o binário:

```bash
npx eas-cli login
npm run build:apk
```

O terminal (e o [dashboard do Expo](https://expo.dev)) mostra um **link de download**. Envie esse link ou anexe o `.apk` numa [GitHub Release](https://github.com/eritonLongui/Guia-Flui---react-native/releases).

Quem testa no Android:

1. Abre o link no celular.
2. Permite instalar de fontes desconhecidas, se o sistema pedir.
3. Cria conta / entra — login, mapa, eletropostos e avaliações batem no Supabase real.

iOS não instala APK. Para iPhone de testers é preciso conta Apple Developer paga + build interno (`eas build --platform ios --profile preview`) e cadastro do UDID (`npx eas-cli device:create`), ou TestFlight. Para o MVP acadêmico, Android costuma ser o caminho.

### 5.3 Dev: buildar no próprio computador

```bash
git clone git@github.com:eritonLongui/Guia-Flui---react-native.git
cd Guia-Flui---react-native
npx eas-cli login          # mesma conta convidada no projeto
npm run setup
npm run env:pull           # baixa GOOGLE_MAPS + Supabase do EAS
npm run start:clear        # Expo Go
# ou, com mapa nativo:
npm run android            # emulador aberto
npm run ios                # simulador (macOS)
```

Se `env:pull` falhar, peça a quem administra um `.env` por canal privado e copie na raiz. **Não** crie outro projeto Supabase — senão login, favoritos e avaliações não batem com o restante do time.

### 5.4 APK local (opcional, mais lento)

Requer Android SDK + pasta `android/` gerada. O `.env` da máquina entra no binário:

```bash
npm run prebuild
npm run build:apk:local
```

---

## 6. Antes de abrir PR

```bash
npm run validate
```

Roda `setup:check` + `typecheck`.

---

## Dashboard admin (Vercel)

O painel web fica em `admin/` (Next.js), no mesmo repositório. Não usa Expo Web.

```bash
cd admin
cp .env.example .env.local
# NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
# (os mesmos valores de EXPO_PUBLIC_* do app)
npm install
npm run dev
```

Na raiz: `npm run admin:dev`.

Na Vercel: importe o mesmo repo, **Root Directory = `admin`**, e as duas variáveis `NEXT_PUBLIC_SUPABASE_*`.

É preciso aplicar `supabase/migrations/20260907040000_admin_role.sql` e promover o e-mail no SQL Editor (seção 1).

---

## Scripts resumidos

| Comando | O que faz |
|---------|-----------|
| `npm run setup` | Setup completo do zero |
| `npm run metro` | Metro na porta 8083 (reinicia se cair) |
| `npm run start:clear` | Metro na porta 8083 (cache limpo) |
| `npm run ios` | Prebuild + build + simulador iOS |
| `npm run ios:open` | Reabre app no simulador |
| `npm run android` | Prebuild + build + emulador Android |
| `npm run prebuild` | Gera `ios/` e `android/` |
| `npm run build:apk` | APK na nuvem (EAS, ambiente preview) |
| `npm run env:pull` | Baixa variáveis do EAS para `.env.local` |
| `npm run validate` | Checagem de ambiente + TS |
| `npm run admin:dev` | Dashboard Next.js (`admin/`) |

---

## Problemas comuns

| Problema | Solução |
|----------|---------|
| `Could not connect to development server` | Metro caiu. Rode `npm run metro` e deixe o Terminal aberto |
| Mapa em branco (dev) | Preencha `GOOGLE_MAPS_API_KEY` no `.env` e refaça o build |
| Mapa em branco (APK) | Variável ausente no EAS **ou** SHA-1 do keystore não está na restrição da chave Google |
| Login / dados vazios no APK | Faltam `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` no ambiente preview do EAS |
| `ios/` ou `android/` ausente | `npm run prebuild` |
| Erros após `git pull` | `npm run setup` |
| EAS pede login | `npx eas-cli login` — precisa estar na org Expo do projeto |
