import { CategoryIcon } from '@/components/ui/category-icon';
import { useColors } from '@/context/theme-context';
import { Colors } from '@/constants/theme';
import { Radius, Spacing } from '@/constants/tokens';
import { FontFamily } from '@/constants/typography';
import { formatTime } from '@/lib/format';
import { useCurrency } from '@/hooks/use-currency';
import type { Transaction } from '@/lib/mock-data';
import { CATEGORY_LABELS } from '@/lib/mock-data';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/text';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface TransactionRowProps {
  transaction: Transaction;
  index?: number;
  onPress?: () => void;
}

export function TransactionRow({ transaction, index = 0, onPress }: TransactionRowProps) {
  const colors = useColors();
  const { fmt } = useCurrency();
  const isDebit = transaction.type === 'debit';
  const amountColor = isDebit ? Colors.error : Colors.success;
  const amountPrefix = isDebit ? '−' : '+';

  const opacity    = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    const delay = Math.min(index * 40, 280);
    opacity.value    = withDelay(delay, withTiming(1, { duration: 220 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 28, stiffness: 300 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
          pressed && { opacity: 0.7, backgroundColor: colors.surfaceHighlight },
        ]}
        onPress={onPress}
      >
        <CategoryIcon category={transaction.category} size={42} iconSize={18} />

        <View style={styles.info}>
          <Text
            style={[styles.merchant, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {transaction.merchant}
          </Text>
          <Text style={[styles.category, { color: colors.textTertiary }]}>
            {CATEGORY_LABELS[transaction.category]}
            {transaction.note ? `  ·  ${transaction.note}` : ''}
          </Text>
        </View>

        <View style={styles.right}>
          <Text style={[styles.amount, { color: amountColor }]} numberOfLines={1}>
            {amountPrefix}{fmt(transaction.amount)}
          </Text>
          <Text style={[styles.time, { color: colors.textTertiary }]}>
            {formatTime(transaction.date)}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
  info: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  merchant: {
    fontSize: 14,
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.1,
  },
  category: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
  },
  right: {
    alignItems: 'flex-end',
    gap: 3,
    flexShrink: 0,
  },
  amount: {
    fontSize: 14,
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.3,
  },
  time: {
    fontSize: 11,
    fontFamily: FontFamily.regular,
  },
});
