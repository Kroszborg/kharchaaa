import { CreditGauge } from '@/components/insights/credit-gauge';
import { CategoryIcon } from '@/components/ui/category-icon';
import { Text } from '@/components/ui/text';
import { useColors } from '@/context/theme-context';
import { Radius, Spacing } from '@/constants/tokens';
import { FontFamily } from '@/constants/typography';
import { useCurrency } from '@/hooks/use-currency';
import { CATEGORY_LABELS } from '@/lib/mock-data';
import {
  selectCategoryBreakdown,
  selectMonthlyIncome,
  selectMonthlySpend,
  selectTransactions,
  useTransactionStore,
  useUIStore,
  type CurrencyCode,
} from '@/store';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { StarIcon } from '@hugeicons/core-free-icons';
import React, { useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-gifted-charts';

// ── Currency cards data ──────────────────────────────────────────────
const CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee',    flag: '🇮🇳', rate: '1.00'  },
  { code: 'USD', name: 'US Dollar',       flag: '🇺🇸', rate: '83.92' },
  { code: 'EUR', name: 'Euro',            flag: '🇪🇺', rate: '90.11' },
  { code: 'GBP', name: 'British Pound',   flag: '🇬🇧', rate: '106.3' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', rate: '61.45' },
] as const;

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - Spacing.base * 2 - Spacing.md * 2;

function buildBarData(currentSpend: number, accentColor: string, mutedColor: string) {
  const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const labels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i));
    return MONTH_SHORT[d.getMonth()];
  });
  const seeds = [0.65, 0.82, 0.71, 0.9, 0.78, 1];
  const base = currentSpend || 8000;
  return labels.map((label, i) => ({
    value: i < 5 ? Math.round(seeds[i] * base) : currentSpend,
    label,
    frontColor: i === 5 ? accentColor : mutedColor,
  }));
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}

