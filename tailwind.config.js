/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#1E1E1E',
        surface: '#303030',
        elevated: '#3A3A3A',
        border: '#4A4A4A',
        accent: '#33FE4F',
        'text-primary': '#FFFFFF',
        'text-secondary': '#C7C7C7',
        'text-muted': '#8A8A8A',
        success: '#33FE4F',
        warning: '#FFB800',
        danger: '#FF6B6B',
        info: '#5AC8FA',
      },
      fontFamily: {
        inter: ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        poppins: ['Poppins_600SemiBold'],
        'poppins-bold': ['Poppins_700Bold'],
      },
      borderRadius: {
        card: '24px',
        input: '16px',
        button: '24px',
      },
    },
  },
  plugins: [],
};
