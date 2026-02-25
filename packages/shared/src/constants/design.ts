// Design system constants following the brief

export const COLORS = {
  voidBlack: '#0A0A0F',      // Primary background
  deepNight: '#0F0A1A',      // Cards
  darkPurple: '#1A0A2E',     // Secondary backgrounds
  royalPurple: '#6B21A8',    // Primary accent, buttons
  amethyst: '#A855F7',       // Hover states
  ghostWhite: '#F5F5F5',     // Primary text
  ashGray: '#A1A1AA',        // Secondary text
} as const;

export const FONTS = {
  thaiBody: 'Noto Sans Thai, sans-serif',
  thaiHeading: 'Prompt, sans-serif',
  english: 'Space Grotesk, sans-serif',
  oracle: 'Sarabun, sans-serif', // Weight 200 for oracle voice
  mono: 'JetBrains Mono, monospace',
} as const;

export const ANIMATION = {
  letterDelay: 30, // ms between letters for oracle voice
  cardHover: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  glow: 'opacity 1.5s ease-in-out infinite',
} as const;

export const TOUCH_TARGET = 44; // Minimum touch target size in px
