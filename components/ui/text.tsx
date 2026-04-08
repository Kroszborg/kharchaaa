import { useColors } from '@/context/theme-context';
import { TypeScale } from '@/constants/typography';
import React from 'react';
import { Text as RNText, type TextProps, type TextStyle } from 'react-native';

type Variant = keyof typeof TypeScale;
type ColorKey = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'warning' | 'error' | 'disabled';

interface KText extends TextProps {
  variant?: Variant;
  color?: ColorKey;
}

export function Text({ variant = 'body', color = 'primary', style, ...props }: KText) {
  const colors = useColors();
  const colorMap: Record<ColorKey, string> = {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    tertiary: colors.textTertiary,
    accent: colors.accent,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    disabled: colors.textDisabled,
  };
  const variantStyle = TypeScale[variant] as TextStyle;
  const colorValue = colorMap[color];

  return (
    <RNText
      style={[variantStyle, { color: colorValue }, style]}
      {...props}
    />
  );
}
