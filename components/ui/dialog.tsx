import { Radius, Spacing } from '@/constants/tokens';
import { FontFamily } from '@/constants/typography';
import React, { useEffect } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export interface DialogAction {
  label: string;
  onPress: () => void;
  style?: 'default' | 'destructive' | 'cancel';
}

interface DialogProps {
  visible: boolean;
  title: string;
  message?: string;
  actions: DialogAction[];
  onDismiss?: () => void;
}

export function Dialog({ visible, title, message, actions, onDismiss }: DialogProps) {
  const backdropOp = useSharedValue(0);
  const cardScale  = useSharedValue(0.88);
  const cardOp     = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      backdropOp.value = withTiming(1, { duration: 160 });
      cardScale.value  = withSpring(1,  { damping: 22, stiffness: 280 });
      cardOp.value     = withTiming(1,  { duration: 140 });
    } else {
      backdropOp.value = withTiming(0, { duration: 140 });
      cardScale.value  = withTiming(0.92, { duration: 120 });
      cardOp.value     = withTiming(0,  { duration: 120 });
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOp.value }));
  const cardStyle     = useAnimatedStyle(() => ({
    opacity: cardOp.value,
    transform: [{ scale: cardScale.value }],
  }));

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onDismiss} statusBarTranslucent>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
        <Animated.View style={[styles.card, cardStyle]}>
          <View style={styles.textBlock}>
            <Text style={styles.title}>{title}</Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>

          <View style={styles.divider} />

          <View style={[styles.actions, actions.length > 2 && styles.actionsColumn]}>
            {actions.map((action, i) => (
              <React.Fragment key={action.label}>
                {i > 0 && actions.length <= 2 && <View style={styles.actionDividerV} />}
                {i > 0 && actions.length > 2 && <View style={styles.divider} />}
                <Pressable
                  style={({ pressed }) => [
                    styles.action,
                    actions.length > 2 && styles.actionFull,
                    pressed && { opacity: 0.6 },
                  ]}
                  onPress={() => {
                    action.onPress();
                  }}
                >
                  <Text
                    style={[
                      styles.actionLabel,
                      action.style === 'destructive' && styles.actionDestructive,
                      action.style === 'cancel'      && styles.actionCancel,
                      action.style === 'default'     && styles.actionDefault,
                    ]}
                  >
                    {action.label}
                  </Text>
                </Pressable>
              </React.Fragment>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ── Hook for easy imperative usage ──────────────────────────────────
export function useDialog() {
  const [state, setState] = React.useState<Omit<DialogProps, 'visible'> | null>(null);

  const show = React.useCallback((config: Omit<DialogProps, 'visible'>) => {
    setState(config);
  }, []);

  const hide = React.useCallback(() => {
    setState(null);
  }, []);

  const element = state ? (
    <Dialog
      {...state}
      visible
      onDismiss={hide}
      actions={state.actions.map(a => ({
        ...a,
        onPress: () => { a.onPress(); hide(); },
      }))}
    />
  ) : null;

  return { show, hide, element };
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: '#1C1C1E',
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  textBlock: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.base,
    gap: 6,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: FontFamily.semibold,
    color: '#EDEDED',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  message: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 19,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  actionDividerV: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  actions: {
    flexDirection: 'row',
  },
  actionsColumn: {
    flexDirection: 'column',
  },
  action: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionFull: {
    flex: 0,
  },
  actionLabel: {
    fontSize: 15,
    fontFamily: FontFamily.medium,
    color: '#9D5FFF',
  },
  actionDestructive: {
    color: '#FF3B30',
    fontFamily: FontFamily.semibold,
  },
  actionCancel: {
    color: '#888888',
    fontFamily: FontFamily.regular,
  },
  actionDefault: {
    color: '#9D5FFF',
    fontFamily: FontFamily.medium,
  },
});
