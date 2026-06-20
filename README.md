# Guia Flui

Aplicativo mobile para motoristas de veículos elétricos **encontrarem, compararem e escolherem** os melhores pontos de recarga no Brasil.

**Repositório:** [github.com/eritonLongui/Guia-Flui---react-native](https://github.com/eritonLongui/Guia-Flui---react-native)

---

## Início rápido

```bash
git clone git@github.com:eritonLongui/Guia-Flui---react-native.git
cd rota-facul
npm run setup
cp .env.example .env   # preencha GOOGLE_MAPS_API_KEY
npm run start:clear
```

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

Arquivo `.env` na raiz (não vai para o Git):

```bash
GOOGLE_MAPS_API_KEY=sua_chave_aqui
```

Necessária para o **mapa na aba Explorar** em dev build e APK. Obtenha em [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials) (Maps SDK for Android + iOS).

Para builds EAS na nuvem:

```bash
npx eas-cli secret:create --scope project --name GOOGLE_MAPS_API_KEY --value "SUA_CHAVE"
```

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

Simulador padrão: **iPhone 16**. Confirme o Metro: `curl http://127.0.0.1:8083/status` → `packager-status:running`.

### Android Emulator (dev build)

```bash
# Terminal 1
npm run start:clear

# Terminal 2 — emulador aberto
npm run android
```

Pastas `ios/` e `android/` são geradas localmente (`npm run prebuild`) e **não** estão no Git.

### APK para testar no celular (EAS)

```bash
npx eas-cli login              # uma vez (login pelo browser)
npm run build:apk              # APK na nuvem — link de download no final
```

Perfil `preview` em `eas.json` gera **APK** instalável (não AAB). Projeto Expo: `@marcomendessv/rota`.

---

## Scripts principais

| Comando | Descrição |
|---------|-----------|
| `npm run setup` | Setup completo do zero |
| `npm run validate` | Ambiente + TypeScript (use antes de PR) |
| `npm run start:clear` | Metro na porta **8083** (cache limpo) |
| `npm run ios` | Dev build + simulador iOS |
| `npm run ios:open` | Reabre app no simulador |
| `npm run android` | Dev build + emulador Android |
| `npm run prebuild` | Gera pastas nativas `ios/` e `android/` |
| `npm run prebuild:clean` | Regenera nativo do zero |
| `npm run build:apk` | APK Android via EAS Build |
| `npm run typecheck` | Apenas verificação de tipos |

---

## Documentação

| Documento | Conteúdo |
|-----------|----------|
| [docs/SETUP.md](docs/SETUP.md) | Setup detalhado, iOS, Android, EAS, troubleshooting |
| [docs/BRANDING.md](docs/BRANDING.md) | Ícones do app e logotipo (`assets/images/`) |
| [docs/ACESSIBILIDADE.md](docs/ACESSIBILIDADE.md) | Acessibilidade (VoiceOver / TalkBack) para PRD |

---

## Stack

- **Expo SDK 56** · React Native 0.85 · React 19
- **Expo Router** (rotas por arquivo)
- **TypeScript**
- **NativeWind** (Tailwind CSS)
- **React Native Maps** · **@gorhom/bottom-sheet**
- Fontes **Lexend Giga** + **Poppins**
- **EAS Build** para distribuição Android
- Repository Pattern (mock → Supabase futuro)

---

## Telas do MVP

| Tela | Descrição |
|------|-----------|
| Splash | Branding Guia Flui |
| Home | Veículo ativo, carrossel de estações, recomendação, última rota |
| Explorar | Mapa fullscreen + busca + bottom sheet com resultados |
| Detalhe | Compatibilidade, tempo, segurança, conveniência, conectores, avaliações |
| Favoritos | Estações salvas |
| Perfil | Usuário, veículo, configurações, modo mockado |

---

## Arquitetura

```
Screen → Repository → Mock Data (futuro: Supabase)
```

Telas **nunca** importam `src/data/` diretamente.

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
cd rota-facul
npm run setup
# desenvolver com npm run start:clear
npm run validate    # antes de abrir PR
```

---

## Solução de problemas

| Problema | Solução |
|----------|---------|
| `No script URL provided` | Metro não está rodando → `npm run start:clear` |
| Porta errada | App usa **8083**, não 8081 |
| Mapa em branco | Preencha `GOOGLE_MAPS_API_KEY` no `.env` e refaça o build |
| Erro após `git pull` | `npm run setup` |
| Cache do Metro corrompido | `npm run start:clear` |
| `npm ci` falha | `rm -rf node_modules && npm run setup` |
| Node desatualizado (asdf/nvm) | `nvm use` ou `asdf set nodejs 22.13.0` |

Mais detalhes: [docs/SETUP.md](docs/SETUP.md).

---

## Licença

Enterprise Challenge FIAP — **Flui Soluções Sustentáveis**
