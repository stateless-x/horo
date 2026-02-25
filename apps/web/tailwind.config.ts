import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        voidBlack: '#0A0A0F',
        deepNight: '#0F0A1A',
        darkPurple: '#1A0A2E',
        royalPurple: '#6B21A8',
        amethyst: '#A855F7',
        ghostWhite: '#F5F5F5',
        ashGray: '#A1A1AA',
      },
      fontFamily: {
        thai: ['Noto Sans Thai', 'sans-serif'],
        heading: ['Prompt', 'sans-serif'],
        english: ['Space Grotesk', 'sans-serif'],
        oracle: ['Sarabun', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        glow: 'glow 1.5s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
