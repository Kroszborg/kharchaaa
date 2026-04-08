import { CategoryIcon } from '@/components/ui/category-icon';
import { useColors } from '@/context/theme-context';
import { FontFamily } from '@/constants/typography';
import { Radius, Spacing } from '@/constants/tokens';
import type { Category } from '@/lib/mock-data';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/mock-data';
import { useCurrency } from '@/hooks/use-currency';
import React from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';

interface CategoryExpenseCardProps {
  category: Category;
  amount: number;
  count: number;
  percentage: number;
  trend?: string;
  onPress?: () => void;
}

export function CategoryExpenseCard({ category, amount, count, percentage, trend, onPress }: CategoryExpenseCardProps) {
  const colors = useColors();
  const { fmt } = useCurrency();
  const color = CATEGORY_COLORS[category];
  const label = CATEGORY_LABELS[category];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      <View style={styles.left}>
        <CategoryIcon category={category} size={42} iconSize={20} />
        <View style={styles.info}>
          <Text style={[styles.categoryName, { color: colors.textPrimary }]}>{label}</Text>
          <Text style={[styles.countText, { color: colors.textTertiary }]}>
            {count} transaction{count !== 1 ? 's' : ''}
          </Text>
          {trend && <Text style={[styles.trendText, { color: colors.textSecondary }]}>{trend}</Text>}
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: colors.textPrimary }]}>{fmt(amount)}</Text>
        <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
          <View style={[styles.barFill, { width: `${Math.min(percentage, 100)}%`, backgroundColor: color }]} />
        </View>
        <Text style={[styles.pctText, { color: colors.textTertiary }]}>{Math.round(percentage)}%</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  info: {
    gap: 2,
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.1,
  },
  countText: {
    fontSize: 11,
    fontFamily: FontFamily.regular,
  },
  trendText: {
    fontSize: 11,
    fontFamily: FontFamily.medium,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
    minWidth: 80,
  },
  amount: {
    fontSize: 15,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.3,
  },
  barTrack: {
    width: 72,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  pctText: {
    fontSize: 10,
    fontFamily: FontFamily.medium,
  },
});
