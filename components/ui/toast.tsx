import { Colors } from '@/constants/theme';
import { Radius, Shadow, Spacing } from '@/constants/tokens';
import { FontFamily } from '@/constants/typography';
import { useUIStore, type Toast } from '@/store/slices/ui-slice';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TYPE_STYLES: Record<Toast['type'], { accent: string; label: string }> = {
  success: { accent: Colors.success,      label: 'Success' },
  error:   { accent: Colors.error,        label: 'Error'   },
  info:    { accent: Colors.accentBright, label: 'Info'    },
};

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useUIStore(s => s.dismissToast);
  const ty = useSharedValue(-72);
  const op = useSharedValue(0);
  const sc = useSharedValue(0.94);
  const theme = TYPE_STYLES[toast.type];

  useEffect(() => {
    ty.value = withSpring(0, { damping: 22, stiffness: 340 });
    op.value = withTiming(1, { duration: 160 });
    sc.value = withSpring(1, { damping: 22, stiffness: 340 });

    const t = setTimeout(() => {
      ty.value = withTiming(-72, { duration: 200 });
      op.value = withTiming(0, { duration: 200 }, () => { dismiss(toast.id); });
      sc.value = withTiming(0.94, { duration: 200 });
    }, 2700);
    return () => clearTimeout(t);
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }, { scale: sc.value }],
    opacity: op.value,
  }));

  return (
    <Animated.View style={[styles.toast, { borderColor: theme.accent + '40' }, style]}>
      <View style={[styles.pill, { backgroundColor: theme.accent + '22' }]}>
        <View style={[styles.dot, { backgroundColor: theme.accent }]} />
        <Text style={[styles.typeLabel, { color: theme.accent }]}>{theme.label}</Text>
      </View>
      <Text style={styles.message} numberOfLines={2}>{toast.message}</Text>
    </Animated.View>
  );
}

export function ToastContainer() {
  const toasts = useUIStore(s => s.toasts);
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View style={[styles.container, { top: insets.top + 8 }]} pointerEvents="none">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.base,
    right: Spacing.base,
    zIndex: 9999,
    gap: Spacing.sm,
    alignItems: 'stretch',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    // Solid dark card — never see-through
    backgroundColor: '#1A1A2E',
    ...Shadow.md,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    flexShrink: 0,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  typeLabel: {
    fontSize: 11,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.2,
  },
  message: {
    flex: 1,
    fontSize: 13,
    fontFamily: FontFamily.medium,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
});
