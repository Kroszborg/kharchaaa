import { AnimatedNumber } from '@/components/ui/animated-number';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { Radius, Spacing } from '@/constants/tokens';
import { FontFamily } from '@/constants/typography';
import { formatINR } from '@/lib/format';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface SpendHeroCardProps {
  totalSpend: number;
  totalIncome: number;
  month: string;
  percentChange?: number;
}

export function SpendHeroCard({ totalSpend, totalIncome, percentChange }: SpendHeroCardProps) {
  const net = totalIncome - totalSpend;
  const isDown = percentChange !== undefined && percentChange < 0;
  const netColor = net >= 0 ? Colors.success : Colors.error;

  return (
    <View style={styles.container}>
      {/* Label + trend */}
      <View style={styles.topRow}>
        <Text style={styles.label}>TOTAL SPENT</Text>
        {percentChange !== undefined && (
          <View style={[
            styles.badge,
            { backgroundColor: isDown ? Colors.successMuted : Colors.errorMuted },
          ]}>
            <Text style={[
              styles.badgeText,
              { color: isDown ? Colors.success : Colors.error },
            ]}>
              {isDown ? '↓' : '↑'} {Math.abs(percentChange)}% vs last month
            </Text>
          </View>
        )}
      </View>

      {/* Main amount — animates on mount/change */}
      <AnimatedNumber
        value={totalSpend}
        format={formatINR}
        style={styles.amount}
      />

      {/* Divider */}
      <View style={styles.divider} />

      {/* Income and net row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>INCOME</Text>
          <AnimatedNumber
            value={totalIncome}
            format={formatINR}
            style={[styles.statValue, { color: Colors.success }]}
          />
        </View>

        <View style={styles.statDivider} />

        <View style={styles.stat}>
          <Text style={styles.statLabel}>NET</Text>
          <AnimatedNumber
            value={Math.abs(net)}
            format={(n) => `${net >= 0 ? '+' : '−'}${formatINR(n)}`}
            style={[styles.statValue, { color: netColor }]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius['2xl'],
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 10,
    fontFamily: FontFamily.medium,
    color: Colors.textTertiary,
    letterSpacing: 1.5,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: FontFamily.medium,
    letterSpacing: 0,
  },
  amount: {
    fontSize: 42,
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
    letterSpacing: -2,
    lineHeight: 50,
    fontVariant: ['tabular-nums'],
    marginBottom: Spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    gap: 4,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: FontFamily.medium,
    color: Colors.textTertiary,
    letterSpacing: 1.4,
  },
  statValue: {
    fontSize: 18,
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.base,
  },
});
