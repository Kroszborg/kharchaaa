import { CategoryIcon } from '@/components/ui/category-icon';
import { Text } from '@/components/ui/text';
import { useColors } from '@/context/theme-context';
import { Radius, Spacing } from '@/constants/tokens';
import type { Category } from '@/lib/mock-data';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/mock-data';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

const CATEGORIES: Category[] = [
  'food',
  'transport',
  'shopping',
  'utilities',
  'entertainment',
  'health',
  'salary',
  'other',
];

interface CategoryPickerProps {
  selected: Category | null;
  onSelect: (category: Category) => void;
}

export function CategoryPicker({ selected, onSelect }: CategoryPickerProps) {
  const colors = useColors();
  return (
    <View>
      <Text variant="h3" color="primary" style={{ marginBottom: Spacing.md }}>
        Category
      </Text>
      <View style={styles.grid}>
        {CATEGORIES.map(cat => {
          const isSelected = selected === cat;
          return (
            <Pressable
              key={cat}
              style={[
                styles.item,
                { borderColor: colors.border, backgroundColor: colors.surface },
                isSelected && {
                  backgroundColor: CATEGORY_COLORS[cat] + '20',
                  borderColor: CATEGORY_COLORS[cat] + '60',
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                onSelect(cat);
              }}
            >
              <CategoryIcon category={cat} size={40} iconSize={18} />
              <Text
                variant="captionMedium"
                style={{
                  color: isSelected ? CATEGORY_COLORS[cat] : colors.textSecondary,
                  textAlign: 'center',
                  marginTop: 4,
                }}
              >
                {CATEGORY_LABELS[cat]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  item: {
    width: '22%',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
});
