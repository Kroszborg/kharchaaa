import { Colors } from '@/constants/theme';
import { Duration, Radius, Shadow, Spacing, Spring } from '@/constants/tokens';
import { FontFamily, TypeScale } from '@/constants/typography';

// Always returns dark theme tokens — Kharchaaa is dark-only
export function useAppTheme() {
  return {
    colors: Colors,
    spacing: Spacing,
    radius: Radius,
    shadow: Shadow,
    duration: Duration,
    spring: Spring,
    typography: TypeScale,
    fonts: FontFamily,
  };
}

export type AppTheme = ReturnType<typeof useAppTheme>;
