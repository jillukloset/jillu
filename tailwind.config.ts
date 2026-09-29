import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--color-ink-rgb) / <alpha-value>)',
        paper: 'rgb(var(--color-paper-rgb) / <alpha-value>)',
        surface: 'rgb(var(--color-surface-rgb) / <alpha-value>)',
        border: 'rgb(var(--color-border-rgb) / <alpha-value>)',
        muted: 'rgb(var(--color-muted-rgb) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--color-accent-rgb) / <alpha-value>)',
          ink: 'rgb(var(--color-accent-ink-rgb) / <alpha-value>)',
          // Darkened for text-on-light-background use only (WCAG AA 4.5:1+ at small sizes).
          // The base accent stays at full saturation for backgrounds/icons/large elements,
          // where its own ~3.5:1 ratio already clears the non-text/large-text 3:1 requirement.
          text: 'rgb(var(--color-accent-text-rgb) / <alpha-value>)',
        },
        plum: 'rgb(var(--color-plum-rgb) / <alpha-value>)',
        success: 'rgb(var(--color-success-rgb) / <alpha-value>)',
        danger: 'rgb(var(--color-danger-rgb) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        raised: 'var(--shadow-raised)',
      },
      transitionDuration: {
        fast: 'var(--transition-fast)',
        base: 'var(--transition-base)',
      },
      screens: {
        xs: '390px',
      },
      spacing: {
        gutter: 'var(--space-gutter)',
      },
    },
  },
  plugins: [],
};

export default config;
