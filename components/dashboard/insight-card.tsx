import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { Radius, Spacing } from '@/constants/tokens';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { FontFamily } from '@/constants/typography';
import type { Analytics01Icon } from '@hugeicons/core-free-icons';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export type Insight = {
  id: string;
  icon: typeof Analytics01Icon; // any Hugeicons icon shape
  iconColor: string;
  title: string;
  subtitle: string;
};

function InsightChip({ insight }: { insight: Insight }) {
  const bgColor = insight.iconColor + '18';
  const borderColor = insight.iconColor + '30';

  return (
    <View style={[styles.chip, { borderColor }]}>
      <View style={[styles.iconWrap, { backgroundColor: bgColor }]}>
        <HugeiconsIcon
          icon={insight.icon}
          size={16}
          color={insight.iconColor}
          strokeWidth={1.8}
        />
      </View>
      <View style={styles.chipText}>
        <Text variant="captionMedium" color="primary" numberOfLines={1}>
          {insight.title}
        </Text>
        <Text variant="caption" color="tertiary" numberOfLines={1}>
          {insight.subtitle}
        </Text>
      </View>
    </View>
  );
}

interface InsightCardsProps {
  insights: Insight[];
}

export function InsightCards({ insights }: InsightCardsProps) {
  if (insights.length === 0) return null;

  return (
    <View>
      <Text style={styles.heading}>Insights</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {insights.map(insight => (
          <InsightChip key={insight.id} insight={insight} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 14,
    fontFamily: FontFamily.semibold,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: Spacing.sm,
  },
  scroll: {
    gap: Spacing.sm,
    paddingRight: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
    width: 188,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    flex: 1,
    gap: 3,
  },
});
