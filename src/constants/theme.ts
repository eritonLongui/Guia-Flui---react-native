export const colors = {
  background: '#1E1E1E',
  surface: '#303030',
  elevated: '#3A3A3A',
  border: '#4A4A4A',
  accent: '#33FE4F',
  accentBorder: 'rgba(51, 254, 79, 0.45)',
  textPrimary: '#FFFFFF',
  textSecondary: '#C7C7C7',
  textMuted: '#8A8A8A',
  success: '#33FE4F',
  warning: '#FFB800',
  danger: '#FF6B6B',
  info: '#5AC8FA',
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
