import { useColors } from '@/context/theme-context';
import { FontFamily } from '@/constants/typography';
import { Radius, Spring } from '@/constants/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'filled' | 'outline' | 'ghost';
  style?: ViewStyle;
  disabled?: boolean;
}

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  variant = 'filled',
  style,
  disabled = false,
}: PrimaryButtonProps) {
  const colors = useColors();
  const pressed = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed.value ? 0.97 : 1, Spring.stiff) }],
    opacity: disabled ? 0.5 : 1,
  }));

  const gesture = Gesture.Tap()
    .enabled(!disabled && !loading)
    .onBegin(() => { pressed.value = true; })
    .onFinalize(() => { pressed.value = false; })
    .onEnd(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    });

  const inner = loading ? (
    <ActivityIndicator
      size="small"
      color={variant === 'filled' ? colors.accentForeground : colors.textSecondary}
    />
  ) : (
    <Text style={[
      styles.label,
      variant === 'filled' && { color: colors.accentForeground },
      variant !== 'filled' && { color: colors.textSecondary },
    ]}>
      {label}
    </Text>
  );

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[animatedStyle, style]}>
        {variant === 'filled' ? (
          <LinearGradient
            colors={colors.accentGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.filled}
          >
            {inner}
          </LinearGradient>
        ) : variant === 'outline' ? (
          <Animated.View style={[styles.outline, { borderColor: colors.borderStrong }]}>
            {inner}
          </Animated.View>
        ) : (
          <Animated.View style={styles.ghost}>
            {inner}
          </Animated.View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  filled: {
    borderRadius: Radius.full,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: {
    borderRadius: Radius.full,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  ghost: {
    borderRadius: Radius.full,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontFamily: FontFamily.semibold,
    letterSpacing: 0.2,
  },
});
