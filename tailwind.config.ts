import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#080807',
          darker: '#040404',
          secondary: '#131210',
          card: '#181715',
          'card-hover': '#21201D',
          border: 'rgba(255, 255, 255, 0.12)',
          'border-light': 'rgba(255, 255, 255, 0.22)',
          gold: '#C5A880',
          'gold-light': '#E2CEB5',
          cream: '#F4EFE7',
          muted: '#B8B1A5',
          'muted-dark': '#756F65',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        script: ['var(--font-script)', 'Italianno', 'cursive'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        pill: '9999px',
      },
      boxShadow: {
        luxury: '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'luxury-hover': '0 16px 48px 0 rgba(0, 0, 0, 0.65)',
        glow: '0 0 25px rgba(197, 168, 128, 0.18)',
      },
      screens: {
        xs: '420px',
      },
    },
  },
  plugins: [],
};

export default config;
