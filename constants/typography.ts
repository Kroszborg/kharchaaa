import type { TextStyle } from 'react-native';

// Font family constants — Inter via @expo-google-fonts/inter
export const FontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

// Type scale — even font sizes only
export const TypeScale: Record<string, TextStyle> = {
  display: {
    fontFamily: FontFamily.bold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h1: {
    fontFamily: FontFamily.semibold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: FontFamily.semibold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  h3: {
    fontFamily: FontFamily.semibold,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyLg: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  bodyMedium: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    lineHeight: 22,
  },
  caption: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  captionMedium: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
};
