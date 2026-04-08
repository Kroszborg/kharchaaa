import { useColors } from '@/context/theme-context';
import { Colors } from '@/constants/theme';
import { Radius, Spacing } from '@/constants/tokens';
import { FontFamily } from '@/constants/typography';
import type { Category } from '@/lib/mock-data';
import { CATEGORY_LABELS } from '@/lib/mock-data';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text as RNText } from 'react-native';

export type FilterOption = Category | 'all';

const FILTERS: { key: FilterOption; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'food', label: CATEGORY_LABELS.food },
  { key: 'transport', label: CATEGORY_LABELS.transport },
  { key: 'shopping', label: CATEGORY_LABELS.shopping },
  { key: 'utilities', label: CATEGORY_LABELS.utilities },
  { key: 'entertainment', label: CATEGORY_LABELS.entertainment },
  { key: 'health', label: CATEGORY_LABELS.health },
  { key: 'salary', label: CATEGORY_LABELS.salary },
  { key: 'other', label: CATEGORY_LABELS.other },
];

interface FilterBarProps {
  active: FilterOption;
  onChange: (filter: FilterOption) => void;
}

export function FilterBar({ active, onChange }: FilterBarProps) {
  const colors = useColors();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map(f => {
        const isActive = f.key === active;
        return (
          <Pressable
            key={f.key}
            style={[
              styles.chip,
              { backgroundColor: colors.surface, borderColor: colors.border },
              isActive && { backgroundColor: Colors.accent, borderColor: Colors.accent },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(f.key);
            }}
          >
            <RNText
              style={{
                color: isActive ? colors.accentForeground : colors.textSecondary,
                fontFamily: FontFamily.medium,
                fontSize: 13,
                lineHeight: 16,
                includeFontPadding: false,
              }}
            >
              {f.label}
            </RNText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    paddingRight: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
