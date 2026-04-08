import { Colors } from '@/constants/theme';
import { Radius, Spacing } from '@/constants/tokens';
import { TypeScale } from '@/constants/typography';
import React from 'react';
import { StyleSheet, type TextStyle, View, type ViewStyle, Text } from 'react-native';

type BadgeVariant = 'accent' | 'success' | 'warning' | 'error' | 'neutral' | 'category';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: string; // override bg color for category variant
  style?: ViewStyle;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  accent: { bg: Colors.accentMuted, text: Colors.accent },
  success: { bg: Colors.successMuted, text: Colors.success },
  warning: { bg: Colors.warningMuted, text: Colors.warning },
  error: { bg: Colors.errorMuted, text: Colors.error },
  neutral: { bg: Colors.border, text: Colors.textSecondary },
  category: { bg: Colors.accentMuted, text: Colors.textSecondary },
};

export function Badge({ label, variant = 'neutral', size = 'sm', color, style }: BadgeProps) {
  const vs = variantStyles[variant];
  const bgColor = color ? color + '30' : vs.bg;
  const textColor = color ?? vs.text;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bgColor },
        size === 'md' && styles.sizeMd,
        style,
      ]}
    >
      <Text
        style={[
          TypeScale.captionMedium as TextStyle,
          { color: textColor },
          size === 'md' && (TypeScale.bodyMedium as TextStyle),
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  sizeMd: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
});
