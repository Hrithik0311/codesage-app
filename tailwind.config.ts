import type {Config} from 'tailwindcss';

export default {
  darkMode: ['attr', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        body: ['var(--font-inter)', 'sans-serif'],
        headline: ['var(--font-space-grotesk)', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        'custom-primary': 'hsl(var(--custom-primary))',
        'custom-accent': 'hsl(var(--custom-accent))',
        'custom-background': 'hsl(var(--custom-background))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'slideDownNav': {
          from: { opacity: '0', transform: 'translateX(-50%) translateY(-100%)' },
          to: { opacity: '1', transform: 'translateX(-50%) translateY(0)' },
        },
        'fadeInUpHero': {
          from: { opacity: '0', transform: 'translateY(50px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slideInUpFeature': {
            from: { opacity: '0', transform: 'translateY(50px)' },
            to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scaleInStat': {
            from: { opacity: '0', transform: 'scale(0.8)' },
            to: { opacity: '1', transform: 'scale(1)' },
        },
        'textGlow': {
          '0%, 100%': { filter: 'drop-shadow(0 0 10px hsl(var(--primary) / 0.3)) drop-shadow(0 0 20px hsl(var(--accent) / 0.2))' },
          '50%': { filter: 'drop-shadow(0 0 20px hsl(var(--primary) / 0.5)) drop-shadow(0 0 30px hsl(var(--accent) / 0.3))' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-down-navbar': 'slideDownNav 1s ease-out',
        'fade-in-up-hero': 'fadeInUpHero 1.2s ease-out 0.5s both',
        'slide-in-up-feature': 'slideInUpFeature 0.8s ease-out forwards',
        'scale-in-stat': 'scaleInStat 0.8s ease-out forwards',
        'text-glow': 'textGlow 3s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
