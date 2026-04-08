import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { Radius, Spacing } from '@/constants/tokens';
import { FontFamily } from '@/constants/typography';
import { formatINR } from '@/lib/format';
import type { CategorySummary } from '@/lib/mock-data';
import { CATEGORY_LABELS } from '@/lib/mock-data';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

interface CategoryDonutProps {
  data: CategorySummary[];
  totalSpend: number;
}

function LegendRow({ item }: { item: CategorySummary }) {
  return (
    <View style={styles.legendRow}>
      <View style={[styles.colorDot, { backgroundColor: item.color }]} />
      <Text variant="caption" color="secondary" style={{ flex: 1 }} numberOfLines={1}>
        {CATEGORY_LABELS[item.category]}
      </Text>
      <Text variant="captionMedium" color="tertiary" style={styles.pct}>{item.percentage}%</Text>
    </View>
  );
}

export function CategoryDonut({ data, totalSpend }: CategoryDonutProps) {
  if (data.length === 0) return null;

  const chartData = data.map(d => ({
    value: d.total,
    color: d.color,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Where it went</Text>

      <View style={styles.body}>
        {/* Donut chart */}
        <View style={styles.chartWrap}>
          <PieChart
            data={chartData}
            donut
            radius={72}
            innerRadius={50}
            // ── Critical fix: set inner circle to match card bg so center isn't white ──
            innerCircleColor={Colors.surfaceElevated}
            centerLabelComponent={() => (
              <View style={styles.centerLabel}>
                <Text variant="label" color="tertiary" style={{ letterSpacing: 1 }}>SPENT</Text>
                <Text
                  style={[styles.centerAmount, { color: Colors.textPrimary }]}
                >
                  {formatINR(totalSpend, true)}
                </Text>
              </View>
            )}
            strokeColor={Colors.surfaceElevated}
            strokeWidth={3}
          />
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {data.slice(0, 5).map(item => (
            <LegendRow key={item.category} item={item} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius['2xl'],
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heading: {
    fontSize: 14,
    fontFamily: FontFamily.semibold,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: Spacing.base,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  chartWrap: {
    // Prevent chart from taking too much width
  },
  centerLabel: {
    alignItems: 'center',
    gap: 2,
  },
  centerAmount: {
    fontSize: 13,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.3,
  },
  legend: {
    flex: 1,
    gap: 10,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pct: {
    width: 30,
    textAlign: 'right',
    color: Colors.textTertiary,
    fontSize: 11,
  },
});
