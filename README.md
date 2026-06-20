# Guia Flui — Mobile App

Aplicativo mobile para motoristas de veículos elétricos encontrarem, compararem e escolherem os melhores pontos de recarga no Brasil.

---

## Início rápido (1 comando)

```bash
git clone <url-do-repo>
cd rota-facul
npm run setup
npm start
```

O comando `setup` instala dependências, cria `.env` se necessário, valida o ambiente e verifica o TypeScript automaticamente.

📖 **Ícones e logotipo:** [docs/BRANDING.md](docs/BRANDING.md)  
📖 **Guia completo de build (iOS, Android, APK):** [docs/SETUP.md](docs/SETUP.md)  
📖 **Acessibilidade (PRD):** [docs/ACESSIBILIDADE.md](docs/ACESSIBILIDADE.md)

**Alternativa via shell (macOS/Linux):**

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

Depois escaneie o QR Code com **Expo Go** (Android) ou **Câmera** (iOS).

---

## Pré-requisitos

| Ferramenta | Versão mínima | Obrigatório |
|------------|---------------|-------------|
| Node.js    | `>= 20.19.4`  | Sim |
| npm        | `>= 10`       | Sim |
| Git        | qualquer      | Recomendado |
| Expo Go    | app na loja   | Para testar no celular |
| Xcode      | 15+           | Só build iOS local |
| Android Studio | —         | Só build Android local |

### Node.js — qual versão usar?

O projeto já define a versão correta:

| Gerenciador | Comando |
|-------------|---------|
| **nvm** | `nvm install && nvm use` |
| **asdf** | `asdf install && asdf set nodejs 22.13.0` |
| **fnm** | `fnm install && fnm use` |

Arquivos de referência: [`.nvmrc`](.nvmrc) e [`.tool-versions`](.tool-versions) → `22.13.0`

---

## Scripts disponíveis

### Setup e validação

| Comando | Descrição |
|---------|-----------|
| `npm run setup` | **Setup completo**: instala deps + typecheck + valida ambiente |
| `npm run setup:check` | Verifica Node, npm, node_modules e ferramentas opcionais |
| `npm run typecheck` | Verifica tipos TypeScript (`tsc --noEmit`) |
| `npm run validate` | `setup:check` + `typecheck` |

### Desenvolvimento

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia o Metro bundler + Expo Dev Tools |
| `npm run start:clear` | Inicia limpando o cache do Metro |
| `npm run ios` | Dev build no simulador iOS (porta 8083) |
| `npm run ios:open` | Reabre o app no simulador (Metro deve estar rodando) |
| `npm run android` | Dev build no emulador Android (porta 8083) |
| `npm run web` | Abre no navegador (mapa com fallback de lista) |

### Build e distribuição

| Comando | Descrição |
|---------|-----------|
| `npm run prebuild` | Gera pastas `ios/` e `android/` |
| `npm run prebuild:clean` | Regenera nativo do zero |
| `npm run build:apk` | **APK na nuvem (EAS)** — instalar no Android para testar |
| `npm run build:apk:local` | APK local via EAS (requer Android SDK) |
| `npm run build:ios` | Compila e roda no simulador/dispositivo iOS |
| `npm run build:android` | Compila e roda no emulador/dispositivo Android |

### Simulador iOS (dev build)

O app usa **porta 8083** (a 8081 costuma estar ocupada por outros projetos). Sempre use **dois terminais**:

```bash
# Terminal 1 — Metro (deixe rodando)
npm start

# Terminal 2 — primeira vez ou após mudanças nativas
npm run ios

# Depois, para reabrir sem rebuild:
npm run ios:open
```

> **Erro "No script URL provided"?** O Metro não estava rodando ou a porta estava errada. Confirme com `curl http://127.0.0.1:8083/status` — deve retornar `packager-status:running`.

### APK para testar no Android (sem Android Studio)

```bash
npx eas-cli login          # uma vez
npm run build:apk          # gera APK na nuvem — link para download no final
```

Detalhes, secrets do Google Maps e troubleshooting: **[docs/SETUP.md](docs/SETUP.md)**.


---

## Fluxo recomendado para o time

```bash
# 1. Clonar e configurar (só na primeira vez)
git clone <url>
cd rota-facul
npm run setup

# 2. Desenvolver
npm start

# 3. Antes de abrir PR
npm run validate
```

---

## Testando no celular

1. Instale **Expo Go** ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) · [iOS](https://apps.apple.com/app/expo-go/id982107779))
2. Rode `npm start`
3. Escaneie o QR Code:
   - **Android**: pelo app Expo Go
   - **iOS**: pela câmera nativa

Celular e computador devem estar na **mesma rede Wi-Fi**.

---

## Stack

- React Native 0.85 + **Expo SDK 56**
- **Expo Router** (file-based routing)
- TypeScript
- **NativeWind** (Tailwind CSS)
- **React Native Maps**
- **Lucide Icons**
- Repository Pattern (mock → Supabase futuro)

---

## Telas do MVP

| Tela | Descrição |
|------|-----------|
| Splash | Branding Guia Flui |
| Home | Veículo ativo, estações próximas, recomendação, última rota |
| Explorar | Mapa fullscreen + bottom sheet com lista |
| Detalhes | Compatibilidade, tempo, segurança, conveniência, conectores |
| Favoritos | Estações salvas |
| Perfil | Usuário, veículo, toggle modo mockado |

---

## Arquitetura

```
Screen → Repository → Mock Data (futuro: Supabase)
```

Telas **nunca** importam `src/data/` diretamente.

```
src/
├── app/           # rotas Expo Router
├── components/    # design system
├── features/      # lógica de domínio
├── repositories/  # contratos + implementações
├── providers/     # estado global
├── data/          # mocks
├── types/         # entidades
├── constants/     # design tokens
└── lib/           # utilitários
```

---

## Solução de problemas

### `No version is set for nodejs` (asdf)

```bash
asdf install
asdf set nodejs 22.13.0
npm run setup
```

### Node.js desatualizado

```bash
nvm install
nvm use
npm run setup
```

### Metro com cache corrompido

```bash
npm run start:clear
# ou
npx expo start --clear
```

### Mapa não aparece no Expo Go

`react-native-maps` pode exigir **dev build** em alguns casos:

```bash
npm run prebuild
npm run build:ios    # ou build:android
```

Na aba **Explorar**, a versão web exibe lista como fallback.

### Erros após `git pull`

```bash
npm run setup
```

Isso reinstala dependências e revalida o ambiente.

### `npm ci` falha

```bash
rm -rf node_modules
npm run setup
```

---

## Licença

Enterprise Challenge FIAP — Flui Soluções Sustentáveis
