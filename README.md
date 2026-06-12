# Guia Flui - Enterprise Challenge

O **Guia Flui** é o aplicativo móvel oficial da **Flui Soluções Sustentáveis** projetado para ajudar motoristas de veículos elétricos a encontrar, comparar e escolher os melhores pontos de recarga (eletropostos) no Brasil com segurança, clareza e planejamento.

Este projeto foi construído utilizando **React Native** com **Expo** e TypeScript.

---

## 🚀 Como Iniciar o Projeto

### Pré-requisitos
Certifique-se de ter instalado em sua máquina:
* [Node.js](https://nodejs.org/) (v18 ou superior recomendado)
* Gerenciador de pacotes `npm` ou `yarn`
* Aplicativo **Expo Go** instalado no celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) ou [iOS](https://apps.apple.com/app/expo-go/id984023376)) para testar em dispositivo físico.

### Passos para Rodar Localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Inicie o servidor de desenvolvimento do Expo:**
   ```bash
   npm start
   ```

3. **Abra o aplicativo:**
   * **No celular:** Escaneie o QR Code exibido no terminal utilizando a câmera do celular (iOS) ou o aplicativo Expo Go (Android).
   * **No emulador/simulador:** Pressione `a` para Android ou `i` para iOS se tiver os ambientes de desenvolvimento nativos configurados.

---

## 🏗️ Arquitetura do Projeto

A arquitetura do projeto segue um modelo modular e robusto dentro da pasta `src/`:

* **`src/app/`**: Roteamento baseado em arquivos utilizando **Expo Router**.
* **`src/components/`**: Componentes de interface modulares. Cada componente possui seu próprio arquivo de estilo separado (ex: `Card.tsx` e `Card.styles.ts`), simulando o comportamento de **CSS Modules** no React Native.
* **`src/contexts/`**: Provedores de estado globais, como o `MockModeContext` para gerenciar a simulação de dados em tempo de desenvolvimento.
* **`src/models/`**: Definições de tipagem TypeScript estritas (Usuario, Veiculo, Eletroposto, Avaliacao, Rota) alinhadas às regras de negócio.
* **`src/services/`**: Camada de integração com APIs externas e serviços como o Firebase ou provedores locais de dados simulados (`mockData.ts`).
* **`src/styles/`**: Design tokens centralizados (`theme.ts`) e estilos globais de compatibilidade (`globals.css`).

---

## 🛠️ Tecnologias Utilizadas

* **React Native** (v0.85+)
* **Expo SDK 56** com Expo Router
* **TypeScript**
* **AsyncStorage** (para persistência de preferências de modo mockado)
* **Reanimated** (para micro-animações fluidas e premium)

---

## 📄 Licença

Este projeto está sendo desenvolvido em grupo para um trabalho da faculdade **FIAP** (Enterprise Challenge), em parceria com a **Flui Soluções Sustentáveis**, que propôs o desafio de inovação. Para mais detalhes sobre os termos de desenvolvimento acadêmico, consulte o arquivo [LICENSE](file:///c:/Code/Guia%20Flui/LICENSE).

