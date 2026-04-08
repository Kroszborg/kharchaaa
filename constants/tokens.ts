export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 14,
  },
  // Neutral glow — for the Add button and accent elements
  accent: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  accentSoft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

export const Duration = {
  fast: 120,    // micro-interactions
  normal: 220,  // standard transitions
  slow: 380,    // deliberate / decorative
  xslow: 600,
} as const;

export const Spring = {
  gentle: { damping: 22, stiffness: 180 },
  bouncy: { damping: 12, stiffness: 280 },
  snappy: { damping: 28, stiffness: 420 },
  stiff: { damping: 40, stiffness: 600 },
} as const;
