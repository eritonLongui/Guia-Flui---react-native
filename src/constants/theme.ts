export const colors = {
  /** Fallback sólido — extremo inferior do gradiente de fundo. */
  background: '#131313',
  backgroundStart: '#151617',
  backgroundEnd: '#131313',
  /** Fallback sólido — extremo inferior do gradiente de cards. */
  surface: '#1E1E1F',
  surfaceStart: '#282829',
  surfaceEnd: '#1E1E1F',
  /** Elementos elevados (chips, tab bar) — tom intermediário da paleta de cards. */
  elevated: '#252526',
  border: '#4A4A4A',
  accent: '#31FE50',
  accentDark: '#234A29',
  accentBorder: 'rgba(49, 254, 80, 0.45)',
  textPrimary: '#FFFFFF',
  textSecondary: '#C7C7C7',
  textMuted: '#8A8A8A',
  /** Texto de chips/tags neutras — contraste sobre fundo elevated. */
  chipText: '#F0F0F0',
  chipBackground: 'rgba(255, 255, 255, 0.1)',
  chipBorder: 'rgba(255, 255, 255, 0.16)',
  success: '#31FE50',
  warning: '#FFB800',
  danger: '#FF6B6B',
  info: '#5AC8FA',
} as const;

/** Gradientes verticais (topo → base) do design system. */
export const gradients = {
  background: [colors.backgroundStart, colors.backgroundEnd] as const,
  card: [colors.surfaceStart, colors.surfaceEnd] as const,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
} as const;

export const typography = {
  hero: 32,
  h1: 28,
  h2: 24,
  h3: 20,
  body: 16,
  caption: 14,
  small: 12,
} as const;

export const layout = {
  paddingHorizontal: 24,
  buttonHeight: 56,
  ctaHeight: 72,
  searchHeight: 52,
  filterSize: 48,
  heroImageHeight: 240,
  cardRadius: 16,
  inputRadius: 16,
  buttonRadius: 12,
  /** Altura fixa dos cards no carrossel da Home. */
  carouselCardHeight: 220,
  /** Altura fixa dos cards de avaliação no carrossel do detalhe. */
  reviewCardHeight: 156,
  carouselTitleHeight: 56,
  /** Altura do fade inferior padronizado em todas as telas. */
  fadeHeight: 72,
  floatingTabBar: {
    height: 64,
    bottomOffset: 24,
    horizontalInset: 24,
    scrollPadding: 112,
    padding: 8,
    iconGap: 16,
    iconSize: 48,
    activeBorderWidth: 2,
  },
} as const;
