# Branding — ícones e logotipo

Onde colocar os arquivos visuais do **Guia Flui**. Substitua os PNGs mantendo **exatamente** estes nomes e caminhos.

---

## Ícone do app (launcher)

Coloque em `assets/images/`:

| Arquivo | Uso | Tamanho recomendado |
|---------|-----|---------------------|
| **`icon.png`** | Ícone principal iOS + Android | **1024 × 1024 px**, PNG, sem transparência |
| **`android-icon-foreground.png`** | Camada frontal do ícone adaptativo Android | **1024 × 1024 px**, PNG com transparência; símbolo centralizado na área segura (~66%) |
| **`android-icon-monochrome.png`** | Android 13+ (tema monocromático) | **1024 × 1024 px**, PNG monocromático |
| **`splash-icon.png`** | Imagem central da splash nativa | **~200–400 px** de largura (fundo transparente); `app.json` usa `imageWidth: 120` |
| **`favicon.png`** | Aba do navegador (web) | **48 × 48 px** ou maior (múltiplo de 48) |

Referência no projeto: `app.json` → `expo.icon`, `expo.android.adaptiveIcon`, plugin `expo-splash-screen`.

### Depois de trocar os ícones

```bash
# Dev build nativo — regenera ícones no app instalado
npm run prebuild:clean
npm run ios        # ou npm run android

# APK/IPA na nuvem
npm run build:apk
```

No **Expo Go**, o ícone da home screen continua sendo o do Expo Go — só muda no dev build ou APK/IPA.

---

## Logotipo (dentro do app)

| Arquivo | Uso | Tamanho recomendado |
|---------|-----|---------------------|
| **`logo-guia-flui.png`** | Rodapé da tela Perfil/Configurações (e splash, se quiser) | Largura **~480–800 px**, PNG com **fundo transparente**, proporção horizontal ou quadrada |

Caminho completo:

```
assets/images/logo-guia-flui.png
```

Referência no código: `src/constants/assets.ts` → `APP_LOGO`.

---

## Checklist rápido

1. Exportar `icon.png` (1024²)
2. Exportar `android-icon-foreground.png` (mesmo símbolo, com alpha)
3. Exportar `logo-guia-flui.png` (logotipo para UI)
4. (Opcional) Atualizar `splash-icon.png` e `favicon.png`
5. Rodar `npm run prebuild:clean` + rebuild se testar ícone no simulador/APK

---

## Cores de referência (design system)

- Fundo: `#131313`
- Cards: `#1E1E1F` → `#282829`
- Accent: `#31FE50`

Ícone e logotipo devem ter bom contraste nesses fundos escuros.
