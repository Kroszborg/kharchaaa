import { AccountCard } from '@/components/home/account-card';
import { CategoryExpenseCard } from '@/components/home/category-expense-card';
import { TransactionRow } from '@/components/dashboard/transaction-row';
import { Screen } from '@/components/ui/screen';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Text } from '@/components/ui/text';
import { KharchaaaLogo } from '@/components/ui/kharchaaa-logo';
import { useColors } from '@/context/theme-context';
import { Colors } from '@/constants/theme';
import { Radius, Spacing } from '@/constants/tokens';
import { FontFamily } from '@/constants/typography';
import type { CategorySummary } from '@/lib/mock-data';
import { CATEGORY_COLORS } from '@/lib/mock-data';
import {
  selectCategoryBreakdown,
  selectIsLoading,
  selectMonthlyIncome,
  selectMonthlySpend,
  selectTransactions,
  useTransactionStore,
  useUserStore,
  selectUserProfile,
} from '@/store';
import type { FilterOption } from '@/components/transactions/filter-bar';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowRight01Icon,
  FlashIcon,
  Notification01Icon,
} from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

const PERIOD_OPTIONS = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
] as const;

type Period = 'weekly' | 'monthly';

export default function DashboardScreen() {
  const router = useRouter();
  const colors = useColors();
  const transactions = useTransactionStore(selectTransactions);
  const isLoading = useTransactionStore(selectIsLoading);
  const monthlySpend = useTransactionStore(selectMonthlySpend);
  const monthlyIncome = useTransactionStore(selectMonthlyIncome);
  const monthlyBreakdown = useTransactionStore(selectCategoryBreakdown);
  const profile = useUserStore(selectUserProfile);

  const [period, setPeriod] = useState<Period>('monthly');
  const setFilter = useTransactionStore(s => s.setFilter);

  const weeklyBreakdown = useMemo<CategorySummary[]>(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const recent = transactions.filter(t => new Date(t.date) >= cutoff && t.type === 'debit');
    const grouped: Partial<Record<string, { total: number; count: number }>> = {};
    for (const t of recent) {
      const g = grouped[t.category] ?? { total: 0, count: 0 };
      g.total += t.amount;
      g.count += 1;
      grouped[t.category] = g;
    }
    const total = recent.reduce((s, t) => s + t.amount, 0);
    return Object.entries(grouped)
      .map(([cat, g]) => ({
        category: cat as CategorySummary['category'],
        total: g!.total,
        count: g!.count,
        percentage: total > 0 ? (g!.total / total) * 100 : 0,
        color: CATEGORY_COLORS[cat as CategorySummary['category']],
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);
  }, [transactions]);

  const breakdown = period === 'weekly' ? weeklyBreakdown : monthlyBreakdown.slice(0, 4);
  const balance = monthlyIncome - monthlySpend;
  const recent = transactions.slice(0, 5);

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <Screen scrollable scrollProps={{ contentContainerStyle: styles.scrollContent }}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <KharchaaaLogo size={38} />
          <View style={styles.headerText}>
            <Text style={[styles.greeting, { color: colors.textPrimary }]}>
              Hey, {profile.name}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}
            </Text>
          </View>
        </View>
        <Pressable
          style={[styles.iconBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
          hitSlop={12}
          onPress={() => router.push('/notifications')}
        >
          <HugeiconsIcon icon={Notification01Icon} size={18} color={colors.textSecondary} strokeWidth={1.5} />
          <View style={styles.badge} />
        </Pressable>
      </View>

      {/* ── Account Card ── */}
      <AccountCard cardholderName={profile.name} balance={balance} />

      {/* ── Expense header with period toggle ── */}
      <View style={styles.expenseRow}>
        <Text style={[styles.expenseTitle, { color: colors.textPrimary }]}>Your expenses</Text>
        <SegmentedControl
          options={PERIOD_OPTIONS}
          selected={period}
          onChange={setPeriod}
          style={styles.periodControl}
        />
      </View>

      {/* ── Categories ── */}
      {breakdown.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
              Categories
            </Text>
          </View>
          <View style={styles.gap}>
            {breakdown.map(item => (
              <CategoryExpenseCard
                key={item.category}
                category={item.category}
                amount={item.total}
                count={item.count}
                percentage={item.percentage}
                onPress={() => {
                  setFilter({ category: item.category as FilterOption });
                  router.push('/(tabs)/transactions');
                }}
              />
            ))}
          </View>
        </View>
      ) : (
        <View style={[styles.emptyCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <HugeiconsIcon icon={FlashIcon} size={22} color={colors.textTertiary} strokeWidth={1.5} />
          <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
            {period === 'weekly' ? 'No expenses this week' : 'Tap + to add your first transaction'}
          </Text>
        </View>
      )}

      {/* ── Recent Transactions ── */}
      {recent.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
              Recent
            </Text>
            <Pressable onPress={() => router.push('/(tabs)/transactions')} style={styles.seeAll} hitSlop={12}>
              <Text style={[styles.seeAllText, { color: colors.accentBright }]}>All transactions</Text>
              <HugeiconsIcon icon={ArrowRight01Icon} size={12} color={colors.accentBright} strokeWidth={2} />
            </Pressable>
          </View>
          <View style={styles.gap}>
            {recent.map((t, i) => (
              <TransactionRow key={t.id} transaction={t} index={i} />
            ))}
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    gap: Spacing.lg,
    paddingBottom: 110,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    flex: 1,
  },
  headerText: {
    gap: 2,
  },
  greeting: {
    fontSize: 17,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },

  // Expense row
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  expenseTitle: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  periodControl: {
    flexShrink: 0,
    minWidth: 160,
  },

  // Sections
  section: {
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    letterSpacing: 0.1,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  seeAllText: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
  },
  gap: {
    gap: Spacing.sm,
  },

  // Empty
  emptyCard: {
    borderRadius: Radius.xl,
    paddingVertical: Spacing['2xl'],
    alignItems: 'center',
    borderWidth: 1,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
  },
});
