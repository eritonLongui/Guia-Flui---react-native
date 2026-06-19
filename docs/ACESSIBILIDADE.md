# Acessibilidade — Guia Flui

Documento de referência para o PRD e para o time de produto/desenvolvimento.

---

## Objetivo

Garantir que o app **Guia Flui** seja utilizável com **VoiceOver (iOS)** e **TalkBack (Android)**, com navegação clara, rótulos descritivos em português e áreas de toque adequadas — **sem alterar o layout visual** para usuários que não usam leitor de tela.

---

## Abordagem técnica

- Módulo central em `src/lib/a11y.ts` com helpers reutilizáveis
- Padrão aplicado nos componentes do design system e nas telas do MVP
- Elementos puramente decorativos (ícones, gradientes, fades) **excluídos** da árvore de acessibilidade para evitar leitura duplicada

---

## Módulo central (`src/lib/a11y.ts`)

| Recurso | Função |
|--------|--------|
| `HIT_SLOP_PADRAO` | Área de toque extra de **12px** em botões pequenos (voltar, favorito, filtros, fechar popup) |
| `criarRotuloEletroposto()` | Rótulo completo do card/marker: nome, compatibilidade, distância, fila, carga, conectores, status aberto |
| `criarRotuloCompatibilidade()` | Rótulo da badge: Compatível / Parcial / Incompatível |
| `criarRotuloAvaliacao()` | Rótulo da nota: ex. *"Avaliação 4.4 de 5, 45 avaliações"* |
| `criarRotuloVeiculo()` | Rótulo do card do carro: marca, modelo e autonomia |
| `anunciarMensagem()` | Anuncia mudanças dinâmicas via leitor de tela (ex.: quantidade de resultados na busca) |

---

## Estrutura semântica

- **Títulos de seção** (`Title`): `accessibilityRole="header"`
- **Botões** (`Button`, tabs, cards clicáveis): `accessibilityRole="button"`
- **Busca** (`Input` com ícone): `accessibilityRole="search"`
- **Estados de carregamento**: `accessibilityRole="progressbar"` + label *"Carregando"*
- **Imagens relevantes**: label descritivo (foto do eletroposto, avatar do usuário)
- **Tabs**: `accessibilityState={{ selected }}` + labels em português (*Início*, *Explorar mapa*, *Favoritos*, *Perfil*)

---

## Rótulos e hints por área

### Navegação

- Tab bar flutuante com labels PT-BR e indicação de aba ativa

### Home

- Botão *Encontrar Recarga* com hint *"Abre o mapa para buscar eletropostos"*
- Cards de estação com rótulo contextual completo + hint *"Abre os detalhes do eletroposto"*
- Carrossel com label *"Eletropostos perto de você"*

### Explorar

- Busca com role `search`
- Filtros: label + hint + hit slop
- Markers do mapa com o mesmo rótulo descritivo dos cards
- Marker de localização do usuário: *"Sua localização"*
- Anúncio por voz ao buscar: *"X resultados encontrados"*
- Bottom sheet / lista: cards acessíveis individualmente

### Detalhe do eletroposto

- Voltar e favorito com label, hint/state (`selected` no favorito) e hit slop
- Badges de compatibilidade, segurança e *Aberto agora* com rótulos próprios
- Carrossel de avaliações: *"Avaliações do eletroposto"*

### Perfil

- Itens de menu com `accessibilityRole="button"`
- Toggle *Modo mockado* com label e hint explicativo

### Popup no mapa

- Fechar com hint; botão *Ver mais* com hint para detalhes

---

## Boas práticas aplicadas

1. **Sem leitura duplicada** — ícones e textos internos marcados como `accessible={false}`; o container pai concentra o rótulo
2. **Área de toque ampliada** — ícones pequenos com `hitSlop` padronizado
3. **Estados comunicados** — favorito selecionado, botão desabilitado, aba ativa
4. **Elementos decorativos ignorados** — gradientes, fades (`importantForAccessibility="no"`), ícones ornamentais (carro, aspas)
5. **Escala de fonte do sistema** — inputs e textos **não bloqueiam** `allowFontScaling` (respeitam configuração de tamanho de fonte do SO)

---

## Cobertura do MVP

| Área | Status |
|------|--------|
| Design system (Button, Input, Title, Rating, badges) | ✅ |
| Cards (estação, veículo, avaliação) | ✅ |
| Navegação por tabs | ✅ |
| Home, Explorar, Detalhe, Favoritos, Perfil | ✅ |
| Mapa (markers + popup) | ✅ |
| Carrosséis (home e avaliações) | ✅ |
| Anúncios dinâmicos (busca) | ✅ |

---

## Fora de escopo / próximos passos

- Testes automatizados de acessibilidade (Detox / axe)
- Auditoria formal WCAG 2.1 AA
- Suporte a **redução de movimento** (animações como pulse do *Aberto agora*)
- Contraste dinâmico / modo alto contraste
- Navegação por teclado/switch control documentada
- `accessibilityLiveRegion` em mais fluxos (filtros, favoritar, erros de rede)

---

## Critério de aceite (PRD)

> Usuário com VoiceOver/TalkBack ativo consegue: navegar entre as 4 abas; buscar eletropostos e ouvir a quantidade de resultados; abrir detalhes de um posto a partir da lista ou do mapa; entender compatibilidade, nota e status *aberto*; favoritar/desfavoritar; e retornar à tela anterior — **sem depender exclusivamente de elementos visuais**.

---

## Como testar

1. Ative o leitor de tela no dispositivo ou simulador:
   - **iOS**: Ajustes → Acessibilidade → VoiceOver
   - **Android**: Configurações → Acessibilidade → TalkBack
2. Navegue pelo fluxo principal: Home → Explorar → Detalhe → Favoritar → Perfil
3. Na busca do Explorar, digite um termo e confirme o anúncio da quantidade de resultados
4. Verifique se ícones decorativos não são lidos em duplicidade com o texto adjacente
