// Kharchaaa Design System — Premium Black & White (CRED-inspired)

export const Colors = {
  // ─── Backgrounds — pure black system ──────────────────────────────────────
  background: '#0A0A0A',
  surface: '#111111',
  surfaceElevated: '#1C1C1C',
  surfaceHighlight: '#262626',

  // ─── Accent — white is the premium accent in dark mode ────────────────────
  accent: '#FFFFFF',
  accentForeground: '#0A0A0A',   // text/icon ON the accent background
  accentBright: '#F0F0F0',
  accentMuted: 'rgba(255,255,255,0.07)',
  accentGlow: 'rgba(255,255,255,0.12)',
  accentBorder: 'rgba(255,255,255,0.14)',
  accentGradient: ['#FFFFFF', '#E8E8E8'] as [string, string],

  // ─── Semantic Colors ────────────────────────────────────────────────────────
  success: '#22C55E',
  successMuted: 'rgba(34,197,94,0.12)',
  warning: '#F59E0B',
  warningMuted: 'rgba(245,158,11,0.12)',
  error: '#EF4444',
  errorMuted: 'rgba(239,68,68,0.12)',

  // ─── Text ──────────────────────────────────────────────────────────────────
  textPrimary: '#FAFAFA',
  textSecondary: '#787878',
  textTertiary: '#3C3C3C',
  textDisabled: '#1E1E1E',

  // ─── Borders & Dividers ────────────────────────────────────────────────────
  border: 'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.12)',
  borderHighlight: 'rgba(255,255,255,0.18)',

  // ─── Glass / Frosted UI ────────────────────────────────────────────────────
  glassBg: 'rgba(255,255,255,0.04)',
  glassBorder: 'rgba(255,255,255,0.07)',

  // ─── Transaction Type Colors ────────────────────────────────────────────────
  debit: '#EF4444',
  credit: '#22C55E',

  // ─── Category Colors — vibrant neon palette ─────────────────────────────────
  categories: {
    food: '#F97316',
    transport: '#22D3EE',
    shopping: '#A78BFA',
    utilities: '#60A5FA',
    entertainment: '#F472B6',
    health: '#34D399',
    salary: '#22C55E',
    other: '#9CA3AF',
  },

  // ─── Legacy compat ────────────────────────────────────────────────────────
  dark: { text: '#FAFAFA', background: '#0A0A0A', tint: '#FFFFFF', icon: '#787878', tabIconDefault: '#3C3C3C', tabIconSelected: '#FFFFFF' },
  light: { text: '#FAFAFA', background: '#0A0A0A', tint: '#FFFFFF', icon: '#787878', tabIconDefault: '#3C3C3C', tabIconSelected: '#FFFFFF' },
} as const;

// ─── Gradient Definitions ──────────────────────────────────────────────────
export const Gradients = {
  card:    ['#2E2E2E', '#101010'] as [string, string],  // premium dark card
  accent:  ['#FFFFFF', '#E8E8E8'] as [string, string],  // white CTA gradient
  success: ['#22C55E', '#16A34A'] as [string, string],
  warm:    ['#F59E0B', '#EF4444'] as [string, string],
} as const;

// ─── Light Mode Colors ─────────────────────────────────────────────────────
export const LightColors = {
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceHighlight: '#EBEBEB',

  accent: '#0A0A0A',
  accentForeground: '#FFFFFF',
  accentBright: '#1A1A1A',
  accentMuted: 'rgba(0,0,0,0.06)',
  accentGlow: 'rgba(0,0,0,0.10)',
  accentBorder: 'rgba(0,0,0,0.12)',
  accentGradient: ['#0A0A0A', '#1A1A1A'] as [string, string],

  success: '#16A34A',
  successMuted: 'rgba(22,163,74,0.10)',
  warning: '#D97706',
  warningMuted: 'rgba(217,119,6,0.10)',
  error: '#DC2626',
  errorMuted: 'rgba(220,38,38,0.10)',

  textPrimary: '#0A0A0A',
  textSecondary: '#555555',
  textTertiary: '#999999',
  textDisabled: '#CCCCCC',

  border: 'rgba(0,0,0,0.08)',
  borderStrong: 'rgba(0,0,0,0.14)',
  borderHighlight: 'rgba(0,0,0,0.22)',

  glassBg: 'rgba(0,0,0,0.03)',
  glassBorder: 'rgba(0,0,0,0.08)',

  debit: '#DC2626',
  credit: '#16A34A',

  categories: {
    food: '#EA580C',
    transport: '#0891B2',
    shopping: '#7C3AED',
    utilities: '#2563EB',
    entertainment: '#DB2777',
    health: '#059669',
    salary: '#16A34A',
    other: '#6B7280',
  },

  dark: { text: '#0A0A0A', background: '#F5F5F5', tint: '#0A0A0A', icon: '#555555', tabIconDefault: '#999999', tabIconSelected: '#0A0A0A' },
  light: { text: '#0A0A0A', background: '#F5F5F5', tint: '#0A0A0A', icon: '#555555', tabIconDefault: '#999999', tabIconSelected: '#0A0A0A' },
} as const;

export type ThemeColors = typeof Colors;
export type ColorScheme = 'dark' | 'light';
