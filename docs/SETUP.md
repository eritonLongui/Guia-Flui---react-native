# Setup e build — Rota

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

```bash
cp .env.example .env
# Edite .env e preencha GOOGLE_MAPS_API_KEY (mapa na aba Explorar)
```

---

## 2. Desenvolvimento (Expo Go / Metro)

```bash
npm start
# ou, se o cache estiver estranho:
npm run start:clear
```

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

Simulador padrão: **iPhone 16**. Para outro:

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

## 5. APK para testar (EAS Build)

Gera um **APK instalável** na nuvem do Expo — sem precisar do Android Studio na máquina.

### Configuração (uma vez)

```bash
npx eas-cli login
npx eas-cli build:configure   # se ainda não houver projectId no app
```

Configure o secret do Google Maps (recomendado para o mapa funcionar no APK):

```bash
npx eas-cli secret:create --scope project --name GOOGLE_MAPS_API_KEY --value "SUA_CHAVE"
```

### Gerar APK

```bash
npm run build:apk
```

Ao terminar, o terminal mostra um **link para baixar o APK**. Instale no celular Android (permita “fontes desconhecidas” se pedido).

### Build local do APK (opcional, mais lento)

Requer Android SDK + `android/` gerado:

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

## Scripts resumidos

| Comando | O que faz |
|---------|-----------|
| `npm run setup` | Setup completo do zero |
| `npm run start:clear` | Metro na porta 8083 (cache limpo) |
| `npm run ios` | Prebuild + build + simulador iOS |
| `npm run ios:open` | Reabre app no simulador |
| `npm run android` | Prebuild + build + emulador Android |
| `npm run prebuild` | Gera `ios/` e `android/` |
| `npm run build:apk` | APK na nuvem (EAS) |
| `npm run validate` | Checagem de ambiente + TS |

---

## Problemas comuns

| Problema | Solução |
|----------|---------|
| `No script URL provided` | Metro não está rodando → `npm run start:clear` |
| Mapa em branco | Preencha `GOOGLE_MAPS_API_KEY` no `.env` e refaça o build |
| `ios/` ou `android/` ausente | `npm run prebuild` |
| Erros após `git pull` | `npm run setup` |
| EAS pede login | `npx eas-cli login` |