function StatCard({ label, value, sub, highlight = false }: StatCardProps) {
  const colors = useColors();
  return (
    <View style={[
      styles.statCard,
      { backgroundColor: colors.surfaceElevated, borderColor: highlight ? colors.accentBorder : colors.border },
    ]}>
      <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{label}</Text>
      <Text
        style={[styles.statValue, { color: highlight ? colors.accentBright : colors.textPrimary }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      {sub ? <Text style={[styles.statSub, { color: colors.textTertiary }]}>{sub}</Text> : null}
    </View>
  );
}

function CategoryBar({ rank, category, total, percentage }: {
  rank: number;
  category: string;
  total: number;
  percentage: number;
}) {
  const colors = useColors();
  const { fmt } = useCurrency();
  return (
    <View style={styles.catRow}>
      <Text style={[styles.rank, { color: colors.textTertiary }]}>{rank}</Text>
      <CategoryIcon category={category as any} size={34} iconSize={15} />
      <View style={styles.catInfo}>
        <View style={styles.catNameRow}>
          <Text variant="bodyMedium" color="primary" style={{ flex: 1 }} numberOfLines={1}>
            {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] ?? category}
          </Text>
          <Text variant="captionMedium" color="secondary">{fmt(total, true)}</Text>
        </View>
        <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
          <View style={[styles.barFill, { width: `${Math.min(percentage, 100)}%`, backgroundColor: colors.accent }]} />
        </View>
      </View>
    </View>
  );
}

function CurrencyCard({ code, name, flag, rate }: {
  code: string; name: string; flag: string; rate: string;
}) {
  const colors = useColors();
  const selectedCurrency = useUIStore(s => s.selectedCurrency);
  const setCurrency = useUIStore(s => s.setCurrency);
  const [starred, setStarred] = useState(false);
  const isActive = selectedCurrency === code;

  function handleToggle() {
    setCurrency(isActive ? 'INR' : code as CurrencyCode);
  }

  return (
    <View style={styles.currencyCard}>
      <View style={styles.currencyLeft}>
        <View style={[styles.flagBox, { backgroundColor: colors.surface }]}>
          <Text style={styles.flagText}>{flag}</Text>
        </View>
        <View>
          <Text style={[styles.currencyCode, { color: colors.textPrimary }]}>{code}</Text>
          <Text style={[styles.currencyName, { color: colors.textTertiary }]}>{name}</Text>
        </View>
      </View>
      <View style={styles.currencyRight}>
        <Text style={[styles.rateText, { color: colors.textSecondary }]}>₹{rate}</Text>
        <Pressable
          style={[
            styles.enableBtn,
            { borderColor: colors.border, backgroundColor: colors.surface },
            isActive && { borderColor: colors.success + '60', backgroundColor: colors.successMuted },
          ]}
          onPress={handleToggle}
          hitSlop={8}
        >
          <Text style={[
            styles.enableBtnText,
            { color: colors.textTertiary },
            isActive && { color: colors.success },
          ]}>
            {isActive ? 'Active' : 'Enable'}
          </Text>
        </Pressable>
        <Pressable onPress={() => setStarred(v => !v)} hitSlop={8}>
          <HugeiconsIcon
            icon={StarIcon}
            size={16}
            color={starred ? '#FFB800' : colors.textTertiary}
            strokeWidth={starred ? 0 : 1.5}
          />
        </Pressable>
      </View>
    </View>
  );
}

export default function BalancesScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { fmt } = useCurrency();
  const transactions = useTransactionStore(selectTransactions);
  const monthlySpend = useTransactionStore(selectMonthlySpend);
  const monthlyIncome = useTransactionStore(selectMonthlyIncome);
  const categoryBreakdown = useTransactionStore(selectCategoryBreakdown);

  const { avgTx, netFlow, topCats, budget, barData, debitCount } = useMemo(() => {
    const debitTxns = transactions.filter(t => t.type === 'debit');
    return {
      debitCount: debitTxns.length,
      avgTx: debitTxns.length > 0 ? monthlySpend / debitTxns.length : 0,
      netFlow: monthlyIncome - monthlySpend,
      topCats: categoryBreakdown.slice(0, 5),
      budget: Math.max(monthlyIncome * 1.2, 100000),
      barData: buildBarData(monthlySpend, colors.accent, colors.accentMuted),
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, monthlySpend, monthlyIncome, categoryBreakdown, colors.accent]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Your Balances</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Manage your finances</Text>
      </View>

      {/* Credit Score Gauge */}
      <View style={[styles.gaugeCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        <CreditGauge score={660} size={220} />
        <Text style={[styles.gaugeCaption, { color: colors.textSecondary }]}>Your credit score is average</Text>
      </View>

      {/* Bar Chart */}
      <View style={styles.chartSection}>
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>MONTHLY SPENDING</Text>
        <View style={[styles.chartCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <BarChart
            data={barData}
            width={CHART_WIDTH}
            barWidth={32}
            spacing={14}
            roundedTop
            showGradient
            gradientColor={colors.accentMuted}
            rulesType="dashed"
            dashWidth={4}
            dashGap={6}
            rulesColor={colors.border}
            xAxisColor={colors.border}
            yAxisColor="transparent"
            yAxisTextStyle={[styles.axisLabel, { color: colors.textTertiary }] as any}
            xAxisLabelTextStyle={[styles.axisLabel, { color: colors.textTertiary }] as any}
            noOfSections={4}
            maxValue={Math.ceil(Math.max(...barData.map(d => d.value)) / 1000) * 1000 + 1000}
            isAnimated
            barBorderRadius={6}
            backgroundColor={colors.surfaceElevated}
          />
        </View>
        <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
          Spent {fmt(monthlySpend)} of {fmt(Math.round(budget))} budget this month
        </Text>
      </View>

      {/* Stats — 2×2 grid */}
      <View style={styles.grid}>
        <StatCard
          label="TOTAL SPENT"
          value={fmt(monthlySpend)}
          sub={`${debitCount} expense${debitCount !== 1 ? 's' : ''}`}
          highlight
        />
        <StatCard label="INCOME" value={fmt(monthlyIncome)} sub="this month" />
        <StatCard
          label="NET FLOW"
          value={fmt(Math.abs(netFlow))}
          sub={netFlow >= 0 ? 'surplus' : 'deficit'}
        />
        <StatCard
          label="AVG EXPENSE"
          value={fmt(Math.round(avgTx))}
          sub="per transaction"
        />
      </View>

      {/* Currency cards */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>AVAILABLE CURRENCIES</Text>
        <View style={[styles.currencyList, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          {CURRENCIES.map((c, i) => (
            <React.Fragment key={c.code}>
              <CurrencyCard {...c} />
              {i < CURRENCIES.length - 1 && <View style={[styles.catDivider, { backgroundColor: colors.border }]} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Category breakdown */}
      {topCats.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>TOP CATEGORIES</Text>
          <View style={[styles.catList, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            {topCats.map((cat, i) => (
              <React.Fragment key={cat.category}>
                <CategoryBar
                  rank={i + 1}
                  category={cat.category}
                  total={cat.total}
                  percentage={cat.percentage}
                />
                {i < topCats.length - 1 && <View style={[styles.catDivider, { backgroundColor: colors.border }]} />}
              </React.Fragment>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingBottom: 110,
    gap: Spacing.lg,
  },
  header: {
    paddingTop: Spacing.md,
    gap: 4,
  },
  title: {
    fontSize: 26,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
  },
  gaugeCard: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  gaugeCaption: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCard: {
    width: '47.5%',
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: 3,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: FontFamily.medium,
    letterSpacing: 1.4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  statSub: {
    fontSize: 11,
    fontFamily: FontFamily.regular,
    marginTop: 1,
  },
  chartSection: {
    gap: Spacing.sm,
  },
  chartCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    overflow: 'hidden',
  },
  summaryText: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
  },
  axisLabel: {
    fontSize: 10,
    fontFamily: FontFamily.regular,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: FontFamily.medium,
    letterSpacing: 1.5,
  },
  section: {
    gap: Spacing.sm,
  },
  catList: {
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  rank: {
    width: 16,
    fontSize: 11,
    fontFamily: FontFamily.medium,
    textAlign: 'center',
  },
  catInfo: {
    flex: 1,
    gap: 7,
  },
  catNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  barTrack: {
    height: 2,
    borderRadius: 1,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 1,
    opacity: 0.6,
  },
  catDivider: {
    height: 1,
    marginLeft: 58,
  },
  currencyList: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  currencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  currencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  flagBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagText: {
    fontSize: 20,
  },
  currencyCode: {
    fontSize: 14,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.3,
  },
  currencyName: {
    fontSize: 11,
    fontFamily: FontFamily.regular,
    marginTop: 1,
  },
  currencyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rateText: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    minWidth: 48,
    textAlign: 'right',
  },
  enableBtn: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  enableBtnText: {
    fontSize: 11,
    fontFamily: FontFamily.medium,
  },
});
