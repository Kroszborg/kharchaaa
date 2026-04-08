import { TransactionRow } from '@/components/dashboard/transaction-row';
import { FilterBar } from '@/components/transactions/filter-bar';
import { SearchBar } from '@/components/transactions/search-bar';
import { Text } from '@/components/ui/text';
import { useColors } from '@/context/theme-context';
import { Spacing } from '@/constants/tokens';
import { FontFamily } from '@/constants/typography';
import { groupByDate } from '@/lib/format';
import { useCurrency } from '@/hooks/use-currency';
import {
  selectFilters,
  selectIsLoading,
  selectTransactions,
  useTransactionStore,
} from '@/store';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Search01Icon, Wallet01Icon } from '@hugeicons/core-free-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, SectionList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { FilterOption } from '@/components/transactions/filter-bar';

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  const colors = useColors();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        <HugeiconsIcon
          icon={hasFilters ? Search01Icon : Wallet01Icon}
          size={28}
          color={colors.textTertiary}
          strokeWidth={1.5}
        />
      </View>
      <Text variant="h3" color="primary" style={{ textAlign: 'center' }}>
        {hasFilters ? 'Nothing found' : 'No transactions yet'}
      </Text>
      <Text variant="body" color="tertiary" style={{ textAlign: 'center', marginTop: 4 }}>
        {hasFilters ? 'Try a different filter' : 'Tap + to record your first transaction'}
      </Text>
    </View>
  );
}

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { fmt } = useCurrency();
  const [isSearching, setIsSearching] = useState(false);

  // ── Stable selectors — never return new references on every render ──
  const transactions = useTransactionStore(selectTransactions);
  const filters = useTransactionStore(selectFilters);
  const isLoading = useTransactionStore(selectIsLoading);
  const setFilter = useTransactionStore(s => s.setFilter);

  // ── Filter in component body — React Compiler memoizes this automatically ──
  const filtered = transactions.filter(t => {
    const catMatch = filters.category === 'all' || t.category === filters.category;
    const searchMatch =
      !filters.search || t.merchant.toLowerCase().includes(filters.search.toLowerCase());
    return catMatch && searchMatch;
  });

  const monthlySpend = useTransactionStore(s => s.monthlySpend);
  const sections = groupByDate(filtered);
  const hasFilters = filters.category !== 'all' || filters.search !== '';

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.monthLabel, { color: colors.textTertiary }]}>
            {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }).toUpperCase()}
          </Text>
          <Text style={[styles.totalAmount, { color: colors.textPrimary }]}>
            {fmt(monthlySpend)}
          </Text>
        </View>
        <Pressable
          onPress={() => setIsSearching(true)}
          style={[styles.searchBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
          hitSlop={12}
        >
          <HugeiconsIcon icon={Search01Icon} size={18} color={colors.textSecondary} strokeWidth={1.5} />
        </Pressable>
      </View>

      {/* Search */}
      {isSearching && (
        <SearchBar
          value={filters.search}
          onChange={(text) => setFilter({ search: text })}
          onDismiss={() => {
            setIsSearching(false);
            setFilter({ search: '' });
          }}
        />
      )}

      {/* Filter chips — fixed height prevents SearchBar from compressing chips */}
      <View style={styles.filterWrap}>
        <FilterBar
          active={filters.category as FilterOption}
          onChange={(f) => setFilter({ category: f })}
        />
      </View>

      {/* List */}
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.rowWrap}>
            <TransactionRow transaction={item} index={index} />
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>{section.title}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState hasFilters={hasFilters} />}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.base,
  },
  monthLabel: {
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 34,
    lineHeight: 40,
    fontFamily: FontFamily.bold,
    letterSpacing: -1,
  },
  searchBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 6,
  },
  sectionHeader: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: FontFamily.medium,
    letterSpacing: 0.1,
  },
  filterWrap: {
    height: 42,
    justifyContent: 'center',
  },
  rowWrap: {
    marginBottom: Spacing.sm,
  },
  list: {
    paddingTop: Spacing.md,
    paddingBottom: 110,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
    gap: Spacing.sm,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
});
