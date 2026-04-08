import { useColors } from '@/context/theme-context';
import { Radius, Spacing } from '@/constants/tokens';
import { FontFamily } from '@/constants/typography';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface CalendarPickerProps {
  visible: boolean;
  value: Date;
  onChange: (date: Date) => void;
  onDismiss: () => void;
  maxDate?: Date;
}

export function CalendarPicker({ visible, value, onChange, onDismiss, maxDate }: CalendarPickerProps) {
  const colors = useColors();
  const [viewYear, setViewYear] = useState(value.getFullYear());
  const [viewMonth, setViewMonth] = useState(value.getMonth());

  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 22, stiffness: 300 });
      opacity.value = withSpring(1, { damping: 22, stiffness: 300 });
      setViewYear(value.getFullYear());
      setViewMonth(value.getMonth());
    } else {
      scale.value = 0.92;
      opacity.value = 0;
    }
  }, [visible]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    const now = maxDate ?? new Date();
    const isMax = viewYear === now.getFullYear() && viewMonth === now.getMonth();
    if (isMax) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function buildCalendar(): (number | null)[][] {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const rows: (number | null)[][] = [];
    let day = 1 - firstDay;
    for (let r = 0; r < 6; r++) {
      const row: (number | null)[] = [];
      for (let c = 0; c < 7; c++) {
        row.push(day >= 1 && day <= daysInMonth ? day : null);
        day++;
      }
      rows.push(row);
      if (day > daysInMonth) break;
    }
    return rows;
  }

  const today = new Date();
  const max = maxDate ?? today;
  const selectedDay = value.getDate();
  const isSelectedMonth = value.getMonth() === viewMonth && value.getFullYear() === viewYear;

  function isDisabled(d: number): boolean {
    const date = new Date(viewYear, viewMonth, d);
    return date > max;
  }

  function handleSelect(d: number) {
    if (isDisabled(d)) return;
    const newDate = new Date(viewYear, viewMonth, d);
    onChange(newDate);
    onDismiss();
  }

  const calendar = buildCalendar();

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onDismiss} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
        <Animated.View style={[
          styles.card,
          { backgroundColor: colors.surfaceElevated, borderColor: colors.borderStrong },
          cardStyle,
        ]}>
          {/* Month/Year header */}
          <View style={styles.header}>
            <Pressable onPress={prevMonth} style={styles.navBtn} hitSlop={8}>
              <HugeiconsIcon icon={ArrowLeft01Icon} size={18} color={colors.textSecondary} strokeWidth={2} />
            </Pressable>
            <Text style={[styles.monthTitle, { color: colors.textPrimary }]}>
              {MONTHS[viewMonth]} {viewYear}
            </Text>
            <Pressable onPress={nextMonth} style={styles.navBtn} hitSlop={8}>
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} color={colors.textSecondary} strokeWidth={2} />
            </Pressable>
          </View>

          {/* Day labels */}
          <View style={styles.dayLabels}>
            {DAYS.map(d => (
              <Text key={d} style={[styles.dayLabel, { color: colors.textTertiary }]}>{d}</Text>
            ))}
          </View>

          {/* Calendar grid */}
          {calendar.map((row, ri) => (
            <View key={ri} style={styles.row}>
              {row.map((day, ci) => {
                if (day === null) return <View key={ci} style={styles.dayCell} />;
                const isSelected = isSelectedMonth && day === selectedDay;
                const disabled = isDisabled(day);
                const isToday = today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear;
                return (
                  <Pressable
                    key={ci}
                    style={[
                      styles.dayCell,
                      isSelected && { backgroundColor: colors.accent, borderRadius: Radius.full },
                      !isSelected && isToday && { borderWidth: 1, borderColor: colors.accentBorder, borderRadius: Radius.full },
                    ]}
                    onPress={() => handleSelect(day)}
                    disabled={disabled}
                  >
                    <Text style={[
                      styles.dayText,
                      { color: colors.textPrimary },
                      isSelected && { color: colors.accentForeground, fontFamily: FontFamily.semibold },
                      disabled && { color: colors.textDisabled },
                    ]}>
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}

          {/* Today shortcut */}
          <Pressable
            style={[styles.todayBtn, { borderTopColor: colors.border }]}
            onPress={() => { onChange(new Date()); onDismiss(); }}
          >
            <Text style={[styles.todayText, { color: colors.accent }]}>Today</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  card: {
    width: '100%',
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 16,
    fontFamily: FontFamily.semibold,
    letterSpacing: -0.3,
  },
  dayLabels: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: FontFamily.medium,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
  },
  todayBtn: {
    borderTopWidth: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  todayText: {
    fontSize: 15,
    fontFamily: FontFamily.medium,
  },
});
