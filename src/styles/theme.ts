// Design System Tokens para o Guia Flui
// Baseado na identidade visual da Flui Soluções Sustentáveis (Premium, Energia Solar e Mobilidade Elétrica)

export const Colors = {
  // Cores de Marca
  primary: '#00A859', // Verde Solar / Sustentável
  secondary: '#FFB800', // Amarelo Energia / Sol
  dark: '#121212', // Fundo Dark Premium
  light: '#F5F5F7', // Fundo Light
  cardDark: '#1E1E1E', // Fundo de cards em modo dark
  cardLight: '#FFFFFF', // Fundo de cards em modo light
  
  // Feedback e Status
  success: '#00C853',
  warning: '#FFD600',
  danger: '#DD2C00',
  info: '#00B0FF',
  
  // Tons de Cinza
  grey100: '#F5F5F5',
  grey200: '#EEEEEE',
  grey300: '#E0E0E0',
  grey400: '#BDBDBD',
  grey500: '#9E9E9E',
  grey600: '#757575',
  grey700: '#616161',
  grey800: '#424242',
  grey900: '#212121',
  
  // Texto
  textDark: '#FFFFFF',
  textLight: '#1C1C1E',
  textSecondaryDark: '#A1A1A6',
  textSecondaryLight: '#8E8E93',
  
  // Compatibilidade do Veículo (Seção 16 do PDA)
  compatible: '#00C853',
  partiallyCompatible: '#FFD600',
  incompatible: '#DD2C00',
  uncertain: '#9E9E9E',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const Typography = {
  fontFamily: 'Inter',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    heading: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  }
};

export const Layout = {
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 9999,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  }
};
