import { Text } from '@/components/ui/text';
import { useColors } from '@/context/theme-context';
import { Colors } from '@/constants/theme';
import { Radius, Spacing } from '@/constants/tokens';
import { FontFamily } from '@/constants/typography';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowLeft01Icon,
  Notification01Icon,
} from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'alert',
    title: 'Budget Alert',
    body: 'You\'ve used 80% of your food budget this month.',
    time: '2m ago',
    unread: true,
    dot: Colors.warning,
  },
  {
    id: '2',
    type: 'info',
    title: 'Weekly Summary Ready',
    body: 'Your spending report for this week is available.',
    time: '1h ago',
    unread: true,
    dot: Colors.accentBright,
  },
  {
    id: '3',
    type: 'success',
    title: 'Transaction Saved',
    body: '₹450 to Swiggy has been recorded successfully.',
    time: '3h ago',
    unread: false,
    dot: Colors.success,
  },
  {
    id: '4',
    type: 'info',
    title: 'New Feature',
    body: 'Currency tracker is now live. Enable currencies in Balances.',
    time: 'Yesterday',
    unread: false,
    dot: Colors.accentBright,
  },
] as const;

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Notifications</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_NOTIFICATIONS.map((n) => (
          <Pressable
            key={n.id}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
              n.unread && { borderColor: colors.accentBorder, backgroundColor: colors.accentMuted },
              pressed && { opacity: 0.75 },
            ]}
          >
            <View style={[styles.dotWrap, { backgroundColor: n.dot + '22' }]}>
              <View style={[styles.dot, { backgroundColor: n.dot }]} />
            </View>
            <View style={styles.body}>
              <View style={styles.titleRow}>
                <Text
                  style={[
                    styles.notifTitle,
                    { color: n.unread ? colors.textPrimary : colors.textSecondary },
                    n.unread && styles.notifTitleUnread,
                  ]}
                  numberOfLines={1}
                >
                  {n.title}
                </Text>
                <Text style={[styles.time, { color: colors.textTertiary }]}>{n.time}</Text>
              </View>
              <Text style={[styles.notifBody, { color: colors.textSecondary }]} numberOfLines={2}>
                {n.body}
              </Text>
            </View>
          </Pressable>
        ))}

        {(MOCK_NOTIFICATIONS as readonly unknown[]).length === 0 && (
          <View style={styles.empty}>
            <HugeiconsIcon icon={Notification01Icon} size={32} color={colors.textTertiary} strokeWidth={1.5} />
            <Text variant="body" color="tertiary" style={{ textAlign: 'center', marginTop: Spacing.sm }}>
              No notifications yet
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontFamily: FontFamily.bold,
    letterSpacing: -0.3,
  },
  list: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: 32,
    gap: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    gap: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.md,
  },
  dotWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  notifTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: FontFamily.medium,
  },
  notifTitleUnread: {
    fontFamily: FontFamily.semibold,
  },
  time: {
    fontSize: 11,
    fontFamily: FontFamily.regular,
    flexShrink: 0,
  },
  notifBody: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    lineHeight: 18,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
  },
});
